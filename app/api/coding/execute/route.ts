import { NextRequest, NextResponse } from 'next/server';
import {
  buildExecutionFailureResult,
  evaluateCodingSubmissionReal,
  type CodingLanguage,
} from '@/lib/codingInterview';

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
      result = buildExecutionFailureResult(payload, fallbackReason);
    }

    return NextResponse.json({
      success: true,
      output: result.output,
      error: result.error ?? '',
      status: result.status,
      stdout: result.output,
      stderr: result.error ?? '',
      compile_output: result.status === 'Runtime Error' ? result.error ?? '' : '',
      execution_time_ms: result.executionTimeMs,
      memory_mb: result.memoryMB,
      result,
    });
  } catch (error) {
    console.error('coding execute api error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
