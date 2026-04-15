import { NextRequest, NextResponse } from "next/server";
import {
  buildExecutionFailureResult,
  evaluateCodingSubmissionReal,
  type CodingLanguage,
} from "@/lib/coding/interviewEngine";
import { requireApiAuth, toApiAuthErrorResponse } from "@/lib/apiAuth";
import { z } from "zod";
import {
  enforceComputePayloadLimit,
  enforceComputeRateLimit,
  getComputePolicy,
  isOperationTimeoutError,
  withOperationTimeout,
  type ComputeRouteId,
} from "@/lib/security/computeProtection";

interface ExecuteBody {
  code?: string;
  language?: CodingLanguage;
  questionId?: string;
  mode?: "run" | "submit";
  customInput?: string;
}

const executeBodySchema = z
  .object({
    code: z.string().trim().min(1).max(20000),
    language: z.enum([
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "c",
    ]),
    questionId: z.string().trim().min(1).max(120),
    mode: z.enum(["run", "submit"]),
    customInput: z.string().max(5000).optional(),
  })
  .strict();

const ROUTE_ID: ComputeRouteId = "coding.execute";

export async function POST(req: NextRequest) {
  const payloadLimitResponse = enforceComputePayloadLimit(req, ROUTE_ID);
  if (payloadLimitResponse) {
    return payloadLimitResponse;
  }

  const policy = getComputePolicy(ROUTE_ID);

  let authContext: Awaited<ReturnType<typeof requireApiAuth>>;
  try {
    authContext = await requireApiAuth({ request: req, routeId: ROUTE_ID });
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  const rateLimitResponse = await enforceComputeRateLimit(
    req,
    ROUTE_ID,
    authContext.uid,
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = (await req.json()) as ExecuteBody;
    const parsedBody = executeBodySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Invalid request payload" },
        { status: 400 },
      );
    }

    const sanitizedBody = parsedBody.data;

    const payload = {
      code: sanitizedBody.code,
      language: sanitizedBody.language,
      questionId: sanitizedBody.questionId,
      mode: sanitizedBody.mode,
      customInput: sanitizedBody.customInput,
    } as const;

    let result;

    try {
      result = await withOperationTimeout(
        () => evaluateCodingSubmissionReal(payload),
        policy.timeoutMs,
        ROUTE_ID,
      );
    } catch (error) {
      const fallbackReason = isOperationTimeoutError(error)
        ? "execution timed out"
        : "execution service unavailable";
      result = buildExecutionFailureResult(payload, fallbackReason);
    }

    return NextResponse.json({
      success: true,
      output: result.output,
      error: result.error ?? "",
      status: result.status,
      stdout: result.output,
      stderr: result.error ?? "",
      compile_output:
        result.status === "Runtime Error" ? (result.error ?? "") : "",
      execution_time_ms: result.executionTimeMs,
      memory_mb: result.memoryMB,
      result,
    });
  } catch (error) {
    console.error("coding execute api error", error);
    return NextResponse.json(
      { success: false, message: "Failed to execute code" },
      { status: 500 },
    );
  }
}
