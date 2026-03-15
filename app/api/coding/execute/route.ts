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

      const isCpp = payload.language === 'cpp';
      const normalizedReason = fallbackReason.toLowerCase();
      const isAuthError = fallbackReason.includes('401') || normalizedReason.includes('authorization');
      const isNetworkError =
        normalizedReason.includes('fetch failed') ||
        normalizedReason.includes('timeout') ||
        normalizedReason.includes('enotfound') ||
        normalizedReason.includes('econnreset');

      if (isCpp && (isAuthError || isNetworkError)) {
        const isDev = process.env.NODE_ENV !== 'production';

        if (isDev) {
          try {
            result = await evaluateCppSubmissionLocal(payload);
            return NextResponse.json({ success: true, result });
          } catch (localCppError) {
            result = buildExecutionFailureResult(
              payload,
              `Cloud C++ sandbox failed and local fallback failed: ${
                localCppError instanceof Error ? localCppError.message : 'unknown local execution error'
              }`
            );
            return NextResponse.json({ success: true, result });
          }
        }

        result = buildExecutionFailureResult(
          payload,
          'Cloud code sandbox is temporarily unreachable from deployment runtime. Please retry in a few minutes.'
        );
        return NextResponse.json({ success: true, result });
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
