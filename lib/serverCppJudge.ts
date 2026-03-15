import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  type CodingExecuteRequest,
  type CodingExecuteResult,
  type CodingQuestion,
  type DesignConfig,
  type DesignTestCase,
  type FunctionTestCase,
  type ParamType,
  isDesignTestCase,
  getQuestionById,
} from '@/lib/codingInterview';

const execFileAsync = promisify(execFile);

function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

function parseCaseInput(questionId: string, rawInput: string): unknown {
  const compact = rawInput.trim();

  switch (questionId) {
    case 'two-sum': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      const target = compact.match(/target\s*=\s*([^,\s]+)/i)?.[1] ?? '0';
      return { nums: JSON.parse(nums), target: Number(target) };
    }
    case 'valid-parentheses': {
      const s = compact.match(/s\s*=\s*(".*"|'.*')/i)?.[1] ?? '""';
      return { s: JSON.parse(s.replace(/'/g, '"')) };
    }
    case 'max-subarray': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
    }
    case 'merge-intervals': {
      const intervals = compact.match(/intervals\s*=\s*(\[[\s\S]*\])/i)?.[1] ?? '[]';
      return { intervals: JSON.parse(intervals) };
    }
    case 'binary-tree-level-order': {
      const root = compact.match(/root\s*=\s*(\[[\s\S]*\])/i)?.[1] ?? '[]';
      return { root: JSON.parse(root) };
    }
    case 'word-break': {
      const s = compact.match(/s\s*=\s*(".*?"|'.*?')/i)?.[1] ?? '""';
      const dict = compact.match(/wordDict\s*=\s*(\[[\s\S]*\])/i)?.[1] ?? '[]';
      return {
        s: JSON.parse(s.replace(/'/g, '"')),
        wordDict: JSON.parse(dict.replace(/'/g, '"')),
      };
    }
    case 'number-of-islands': {
      const grid = compact.match(/grid\s*=\s*(\[[\s\S]*\])/i)?.[1] ?? '[]';
      return { grid: JSON.parse(grid.replace(/'/g, '"')) };
    }
    case 'lru-cache': {
      return { ops: compact };
    }
    default:
      return { raw: compact };
  }
}

function parseExpectedValue(questionId: string, rawOutput: string): unknown {
  const compact = rawOutput.trim();

  if (/^\[.*\]$/.test(compact)) {
    try {
      return JSON.parse(compact.replace(/'/g, '"'));
    } catch {
      return compact;
    }
  }

  if (compact === 'true') return true;
  if (compact === 'false') return false;

  const asNumber = Number(compact);
  if (!Number.isNaN(asNumber)) return asNumber;

  return compact;
}

function parseRuntimeOutput(rawOutput: string): unknown {
  const compact = normalizeOutput(rawOutput);
  if (!compact) return '';

  if (/^\[.*\]$/.test(compact) || /^\{.*\}$/.test(compact)) {
    try {
      return JSON.parse(compact);
    } catch {
      return compact;
    }
  }

  if (compact === 'true') return true;
  if (compact === 'false') return false;

  const asNumber = Number(compact);
  if (!Number.isNaN(asNumber)) return asNumber;

  return compact;
}

function toComparable(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return normalizeOutput(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  try {
    return normalizeOutput(JSON.stringify(value));
  } catch {
    return normalizeOutput(String(value));
  }
}

function toCppIntVectorLiteral(values: number[]): string {
  return `{${values.join(',')}}`;
}

function toCpp2DIntVectorLiteral(values: number[][]): string {
  return `{${values.map((row) => `{${row.join(',')}}`).join(',')}}`;
}

function toCppStringVectorLiteral(values: string[]): string {
  return `{${values.map((v) => `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
}

function toCppCharGridLiteral(values: number[][]): string {
  return `{${values.map((row) => `{${row.map((v) => `'${v}'`).join(',')}}`).join(',')}}`;
}

function toCppNullableIntVectorLiteral(values: Array<number | null>): string {
  return `{${values.map((v) => (v === null ? 'INT_MIN' : String(v))).join(',')}}`;
}

function buildCppHarness(question: CodingQuestion, input: unknown): string {
  if (question.id === 'lru-cache') {
    return `
int main() {
  string script = ${JSON.stringify((input as { ops: string }).ops)};
  smatch cap;
  regex_search(script, cap, regex("LRUCache\\\\((\\\\d+)\\\\)", regex::icase));
  int capacity = cap.empty() ? 0 : stoi(cap[1].str());
  LRUCache cache(capacity);

  vector<string> parts;
  string token;
  stringstream ss(script);
  while (getline(ss, token, ',')) parts.push_back(token);

  vector<string> out = {"null"};
  regex putRe("^\\\\s*put\\\\(([-]?[0-9]+)\\\\s*,\\\\s*([-]?[0-9]+)\\\\)\\\\s*$", regex::icase);
  regex getRe("^\\\\s*get\\\\(([-]?[0-9]+)\\\\)\\\\s*$", regex::icase);

  for (size_t i = 1; i < parts.size(); i++) {
    smatch m;
    if (regex_match(parts[i], m, putRe)) {
      cache.put(stoi(m[1].str()), stoi(m[2].str()));
      out.push_back("null");
    } else if (regex_match(parts[i], m, getRe)) {
      out.push_back(to_string(cache.get(stoi(m[1].str()))));
    }
  }

  cout << "[";
  for (size_t i = 0; i < out.size(); i++) {
    if (i) cout << ",";
    cout << out[i];
  }
  cout << "]";
  return 0;
}`;
  }

  if (question.id === 'binary-tree-level-order') {
    const root = (input as { root: Array<number | null> }).root ?? [];
    return `
TreeNode* buildTree(const vector<int>& vals) {
  if (vals.empty()) return nullptr;
  vector<TreeNode*> nodes;
  nodes.reserve(vals.size());
  for (int v : vals) nodes.push_back(v == INT_MIN ? nullptr : new TreeNode(v));
  int i = 0;
  for (int j = 1; j < (int)nodes.size(); j += 2) {
    while (i < (int)nodes.size() && nodes[i] == nullptr) i++;
    if (i >= (int)nodes.size()) break;
    TreeNode* parent = nodes[i++];
    parent->left = nodes[j];
    parent->right = (j + 1 < (int)nodes.size()) ? nodes[j + 1] : nullptr;
  }
  return nodes[0];
}

int main() {
  vector<int> values = ${toCppNullableIntVectorLiteral(root)};
  TreeNode* root = buildTree(values);
  auto result = Solution().levelOrder(root);
  cout << "[";
  for (size_t i = 0; i < result.size(); i++) {
    if (i) cout << ",";
    cout << "[";
    for (size_t j = 0; j < result[i].size(); j++) {
      if (j) cout << ",";
      cout << result[i][j];
    }
    cout << "]";
  }
  cout << "]";
  return 0;
}`;
  }

  if (question.id === 'two-sum') {
    const data = input as { nums: number[]; target: number };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  int target = ${data.target ?? 0};
  auto result = Solution().twoSum(nums, target);
  cout << "[";
  for (size_t i = 0; i < result.size(); i++) {
    if (i) cout << ",";
    cout << result[i];
  }
  cout << "]";
  return 0;
}`;
  }

  if (question.id === 'valid-parentheses') {
    const data = input as { s: string };
    return `
int main() {
  string s = ${JSON.stringify(data.s ?? '')};
  cout << (Solution().isValid(s) ? "true" : "false");
  return 0;
}`;
  }

  if (question.id === 'max-subarray') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << Solution().maxSubArray(nums);
  return 0;
}`;
  }

  if (question.id === 'merge-intervals') {
    const data = input as { intervals: number[][] };
    return `
int main() {
  vector<vector<int>> intervals = ${toCpp2DIntVectorLiteral(data.intervals ?? [])};
  auto result = Solution().merge(intervals);
  cout << "[";
  for (size_t i = 0; i < result.size(); i++) {
    if (i) cout << ",";
    cout << "[" << result[i][0] << "," << result[i][1] << "]";
  }
  cout << "]";
  return 0;
}`;
  }

  if (question.id === 'word-break') {
    const data = input as { s: string; wordDict: string[] };
    return `
int main() {
  string s = ${JSON.stringify(data.s ?? '')};
  vector<string> dict = ${toCppStringVectorLiteral(data.wordDict ?? [])};
  cout << (Solution().wordBreak(s, dict) ? "true" : "false");
  return 0;
}`;
  }

  if (question.id === 'number-of-islands') {
    const data = input as { grid: number[][] };
    return `
int main() {
  vector<vector<char>> grid = ${toCppCharGridLiteral(data.grid ?? [])};
  cout << Solution().numIslands(grid);
  return 0;
}`;
  }

  return 'int main() { return 0; }';
}

// ── Design-problem C++ harness (local judge) ──────────────────

function castCppDesignParam(value: unknown, paramType: ParamType | undefined): string {
  if (paramType === 'string') return JSON.stringify(String(value));
  if (paramType === 'int[]') return toCppIntVectorLiteral(value as number[]);
  if (paramType === 'int[][]') return toCpp2DIntVectorLiteral(value as number[][]);
  if (paramType === 'string[]') return toCppStringVectorLiteral(value as string[]);
  if (paramType === 'boolean') return (value as boolean) ? 'true' : 'false';
  return String(value);
}

function buildCppDesignHarness(config: DesignConfig, testCase: DesignTestCase): string {
  const { className, constructorParamTypes, methods } = config;
  const lines: string[] = ['int main() {', '  vector<string> _out;'];

  for (let i = 0; i < testCase.operations.length; i++) {
    const op = testCase.operations[i];
    const params = testCase.parameters[i] as unknown[];

    if (i === 0) {
      const args = params.map((p, idx) => castCppDesignParam(p, constructorParamTypes[idx])).join(', ');
      if (args.length === 0) {
        lines.push(`  ${className} _obj{};`);
      } else {
        lines.push(`  ${className} _obj(${args});`);
      }
      lines.push('  _out.push_back("null");');
    } else {
      const methodSig = methods[op];
      if (!methodSig) { lines.push('  _out.push_back("null");'); continue; }
      const args = params.map((p, idx) => castCppDesignParam(p, methodSig.paramTypes[idx])).join(', ');
      if (methodSig.returnType === 'void') {
        lines.push(`  _obj.${op}(${args}); _out.push_back("null");`);
      } else if (methodSig.returnType === 'boolean') {
        lines.push(`  _out.push_back(_obj.${op}(${args}) ? "true" : "false");`);
      } else {
        lines.push(`  _out.push_back(to_string(_obj.${op}(${args})));`);
      }
    }
  }

  lines.push('  cout << "[";');
  lines.push('  for (size_t _i = 0; _i < _out.size(); _i++) {');
  lines.push('    if (_i) cout << ",";');
  lines.push('    cout << _out[_i];');
  lines.push('  }');
  lines.push('  cout << "]";');
  lines.push('  return 0;');
  lines.push('}');
  return lines.join('\n');
}

function buildCppDesignSource(question: CodingQuestion, userCode: string, testCase: DesignTestCase): string {
  return `#include <bits/stdc++.h>
using namespace std;

${userCode}

${buildCppDesignHarness(question.designConfig!, testCase)}
`;
}

function buildCppSource(question: CodingQuestion, userCode: string, input: unknown): string {
  const treePrelude =
    question.id === 'binary-tree-level-order'
      ? 'struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x): val(x), left(nullptr), right(nullptr) {} };\n\n'
      : '';

  return `#include <bits/stdc++.h>
using namespace std;

${treePrelude}${userCode}

${buildCppHarness(question, input)}
`;
}

async function compileAndRunCpp(source: string): Promise<{ stdout: string; stderr: string; compileError?: string }> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `cpp-judge-${randomUUID()}-`));
  const sourcePath = path.join(tempDir, 'main.cpp');
  const exePath = path.join(tempDir, process.platform === 'win32' ? 'main.exe' : 'main');

  try {
    await fs.writeFile(sourcePath, source, 'utf8');

    try {
      await execFileAsync('g++', ['-std=c++17', sourcePath, '-O2', '-o', exePath], {
        timeout: 12000,
        windowsHide: true,
      });
    } catch (error) {
      // Detect missing g++ binary (e.g. serverless/cloud environments)
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return {
          stdout: '',
          stderr: '',
          compileError:
            'C++ compiler (g++) is not available in this environment. Please use JavaScript or Python instead.',
        };
      }
      const compileError = error instanceof Error ? error.message : 'Compilation failed';
      return { stdout: '', stderr: '', compileError };
    }

    try {
      const { stdout, stderr } = await execFileAsync(exePath, [], {
        timeout: 5000,
        windowsHide: true,
      });
      return { stdout: stdout ?? '', stderr: stderr ?? '' };
    } catch (error) {
      const runtime = error instanceof Error ? error.message : 'Runtime failed';
      return { stdout: '', stderr: runtime };
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function buildFeedback(question: CodingQuestion, status: CodingExecuteResult['status'], coverage: number) {
  const suggestions: string[] = [];

  if (status !== 'Accepted') {
    suggestions.push('Review edge cases and input constraints.');
  }

  if (coverage < 1) {
    suggestions.push('Add guard handling for boundary inputs and empty structures.');
  }

  return {
    summary:
      status === 'Accepted'
        ? 'Great job. The submission passed all evaluated tests.'
        : `Submission status: ${status}. Keep iterating on logic and edge cases.`,
    timeComplexity: question.timeComplexity,
    spaceComplexity: question.spaceComplexity,
    bestPractices: question.bestPractices,
    optimizationSuggestions: suggestions,
    explanation: question.solutionExplanation,
  };
}

export async function evaluateCppSubmissionLocal(payload: CodingExecuteRequest): Promise<CodingExecuteResult> {
  const question = getQuestionById(payload.questionId);

  if (!question) {
    throw new Error('Question not found for local C++ judge.');
  }

  const tests = question.problemType === 'DESIGN'
    ? (payload.mode === 'submit' ? question.hiddenTestCases : question.examples)
    : payload.mode === 'submit'
      ? question.hiddenTestCases
      : payload.customInput?.trim()
        ? [{ input: payload.customInput.trim(), output: '' } as FunctionTestCase]
        : question.examples;

  let passed = 0;
  let output = '';
  let totalTime = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    // Route design vs function source building
    const source = isDesignTestCase(test)
      ? buildCppDesignSource(question, payload.code, test)
      : buildCppSource(question, payload.code, parseCaseInput(question.id, (test as FunctionTestCase).input));

    const start = Date.now();
    const run = await compileAndRunCpp(source);
    totalTime += Date.now() - start;

    if (run.compileError) {
      return {
        status: 'Runtime Error',
        output,
        error: run.compileError,
        executionTimeMs: totalTime,
        memoryMB: 48,
        passed,
        total: tests.length,
        aiFeedback: buildFeedback(question, 'Runtime Error', passed / Math.max(1, tests.length)),
      };
    }

    if (run.stderr) {
      return {
        status: run.stderr.toLowerCase().includes('time') ? 'Time Limit Exceeded' : 'Runtime Error',
        output,
        error: run.stderr,
        executionTimeMs: totalTime,
        memoryMB: 48,
        passed,
        total: tests.length,
        aiFeedback: buildFeedback(question, 'Runtime Error', passed / Math.max(1, tests.length)),
      };
    }

    const actual = toComparable(parseRuntimeOutput(run.stdout));

    let expected: string;
    if (isDesignTestCase(test)) {
      expected = toComparable(test.expected);
    } else {
      const ft = test as FunctionTestCase;
      if (payload.mode === 'run' && payload.customInput?.trim() && !ft.output) {
        passed += 1;
        output += `Case ${i + 1}: ${actual || '(no output)'}${i < tests.length - 1 ? '\n' : ''}`;
        continue;
      }
      expected = toComparable(parseExpectedValue(question.id, ft.output));
    }

    if (actual === expected) passed += 1;

    output += `Case ${i + 1}: ${actual || '(no output)'}${i < tests.length - 1 ? '\n' : ''}`;
  }

  const accepted = passed === tests.length;
  const status: CodingExecuteResult['status'] = accepted ? 'Accepted' : 'Wrong Answer';
  const coverage = passed / Math.max(1, tests.length);

  return {
    status,
    output:
      payload.mode === 'submit'
        ? accepted
          ? `All hidden tests passed (${passed}/${tests.length}).`
          : `Hidden tests passed: ${passed}/${tests.length}.`
        : output,
    error: accepted ? undefined : payload.mode === 'submit' ? 'Logic mismatch on hidden cases. Revisit edge cases and constraints.' : 'Some test cases failed. Check your output against the expected values.',
    executionTimeMs: totalTime,
    memoryMB: 48,
    passed,
    total: tests.length,
    aiFeedback: buildFeedback(question, status, coverage),
  };
}
