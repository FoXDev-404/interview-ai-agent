import { NextRequest, NextResponse } from 'next/server';
import {
  buildExecutionFailureResult,
  evaluateCodingSubmissionReal,
  type CodingLanguage,
} from '@/lib/codingInterview';
import { evaluateCppSubmissionLocal } from '@/lib/serverCppJudge';

interface ExecuteBody {
  code?: string;
  language?: CodingLanguage;
  questionId?: string;
  mode?: 'run' | 'submit';
  customInput?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteBody;

    if (!body.code || !body.language || !body.questionId || !body.mode) {
      return NextResponse.json(
        { message: 'Missing required fields: code, language, questionId, mode' },
        { status: 400 }
      );
    }

    const payload = {
      code: body.code,
      language: body.language,
      questionId: body.questionId,
      mode: body.mode,
      customInput: body.customInput,
    } as const;

    let result;

    try {
      result = await evaluateCodingSubmissionReal(payload);
    } catch (realJudgeError) {
      const fallbackReason =
        realJudgeError instanceof Error ? realJudgeError.message : 'unknown sandbox error';

      if (payload.language === 'cpp' && fallbackReason.includes('401')) {
        // Do not attempt local g++ judge in serverless/cloud environments where g++ is unavailable
        const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_WORKER_RUNTIME);
        if (isServerless) {
          result = buildExecutionFailureResult(
            payload,
            'C++ execution is not available in this environment. Please use JavaScript or Python instead.'
          );
          return NextResponse.json({ success: true, result });
        }
        try {
          result = await evaluateCppSubmissionLocal(payload);
          return NextResponse.json({ success: true, result });
        } catch (localCppError) {
          result = buildExecutionFailureResult(
            payload,
            `Local C++ judge failed: ${
              localCppError instanceof Error ? localCppError.message : 'unknown local execution error'
            }`
          );
          return NextResponse.json({ success: true, result });
        }
      }

      result = buildExecutionFailureResult(payload, fallbackReason);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('coding execute api error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
