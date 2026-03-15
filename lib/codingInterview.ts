export type CodingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// ──────────────────────────────────────────────────────────────
// Design-problem type system
// ──────────────────────────────────────────────────────────────

export type ParamType = 'int' | 'int[]' | 'int[][]' | 'string' | 'string[]' | 'double' | 'boolean';

export interface DesignMethodSignature {
  paramTypes: ParamType[];
  returnType: 'int' | 'void' | 'boolean' | 'double' | 'string';
}

export interface DesignConfig {
  className: string;
  constructorParamTypes: ParamType[];
  methods: Record<string, DesignMethodSignature>;
}

export interface FunctionTestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface DesignTestCase {
  operations: string[];
  parameters: unknown[][];
  expected: Array<number | string | boolean | null>;
  explanation?: string;
}

export type CodingTestCase = FunctionTestCase | DesignTestCase;

export function isDesignTestCase(tc: CodingTestCase): tc is DesignTestCase {
  return 'operations' in tc && Array.isArray((tc as DesignTestCase).operations);
}

// ──────────────────────────────────────────────────────────────

export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  examples: CodingTestCase[];
  constraints: string[];
  hints: string[];
  editorial: string;
  functionName: string;
  starterCode: Record<CodingLanguage, string>;
  hiddenTestCases: CodingTestCase[];
  expectedKeywords: string[];
  solutionExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  bestPractices: string[];
  /** Defaults to 'FUNCTION' when absent. */
  problemType?: 'FUNCTION' | 'DESIGN';
  designConfig?: DesignConfig;
}

interface GenerateCodingQuestionSetParams {
  role: string;
  level: string;
  language: CodingLanguage;
}

export interface CodingExecuteRequest {
  code: string;
  language: CodingLanguage;
  questionId: string;
  mode: 'run' | 'submit';
  customInput?: string;
}

export interface CodingExecuteResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Memory Limit Exceeded';
  output: string;
  error?: string;
  executionTimeMs: number;
  memoryMB: number;
  passed: number;
  total: number;
  aiFeedback: {
    summary: string;
    timeComplexity: string;
    spaceComplexity: string;
    bestPractices: string[];
    optimizationSuggestions: string[];
    explanation: string;
  };
}

interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  runTimeMs: number;
}

const LANG_LABELS: Record<CodingLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
};

export const CODING_LANGUAGES: Array<{ value: CodingLanguage; label: string; monaco: string }> = [
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'c', label: 'C', monaco: 'c' },
];

const QUESTION_POOL: CodingQuestion[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    description:
      'Given an integer array nums and an integer target, return indices of the two numbers such that they add up to target. You may assume exactly one solution exists, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10000', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    hints: ['A hash map can store number -> index while scanning once.', 'Check complement before inserting current value.'],
    editorial:
      'Use a hash map for O(n) lookup. For each value x at index i, compute complement target - x. If complement is already in the map, return [map[complement], i]. Otherwise store x -> i.',
    functionName: 'twoSum',
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n}\n',
      typescript: 'function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def twoSum(nums, target):\n    # Write your solution here\n    return []\n',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: '#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n',
    },
    hiddenTestCases: [
      { input: 'nums = [1,5,3,7], target = 12', output: '[1,3]' },
      { input: 'nums = [10,20,30,40], target = 70', output: '[2,3]' },
      { input: 'nums = [-3,4,3,90], target = 0', output: '[0,2]' },
    ],
    expectedKeywords: ['map', 'dict', 'unordered_map', 'hash', 'complement'],
    solutionExplanation:
      'A one-pass hash table keeps seen numbers and their indices. For each number, check if its complement has already appeared.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    bestPractices: ['Use clear variable names like complement and indexByValue.', 'Return early once a valid pair is found.'],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    description:
      'Given a string s containing just the characters ()[]{} determine if the input string is valid. An input string is valid if open brackets are closed by the same type and in the correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "([)]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10000', 's consists of parentheses only: ()[]{}'],
    hints: ['Use a stack for opening brackets.', 'On closing bracket, verify stack top matches expected opening bracket.'],
    editorial:
      'Traverse chars. Push opening symbols. For closing symbols, stack must be non-empty and top must match pair. At end stack must be empty.',
    functionName: 'isValid',
    starterCode: {
      javascript: 'function isValid(s) {\n  // Write your solution here\n}\n',
      typescript: 'function isValid(s: string): boolean {\n  // Write your solution here\n  return false;\n}\n',
      python: 'def isValid(s):\n    # Write your solution here\n    return False\n',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}\n',
      cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};\n',
      c: '#include <stdbool.h>\n\nbool isValid(char* s) {\n    // Write your solution here\n    return false;\n}\n',
    },
    hiddenTestCases: [
      { input: 's = "(((())))"', output: 'true' },
      { input: 's = "(("', output: 'false' },
      { input: 's = "{[()]}"', output: 'true' },
    ],
    expectedKeywords: ['stack', 'push', 'pop'],
    solutionExplanation: 'A stack naturally models nested open-close ordering.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    bestPractices: ['Handle empty stack checks before pop.', 'Use a map for close-to-open bracket pairs.'],
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: ['1 <= nums.length <= 100000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Kadane\'s algorithm tracks best ending at current index.', 'Reset running sum when it hurts future subarrays.'],
    editorial:
      'Maintain currentBest and globalBest. currentBest = max(nums[i], currentBest + nums[i]). Update globalBest each step.',
    functionName: 'maxSubArray',
    starterCode: {
      javascript: 'function maxSubArray(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function maxSubArray(nums: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def maxSubArray(nums):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int maxSubArray(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    hiddenTestCases: [
      { input: 'nums = [-1,-2,-3]', output: '-1' },
      { input: 'nums = [1,2,3,4]', output: '10' },
      { input: 'nums = [8,-19,5,-4,20]', output: '21' },
    ],
    expectedKeywords: ['max', 'current', 'kadane'],
    solutionExplanation: 'Kadane\'s algorithm computes the best subarray ending at each index in one pass.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    bestPractices: ['Initialize with first element to handle all-negative arrays.', 'Keep logic in a single clean loop.'],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    description:
      'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of non-overlapping intervals covering all intervals.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: ['1 <= intervals.length <= 10000', 'intervals[i].length == 2', '0 <= starti <= endi <= 10000'],
    hints: ['Sort intervals by start time first.', 'Merge with the last result interval while overlapping.'],
    editorial: 'Sort by start. Iterate and merge if current.start <= last.end, else append new interval.',
    functionName: 'merge',
    starterCode: {
      javascript: 'function merge(intervals) {\n  // Write your solution here\n}\n',
      typescript: 'function merge(intervals: number[][]): number[][] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def merge(intervals):\n    # Write your solution here\n    return []\n',
      java: 'import java.util.*;\n\nclass Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n        return new int[][]{};\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: 'int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {\n    // Write your solution here\n    *returnSize = 0;\n    return 0;\n}\n',
    },
    hiddenTestCases: [
      { input: 'intervals = [[1,4],[0,4]]', output: '[[0,4]]' },
      { input: 'intervals = [[1,4],[5,6]]', output: '[[1,4],[5,6]]' },
      { input: 'intervals = [[2,3],[4,5],[6,7],[8,9],[1,10]]', output: '[[1,10]]' },
    ],
    expectedKeywords: ['sort', 'merge', 'interval'],
    solutionExplanation: 'Sorting by start enables a linear merge pass over intervals.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestPractices: ['Sort first, then merge in one pass.', 'Use helper variables for readability.'],
  },
  {
    id: 'binary-tree-level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'BFS', 'Queue'],
    description:
      'Given the root of a binary tree, return the level order traversal of its nodes\' values (from left to right, level by level).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
    ],
    constraints: ['0 <= number of nodes <= 2000', '-1000 <= Node.val <= 1000'],
    hints: ['Use a queue and process one level at a time.', 'Track queue size before each level loop.'],
    editorial: 'Classic BFS: pop size items per level and push children.',
    functionName: 'levelOrder',
    starterCode: {
      javascript: 'function levelOrder(root) {\n  // Write your solution here\n}\n',
      typescript: 'function levelOrder(root: any): number[][] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def levelOrder(root):\n    # Write your solution here\n    return []\n',
      java: 'import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: '// Assume tree helpers are available in platform runtime\nint** levelOrder(void* root) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    hiddenTestCases: [
      { input: 'root = []', output: '[]' },
      { input: 'root = [1,2,3,4,5,null,6]', output: '[[1],[2,3],[4,5,6]]' },
      { input: 'root = [1,null,2,3]', output: '[[1],[2],[3]]' },
    ],
    expectedKeywords: ['queue', 'level', 'while'],
    solutionExplanation: 'Level-order traversal is naturally solved using BFS with a queue.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    bestPractices: ['Guard null root early.', 'Use queue size to separate levels.'],
  },
  {
    id: 'word-break',
    title: 'Word Break',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    description:
      'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000'],
    hints: ['Use dp[i] to mean s[0:i] can be segmented.', 'Try previous split points j < i.'],
    editorial: 'DP over prefixes with hash set dictionary lookup.',
    functionName: 'wordBreak',
    starterCode: {
      javascript: 'function wordBreak(s, wordDict) {\n  // Write your solution here\n}\n',
      typescript: 'function wordBreak(s: string, wordDict: string[]): boolean {\n  // Write your solution here\n  return false;\n}\n',
      python: 'def wordBreak(s, wordDict):\n    # Write your solution here\n    return False\n',
      java: 'import java.util.*;\n\nclass Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        // Write your solution here\n        return false;\n    }\n}\n',
      cpp: '#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        // Write your solution here\n        return false;\n    }\n};\n',
      c: '#include <stdbool.h>\n\nbool wordBreak(char* s, char** wordDict, int wordDictSize) {\n    // Write your solution here\n    return false;\n}\n',
    },
    hiddenTestCases: [
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true' },
      { input: 's = "cars", wordDict = ["car","ca","rs"]', output: 'true' },
      { input: 's = "aaaaaaa", wordDict = ["aaaa","aaa"]', output: 'true' },
    ],
    expectedKeywords: ['dp', 'set', 'substring'],
    solutionExplanation: 'Use dynamic programming over string prefixes with dictionary lookup in a set.',
    timeComplexity: 'O(n^2)',
    spaceComplexity: 'O(n)',
    bestPractices: ['Use a set for O(1) word lookup.', 'Break inner loop early once dp[i] is true.'],
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Graph', 'DFS', 'BFS', 'Matrix'],
    description: 'Given an m x n grid of 1s (land) and 0s (water), return the number of islands.',
    examples: [
      { input: 'grid = [[1,1,0],[0,1,0],[1,0,1]]', output: '3' },
      { input: 'grid = [[1,1,1],[0,1,0],[1,1,1]]', output: '1' },
    ],
    constraints: ['1 <= m, n <= 300', 'grid[i][j] is either 0 or 1'],
    hints: ['Traverse each cell.', 'On land, run DFS/BFS and mark visited.'],
    editorial: 'Count connected components in a binary grid using flood fill.',
    functionName: 'numIslands',
    starterCode: {
      javascript: 'function numIslands(grid) {\n  // Write your solution here\n}\n',
      typescript: 'function numIslands(grid: string[][]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def numIslands(grid):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int numIslands(char** grid, int gridSize, int* gridColSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    hiddenTestCases: [
      { input: 'grid = [[1,0,1],[0,1,0],[1,0,1]]', output: '5' },
      { input: 'grid = [[1,1],[1,1]]', output: '1' },
      { input: 'grid = [[0,0],[0,0]]', output: '0' },
    ],
    expectedKeywords: ['dfs', 'bfs', 'visited'],
    solutionExplanation: 'Use DFS/BFS flood fill to mark each discovered island once.',
    timeComplexity: 'O(m*n)',
    spaceComplexity: 'O(m*n)',
    bestPractices: ['Avoid revisiting cells by mutating grid or using visited array.', 'Extract direction vectors to keep traversal clean.'],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'Hard',
    tags: ['Hash Map', 'Design', 'Linked List'],
    description:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.',
    examples: [
      {
        operations: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
        parameters: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
        explanation: 'Capacity 2. After put(3,3) key 2 is evicted; after put(4,4) key 1 is evicted.',
      },
      {
        operations: ['LRUCache', 'put', 'get', 'put', 'get'],
        parameters: [[1], [2, 1], [2], [3, 2], [2]],
        expected: [null, null, 1, null, -1],
        explanation: 'Capacity 1. After put(3,2) key 2 is evicted.',
      },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10000', 'At most 2*10^5 operations'],
    hints: ['Use hashmap + doubly linked list for O(1).', 'Move recently accessed nodes to the front.'],
    editorial:
      'Maintain doubly linked list ordered by recency and map key->node. On get/put, move node to front. Evict tail when over capacity.',
    functionName: 'LRUCache',
    starterCode: {
      javascript: 'class LRUCache {\n  constructor(capacity) {\n    // Write your solution here\n  }\n\n  get(key) {\n    return -1;\n  }\n\n  put(key, value) {\n    // Write your solution here\n  }\n}\n',
      typescript: 'class LRUCache {\n  constructor(capacity: number) {\n    // Write your solution here\n  }\n\n  get(key: number): number {\n    return -1;\n  }\n\n  put(key: number, value: number): void {\n    // Write your solution here\n  }\n}\n',
      python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        # Write your solution here\n        pass\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        # Write your solution here\n        pass\n',
      java: 'class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your solution here\n    }\n\n    public int get(int key) {\n        return -1;\n    }\n\n    public void put(int key, int value) {\n        // Write your solution here\n    }\n}\n',
      cpp: '#include <unordered_map>\nusing namespace std;\n\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Write your solution here\n    }\n\n    int get(int key) {\n        return -1;\n    }\n\n    void put(int key, int value) {\n        // Write your solution here\n    }\n};\n',
      c: '#include <stdlib.h>\n\ntypedef struct LRUCache LRUCache;\n\nLRUCache* lRUCacheCreate(int capacity) {\n    // Write your solution here\n    return NULL;\n}\n\nint lRUCacheGet(LRUCache* obj, int key) {\n    return -1;\n}\n\nvoid lRUCachePut(LRUCache* obj, int key, int value) {\n    // Write your solution here\n}\n',
    },
    hiddenTestCases: [
      {
        operations: ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
        parameters: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
      },
      {
        operations: ['LRUCache', 'put', 'get', 'put', 'get', 'get'],
        parameters: [[1], [2, 1], [2], [3, 2], [2], [3]],
        expected: [null, null, 1, null, -1, 2],
      },
      {
        operations: ['LRUCache', 'put', 'put', 'put', 'put', 'get', 'get'],
        parameters: [[2], [2, 1], [1, 1], [2, 3], [4, 1], [1], [2]],
        expected: [null, null, null, null, null, -1, 3],
      },
    ],
    problemType: 'DESIGN',
    designConfig: {
      className: 'LRUCache',
      constructorParamTypes: ['int'],
      methods: {
        get: { paramTypes: ['int'], returnType: 'int' },
        put: { paramTypes: ['int', 'int'], returnType: 'void' },
      },
    },
    expectedKeywords: ['map', 'list', 'node', 'remove', 'insert'],
    solutionExplanation: 'Combine hashmap for key lookup and doubly linked list for recency order.',
    timeComplexity: 'O(1) average per get/put',
    spaceComplexity: 'O(capacity)',
    bestPractices: ['Separate node operations into helper methods.', 'Handle updates and inserts via common recency path.'],
  },
  {
    id: 'min-stack',
    title: 'Min Stack',
    difficulty: 'Easy',
    tags: ['Stack', 'Design'],
    description:
      'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class with O(1) getMin().',
    examples: [
      {
        operations: ['MinStack', 'push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'],
        parameters: [[], [-2], [0], [-3], [], [], [], []],
        expected: [null, null, null, null, -3, null, 0, -2],
        explanation: 'After pushing -2, 0, -3 the min is -3. After pop() the top is 0 and the new min is -2.',
      },
    ],
    constraints: [
      '-2^31 <= val <= 2^31 - 1',
      'pop, top and getMin operations will always be called on non-empty stacks.',
      'At most 3 * 10^4 calls will be made to push, pop, top, and getMin.',
    ],
    hints: [
      'Use an auxiliary stack that tracks the minimum at each level.',
      'Push to the min-stack only when the new value is <= the current minimum.',
    ],
    editorial:
      'Maintain a secondary min-stack where each entry is the running minimum at that depth. Pop both stacks simultaneously.',
    functionName: 'MinStack',
    starterCode: {
      javascript:
        'class MinStack {\n  constructor() {\n    // Write your solution here\n  }\n\n  push(val) {\n    // Write your solution here\n  }\n\n  pop() {\n    // Write your solution here\n  }\n\n  top() {\n    return -1;\n  }\n\n  getMin() {\n    return -1;\n  }\n}\n',
      typescript:
        'class MinStack {\n  constructor() {\n    // Write your solution here\n  }\n\n  push(val: number): void {\n    // Write your solution here\n  }\n\n  pop(): void {\n    // Write your solution here\n  }\n\n  top(): number {\n    return -1;\n  }\n\n  getMin(): number {\n    return -1;\n  }\n}\n',
      python:
        'class MinStack:\n    def __init__(self):\n        # Write your solution here\n        pass\n\n    def push(self, val: int) -> None:\n        # Write your solution here\n        pass\n\n    def pop(self) -> None:\n        # Write your solution here\n        pass\n\n    def top(self) -> int:\n        return -1\n\n    def getMin(self) -> int:\n        return -1\n',
      java:
        'class MinStack {\n    public MinStack() {\n        // Write your solution here\n    }\n\n    public void push(int val) {\n        // Write your solution here\n    }\n\n    public void pop() {\n        // Write your solution here\n    }\n\n    public int top() {\n        return -1;\n    }\n\n    public int getMin() {\n        return -1;\n    }\n}\n',
      cpp:
        'class MinStack {\npublic:\n    MinStack() {\n        // Write your solution here\n    }\n\n    void push(int val) {\n        // Write your solution here\n    }\n\n    void pop() {\n        // Write your solution here\n    }\n\n    int top() {\n        return -1;\n    }\n\n    int getMin() {\n        return -1;\n    }\n};\n',
      c: '// C does not natively support classes. Use struct + functions.\n// typedef struct MinStack MinStack;\n',
    },
    hiddenTestCases: [
      {
        operations: ['MinStack', 'push', 'push', 'push', 'pop', 'getMin'],
        parameters: [[], [1], [2], [3], [], []],
        expected: [null, null, null, null, null, 1],
      },
      {
        operations: ['MinStack', 'push', 'push', 'getMin', 'push', 'getMin'],
        parameters: [[], [5], [3], [], [2], []],
        expected: [null, null, null, 3, null, 2],
      },
      {
        operations: ['MinStack', 'push', 'push', 'push', 'pop', 'getMin', 'top'],
        parameters: [[], [-3], [0], [-5], [], [], []],
        expected: [null, null, null, null, null, -3, 0],
      },
    ],
    problemType: 'DESIGN',
    designConfig: {
      className: 'MinStack',
      constructorParamTypes: [],
      methods: {
        push: { paramTypes: ['int'], returnType: 'void' },
        pop: { paramTypes: [], returnType: 'void' },
        top: { paramTypes: [], returnType: 'int' },
        getMin: { paramTypes: [], returnType: 'int' },
      },
    },
    expectedKeywords: ['stack', 'min', 'push', 'pop'],
    solutionExplanation:
      'Maintain a secondary min-stack that records the current minimum. Each push also updates the min-stack.',
    timeComplexity: 'O(1) per operation',
    spaceComplexity: 'O(n)',
    bestPractices: [
      'Separate the min tracking into a helper stack.',
      'Handle the pop operation on both stacks simultaneously.',
    ],
  },
];

export function getCodingLanguageLabel(language: CodingLanguage): string {
  return LANG_LABELS[language];
}

export function generateCodingQuestionSet(params: GenerateCodingQuestionSetParams): CodingQuestion[] {
  const { role, level, language } = params;
  const normalizedRole = role.toLowerCase();
  const normalizedLevel = level.toLowerCase();

  let ordered = [...QUESTION_POOL];

  if (normalizedRole.includes('frontend')) {
    ordered = [...QUESTION_POOL].sort((a, b) => {
      const aBoost = a.tags.includes('String') || a.tags.includes('Array') ? 1 : 0;
      const bBoost = b.tags.includes('String') || b.tags.includes('Array') ? 1 : 0;
      return bBoost - aBoost;
    });
  }

  if (normalizedLevel.includes('senior')) {
    ordered = [...ordered].sort((a, b) => {
      const weight = { Easy: 0, Medium: 1, Hard: 2 } as const;
      return weight[b.difficulty] - weight[a.difficulty];
    });
  }

  if (normalizedLevel.includes('junior')) {
    ordered = [...ordered].sort((a, b) => {
      const weight = { Easy: 0, Medium: 1, Hard: 2 } as const;
      return weight[a.difficulty] - weight[b.difficulty];
    });
  }

  // Return all questions from the pool in sorted order.
  const chosen = ordered.slice(0, QUESTION_POOL.length);

  return chosen.map((q) => ({
    ...q,
    starterCode: {
      ...q.starterCode,
      [language]: q.starterCode[language],
    },
  }));
}

export function getQuestionById(questionId: string): CodingQuestion | undefined {
  return QUESTION_POOL.find((q) => q.id === questionId);
}

function buildAIFeedback(
  question: CodingQuestion,
  coverage: number,
  status: CodingExecuteResult['status']
): CodingExecuteResult['aiFeedback'] {
  const baselineSuggestions = [
    'Add short comments for non-obvious logic blocks.',
    'Use explicit edge-case guards at the top of your function.',
  ];

  if (status !== 'Accepted') {
    baselineSuggestions.unshift('Validate your algorithm on the given examples before submitting.');
  }

  const qualityLine =
    coverage > 0.65
      ? 'Your implementation appears aligned with a standard optimal approach.'
      : 'Your implementation may be missing core algorithmic patterns expected for this problem.';

  return {
    summary: `${qualityLine} Focus on correctness first, then optimize readability.`,
    timeComplexity: question.timeComplexity,
    spaceComplexity: question.spaceComplexity,
    bestPractices: question.bestPractices,
    optimizationSuggestions: baselineSuggestions,
    explanation: question.solutionExplanation,
  };
}

function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

function parsePrimitiveValue(raw: string): string | number | boolean {
  const cleaned = raw.trim();
  if (/^".*"$/.test(cleaned) || /^'.*'$/.test(cleaned)) {
    return cleaned.slice(1, -1);
  }
  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;
  const asNumber = Number(cleaned);
  if (!Number.isNaN(asNumber)) return asNumber;
  return cleaned;
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
      return { root: JSON.parse(root.replace(/null/gi, 'null')) };
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

  if (questionId === 'lru-cache') {
    return compact;
  }

  if (/^\[.*\]$/.test(compact)) {
    try {
      return JSON.parse(compact.replace(/'/g, '"'));
    } catch {
      return compact;
    }
  }

  if (compact === 'true') return true;
  if (compact === 'false') return false;

  const num = Number(compact);
  if (!Number.isNaN(num)) return num;

  return parsePrimitiveValue(compact);
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
  if (compact === 'null') return null;

  const asNumber = Number(compact);
  if (!Number.isNaN(asNumber)) return asNumber;

  return compact;
}

function toComparableString(value: unknown): string {
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

function buildJavaScriptHarness(question: CodingQuestion, input: unknown): string {
  if (question.id === 'binary-tree-level-order') {
    return `${JSON.stringify(input)}\n\n` +
`function buildTree(values) {
  if (!values.length) return null;
  const nodes = values.map(v => (v === null ? null : { val: v, left: null, right: null }));
  let i = 0;
  for (let j = 1; j < nodes.length; j += 2) {
    while (i < nodes.length && nodes[i] === null) i++;
    if (i >= nodes.length) break;
    nodes[i].left = nodes[j] ?? null;
    nodes[i].right = nodes[j + 1] ?? null;
    i++;
  }
  return nodes[0];
}

const payload = ${JSON.stringify(input)};
const root = buildTree(payload.root || []);
const result = ${question.functionName}(root);
process.stdout.write(JSON.stringify(result));`;
  }

  if (question.id === 'lru-cache') {
    return `const script = ${JSON.stringify((input as { ops: string }).ops)};
const capacity = Number(script.match(/LRUCache\\((\\d+)\\)/i)?.[1] || 0);
const cache = new LRUCache(capacity);
const calls = script.split(',').map(v => v.trim()).slice(1);
const output = [null];

for (const call of calls) {
  if (/^put\\(/i.test(call)) {
    const [k, v] = call.match(/^put\\((.+)\\)$/i)?.[1].split(/\s*,\s*/) ?? ['0', '0'];
    cache.put(Number(k), Number(v));
    output.push(null);
  } else if (/^get\\(/i.test(call)) {
    const k = call.match(/^get\\((.+)\\)$/i)?.[1] ?? '0';
    output.push(cache.get(Number(k)));
  }
}

process.stdout.write(JSON.stringify(output));`;
  }

  const payload = JSON.stringify(input);

  switch (question.id) {
    case 'two-sum':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums, payload.target);\nprocess.stdout.write(JSON.stringify(result));`;
    case 'valid-parentheses':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.s);\nprocess.stdout.write(String(result));`;
    case 'max-subarray':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(String(result));`;
    case 'merge-intervals':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.intervals);\nprocess.stdout.write(JSON.stringify(result));`;
    case 'word-break':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.s, payload.wordDict);\nprocess.stdout.write(String(result));`;
    case 'number-of-islands':
      return `const payload = ${payload};\nconst grid = payload.grid.map(row => row.map(cell => String(cell)));\nconst result = ${question.functionName}(grid);\nprocess.stdout.write(String(result));`;
    default:
      return `const result = ${question.functionName}();\nprocess.stdout.write(JSON.stringify(result));`;
  }
}

function buildPythonHarness(question: CodingQuestion, input: unknown): string {
  if (question.id === 'binary-tree-level-order') {
    return `import json

class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def build_tree(values):
    if not values:
        return None
    nodes = [None if v is None else Node(v) for v in values]
    i = 0
    for j in range(1, len(nodes), 2):
        while i < len(nodes) and nodes[i] is None:
            i += 1
        if i >= len(nodes):
            break
        nodes[i].left = nodes[j] if j < len(nodes) else None
        nodes[i].right = nodes[j+1] if j + 1 < len(nodes) else None
        i += 1
    return nodes[0]

payload = json.loads(${JSON.stringify(JSON.stringify(input))})
root = build_tree(payload.get('root', []))
result = ${question.functionName}(root)
print(json.dumps(result), end='')`;
  }

  if (question.id === 'lru-cache') {
    return `import json, re

script = ${JSON.stringify((input as { ops: string }).ops)}
capacity = int(re.search(r'LRUCache\\((\\d+)\\)', script, flags=re.I).group(1))
cache = LRUCache(capacity)
calls = [part.strip() for part in script.split(',')][1:]
output = [None]

for call in calls:
    if call.lower().startswith('put('):
      inside = re.search(r'put\\((.+)\\)', call, flags=re.I).group(1)
      k, v = [int(x.strip()) for x in inside.split(',')]
      cache.put(k, v)
      output.append(None)
    elif call.lower().startswith('get('):
      inside = re.search(r'get\\((.+)\\)', call, flags=re.I).group(1)
      output.append(cache.get(int(inside)))

print(json.dumps(output), end='')`;
  }

  const payload = JSON.stringify(JSON.stringify(input));
  switch (question.id) {
    case 'two-sum':
      return `import json\npayload = json.loads(${payload})\nresult = ${question.functionName}(payload['nums'], payload['target'])\nprint(json.dumps(result), end='')`;
    case 'valid-parentheses':
      return `import json\npayload = json.loads(${payload})\nprint(str(${question.functionName}(payload['s'])).lower(), end='')`;
    case 'max-subarray':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['nums']), end='')`;
    case 'merge-intervals':
      return `import json\npayload = json.loads(${payload})\nprint(json.dumps(${question.functionName}(payload['intervals'])), end='')`;
    case 'word-break':
      return `import json\npayload = json.loads(${payload})\nprint(str(${question.functionName}(payload['s'], payload['wordDict'])).lower(), end='')`;
    case 'number-of-islands':
      return `import json\npayload = json.loads(${payload})\ngrid = [[str(c) for c in row] for row in payload['grid']]\nprint(${question.functionName}(grid), end='')`;
    default:
      return `print(${question.functionName}(), end='')`;
  }
}

function escapeJavaString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function toJavaIntArrayLiteral(values: number[]): string {
  return `new int[]{${values.join(',')}}`;
}

function toJava2DIntArrayLiteral(values: number[][]): string {
  return `new int[][]{${values.map((row) => `{${row.join(',')}}`).join(',')}}`;
}

function toJavaCharGridLiteral(values: number[][]): string {
  return `new char[][]{${values
    .map((row) => `{${row.map((v) => `'${v}'`).join(',')}}`)
    .join(',')}}`;
}

function toJavaStringListLiteral(values: string[]): string {
  if (!values.length) return 'java.util.Collections.emptyList()';
  return `java.util.Arrays.asList(${values.map((v) => `"${escapeJavaString(v)}"`).join(',')})`;
}

function toJavaNullableIntegerListLiteral(values: Array<number | null>): string {
  if (!values.length) return 'java.util.Collections.emptyList()';
  return `java.util.Arrays.asList(${values.map((v) => (v === null ? 'null' : String(v))).join(',')})`;
}

function buildJavaInlineHarness(question: CodingQuestion, input: unknown): string {
  if (question.id === 'lru-cache') {
    return `
class Main {
  public static void main(String[] args) {
    String script = ${JSON.stringify((input as { ops: string }).ops)};
    java.util.regex.Matcher cap = java.util.regex.Pattern.compile("LRUCache\\\\((\\\\d+)\\\\)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(script);
    int capacity = cap.find() ? Integer.parseInt(cap.group(1)) : 0;
    LRUCache cache = new LRUCache(capacity);
    String[] calls = script.split(",");
    java.util.List<Object> out = new java.util.ArrayList<>();
    out.add(null);
    for (int i = 1; i < calls.length; i++) {
      String call = calls[i].trim();
      if (call.toLowerCase().startsWith("put(")) {
        String inside = call.replaceAll("(?i)^put\\\\((.+)\\\\)$", "$1");
        String[] kv = inside.split("\\\\s*,\\\\s*");
        cache.put(Integer.parseInt(kv[0]), Integer.parseInt(kv[1]));
        out.add(null);
      } else if (call.toLowerCase().startsWith("get(")) {
        String inside = call.replaceAll("(?i)^get\\\\((.+)\\\\)$", "$1");
        out.add(cache.get(Integer.parseInt(inside)));
      }
    }
    System.out.print(out.toString().replace(" ", ""));
  }
}`;
  }

  if (question.id === 'binary-tree-level-order') {
    const rootValues = (input as { root: Array<number | null> }).root ?? [];
    return `
class TreeNode {
  int val;
  TreeNode left;
  TreeNode right;
  TreeNode(int val) { this.val = val; }
}

class BuildTree {
  static TreeNode fromLevelOrder(java.util.List<Integer> values) {
    if (values.isEmpty()) return null;
    java.util.List<TreeNode> nodes = new java.util.ArrayList<>();
    for (Integer v : values) nodes.add(v == null ? null : new TreeNode(v));
    int i = 0;
    for (int j = 1; j < nodes.size(); j += 2) {
      while (i < nodes.size() && nodes.get(i) == null) i++;
      if (i >= nodes.size()) break;
      TreeNode parent = nodes.get(i++);
      parent.left = nodes.get(j);
      parent.right = (j + 1 < nodes.size()) ? nodes.get(j + 1) : null;
    }
    return nodes.get(0);
  }
}

class Main {
  public static void main(String[] args) {
    java.util.List<Integer> values = ${toJavaNullableIntegerListLiteral(rootValues)};
    TreeNode root = BuildTree.fromLevelOrder(values);
    System.out.print(new Solution().levelOrder(root).toString().replace(" ", ""));
  }
}`;
  }

  if (question.id === 'two-sum') {
    const data = input as { nums: number[]; target: number };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    int target = ${data.target ?? 0};
    System.out.print(java.util.Arrays.toString(new Solution().twoSum(nums, target)).replace(" ", ""));
  }
}`;
  }

  if (question.id === 'valid-parentheses') {
    const data = input as { s: string };
    return `
class Main {
  public static void main(String[] args) {
    System.out.print(new Solution().isValid("${escapeJavaString(data.s ?? '')}"));
  }
}`;
  }

  if (question.id === 'max-subarray') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().maxSubArray(nums));
  }
}`;
  }

  if (question.id === 'merge-intervals') {
    const data = input as { intervals: number[][] };
    return `
class Main {
  public static void main(String[] args) {
    int[][] intervals = ${toJava2DIntArrayLiteral(data.intervals ?? [])};
    System.out.print(java.util.Arrays.deepToString(new Solution().merge(intervals)).replace(" ", ""));
  }
}`;
  }

  if (question.id === 'word-break') {
    const data = input as { s: string; wordDict: string[] };
    return `
class Main {
  public static void main(String[] args) {
    String s = "${escapeJavaString(data.s ?? '')}";
    java.util.List<String> dict = ${toJavaStringListLiteral(data.wordDict ?? [])};
    System.out.print(new Solution().wordBreak(s, dict));
  }
}`;
  }

  if (question.id === 'number-of-islands') {
    const data = input as { grid: number[][] };
    return `
class Main {
  public static void main(String[] args) {
    char[][] grid = ${toJavaCharGridLiteral(data.grid ?? [])};
    System.out.print(new Solution().numIslands(grid));
  }
}`;
  }

  return 'class Main { public static void main(String[] args) {} }';
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

function buildCppInlineHarness(question: CodingQuestion, input: unknown): string {
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

// ──────────────────────────────────────────────────────────────
// Design-problem harness builders
// ──────────────────────────────────────────────────────────────

function castJavaParam(value: unknown, paramType: ParamType | undefined): string {
  if (paramType === 'string') return `"${escapeJavaString(String(value))}"`;
  if (paramType === 'int[]') return toJavaIntArrayLiteral(value as number[]);
  if (paramType === 'string[]') return toJavaStringListLiteral(value as string[]);
  return String(value); // int / double / boolean
}

function castCppParam(value: unknown, paramType: ParamType | undefined): string {
  if (paramType === 'string') return JSON.stringify(String(value));
  if (paramType === 'int[]') return toCppIntVectorLiteral(value as number[]);
  if (paramType === 'int[][]') return toCpp2DIntVectorLiteral(value as number[][]);
  if (paramType === 'string[]') return toCppStringVectorLiteral(value as string[]);
  if (paramType === 'boolean') return (value as boolean) ? 'true' : 'false';
  return String(value); // int / double
}

function buildJavaScriptDesignHarness(config: DesignConfig, testCase: DesignTestCase): string {
  const opsJson = JSON.stringify(testCase.operations);
  const paramsJson = JSON.stringify(testCase.parameters);
  return `
const _ops = ${opsJson};
const _params = ${paramsJson};
const _results = [];
let _obj = null;
for (let _i = 0; _i < _ops.length; _i++) {
  if (_i === 0) {
    _obj = new ${config.className}(..._params[0]);
    _results.push(null);
  } else {
    const _ret = _obj[_ops[_i]](..._params[_i]);
    _results.push(_ret === undefined ? null : _ret);
  }
}
process.stdout.write(JSON.stringify(_results));`;
}

function buildPythonDesignHarness(config: DesignConfig, testCase: DesignTestCase): string {
  const opsJson = JSON.stringify(testCase.operations);
  const paramsJson = JSON.stringify(testCase.parameters);
  return `
import json as _json
_ops = ${opsJson}
_params = ${paramsJson}
_results = []
_obj = None
for _i, _op in enumerate(_ops):
    if _i == 0:
        _obj = ${config.className}(*_params[0])
        _results.append(None)
    else:
        _ret = getattr(_obj, _op)(*_params[_i])
        _results.append(None if _ret is None else _ret)
print(_json.dumps(_results), end='')`;
}

function buildJavaDesignHarness(config: DesignConfig, testCase: DesignTestCase): string {
  const { className, constructorParamTypes, methods } = config;
  const lines: string[] = [
    'class Main {',
    '  public static void main(String[] args) {',
    '    java.util.List<Object> _out = new java.util.ArrayList<>();',
  ];

  for (let i = 0; i < testCase.operations.length; i++) {
    const op = testCase.operations[i];
    const params = testCase.parameters[i] as unknown[];

    if (i === 0) {
      const args = params.map((p, idx) => castJavaParam(p, constructorParamTypes[idx])).join(', ');
      lines.push(`    ${className} _obj = new ${className}(${args});`);
      lines.push('    _out.add(null);');
    } else {
      const methodSig = methods[op];
      if (!methodSig) { lines.push('    _out.add(null);'); continue; }
      const args = params.map((p, idx) => castJavaParam(p, methodSig.paramTypes[idx])).join(', ');
      if (methodSig.returnType === 'void') {
        lines.push(`    _obj.${op}(${args}); _out.add(null);`);
      } else {
        lines.push(`    _out.add(_obj.${op}(${args}));`);
      }
    }
  }

  lines.push('    System.out.print(_out.toString().replace(" ", ""));');
  lines.push('  }');
  lines.push('}');
  return lines.join('\n');
}

function buildCppDesignHarness(config: DesignConfig, testCase: DesignTestCase): string {
  const { className, constructorParamTypes, methods } = config;
  const lines: string[] = ['int main() {', '  vector<string> _out;'];

  for (let i = 0; i < testCase.operations.length; i++) {
    const op = testCase.operations[i];
    const params = testCase.parameters[i] as unknown[];

    if (i === 0) {
      const args = params.map((p, idx) => castCppParam(p, constructorParamTypes[idx])).join(', ');
      if (args.length === 0) {
        lines.push(`  ${className} _obj{};`);
      } else {
        lines.push(`  ${className} _obj(${args});`);
      }
      lines.push('  _out.push_back("null");');
    } else {
      const methodSig = methods[op];
      if (!methodSig) { lines.push('  _out.push_back("null");'); continue; }
      const args = params.map((p, idx) => castCppParam(p, methodSig.paramTypes[idx])).join(', ');
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

function buildDesignSandboxSource(
  question: CodingQuestion,
  language: CodingLanguage,
  userCode: string,
  testCase: DesignTestCase,
): string {
  const config = question.designConfig!;

  if (language === 'javascript' || language === 'typescript') {
    return `${userCode}\n${buildJavaScriptDesignHarness(config, testCase)}`;
  }
  if (language === 'python') {
    return `${userCode}\n${buildPythonDesignHarness(config, testCase)}`;
  }
  if (language === 'java') {
    return `${userCode}\n\n${buildJavaDesignHarness(config, testCase)}`;
  }
  if (language === 'cpp') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\n${userCode}\n\n${buildCppDesignHarness(config, testCase)}`;
  }
  throw new Error('Real sandbox for this language is not enabled yet.');
}

function buildSandboxSource(question: CodingQuestion, language: CodingLanguage, userCode: string, input: unknown): string {
  if (language === 'javascript' || language === 'typescript') {
    return `${userCode}\n\n${buildJavaScriptHarness(question, input)}`;
  }

  if (language === 'python') {
    return `${userCode}\n\n${buildPythonHarness(question, input)}`;
  }

  if (language === 'java') {
    return `${userCode}\n\n${buildJavaInlineHarness(question, input)}`;
  }

  if (language === 'cpp') {
    const cppPrelude =
      question.id === 'binary-tree-level-order'
        ? 'struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int x): val(x), left(nullptr), right(nullptr) {} };\n\n'
        : '';

    return `#include <bits/stdc++.h>\nusing namespace std;\n\n${cppPrelude}${userCode}\n\n${buildCppInlineHarness(question, input)}`;
  }

  throw new Error('Real sandbox for this language is not enabled yet.');
}

function getPistonLanguage(language: CodingLanguage): { language: string; version: string } | null {
  switch (language) {
    case 'javascript':
      return { language: 'javascript', version: '18.15.0' };
    case 'typescript':
      return { language: 'typescript', version: '5.0.3' };
    case 'python':
      return { language: 'python', version: '3.10.0' };
    case 'java':
      return { language: 'java', version: '15.0.2' };
    case 'cpp':
      return { language: 'cpp', version: '10.2.0' };
    default:
      return null;
  }
}

async function runInSandbox(language: CodingLanguage, source: string): Promise<SandboxExecutionResult> {
  const pistonLang = getPistonLanguage(language);
  if (!pistonLang) {
    throw new Error('Real sandbox is currently unavailable for the selected language.');
  }

  const fileNameByLanguage: Record<CodingLanguage, string> = {
    javascript: 'main.js',
    typescript: 'main.ts',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    c: 'main.c',
  };

  const configuredEndpoint = process.env.PISTON_API_URL?.trim();
  const endpoints = Array.from(
    new Set(
      [configuredEndpoint, 'https://emkc.org/api/v2/piston/execute', 'https://piston.rs/api/v2/execute'].filter(
        (value): value is string => Boolean(value)
      )
    )
  );

  let lastError = 'unknown sandbox error';

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Some hosted endpoints reject requests without a user-agent.
          'User-Agent': 'interview-ai-agent/1.0',
        },
        body: JSON.stringify({
          language: pistonLang.language,
          version: pistonLang.version,
          files: [{ name: fileNameByLanguage[language], content: source }],
        }),
      });

      if (!response.ok) {
        lastError = `${endpoint} returned ${response.status}`;
        continue;
      }

      const payload = (await response.json()) as {
        run?: { stdout?: string; stderr?: string; output?: string; code?: number };
        compile?: { stdout?: string; stderr?: string; output?: string; code?: number };
      };

      return {
        stdout: payload.run?.stdout ?? '',
        stderr: payload.run?.stderr ?? payload.run?.output ?? '',
        compileOutput: payload.compile?.stderr ?? payload.compile?.output ?? payload.compile?.stdout ?? '',
        runTimeMs: 35,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'sandbox network error';
    }
  }

  throw new Error(`Sandbox execution service unavailable: ${lastError}`);
}

export async function evaluateCodingSubmissionReal(payload: CodingExecuteRequest): Promise<CodingExecuteResult> {
  const question = getQuestionById(payload.questionId);

  if (!question) {
    throw new Error('Question not found for execution.');
  }

  if (!payload.code.trim()) {
    return {
      status: 'Wrong Answer',
      output: '',
      error: 'Code is empty.',
      executionTimeMs: 0,
      memoryMB: 0,
      passed: 0,
      total: payload.mode === 'submit' ? question.hiddenTestCases.length : question.examples.length,
      aiFeedback: buildAIFeedback(question, 0, 'Wrong Answer'),
    };
  }

  const tests = question.problemType === 'DESIGN'
    ? (payload.mode === 'submit' ? question.hiddenTestCases : question.examples)
    : payload.mode === 'submit'
      ? question.hiddenTestCases
      : payload.customInput?.trim()
        ? [{ input: payload.customInput.trim(), output: '' } as FunctionTestCase]
        : question.examples;

  let passed = 0;
  let combinedOutput = '';
  let totalRunTime = 0;
  let runtimeError = '';

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    // Build sandbox source — route DESIGN vs FUNCTION
    const source = isDesignTestCase(test)
      ? buildDesignSandboxSource(question, payload.language, payload.code, test)
      : buildSandboxSource(question, payload.language, payload.code, parseCaseInput(question.id, (test as FunctionTestCase).input));

    const result = await runInSandbox(payload.language, source);

    totalRunTime += result.runTimeMs;

    if (result.compileOutput) {
      runtimeError = result.compileOutput;
      break;
    }

    if (result.stderr) {
      runtimeError = result.stderr;
      break;
    }

    const actual = toComparableString(parseRuntimeOutput(result.stdout));

    let expected: string;
    if (isDesignTestCase(test)) {
      expected = toComparableString(test.expected);
    } else {
      const ft = test as FunctionTestCase;
      if (payload.mode === 'run' && payload.customInput?.trim() && !ft.output) {
        passed += 1;
        combinedOutput += `Case ${i + 1}: ${actual || '(no output)'}${i < tests.length - 1 ? '\n' : ''}`;
        continue;
      }
      expected = toComparableString(parseExpectedValue(question.id, ft.output));
    }

    if (actual === expected) passed += 1;

    combinedOutput += `Case ${i + 1}: ${actual || '(no output)'}${i < tests.length - 1 ? '\n' : ''}`;
  }

  if (runtimeError) {
    return {
      status: runtimeError.toLowerCase().includes('memory')
        ? 'Memory Limit Exceeded'
        : runtimeError.toLowerCase().includes('time')
          ? 'Time Limit Exceeded'
          : 'Runtime Error',
      output: combinedOutput,
      error: runtimeError,
      executionTimeMs: totalRunTime,
      memoryMB: 42,
      passed,
      total: tests.length,
      aiFeedback: buildAIFeedback(question, 0.35, 'Runtime Error'),
    };
  }

  const accepted = passed === tests.length;
  const status: CodingExecuteResult['status'] = accepted ? 'Accepted' : 'Wrong Answer';
  const coverage = tests.length === 0 ? 1 : passed / tests.length;

  return {
    status,
    output:
      payload.mode === 'submit'
        ? accepted
          ? `All hidden tests passed (${passed}/${tests.length}).`
          : `Hidden tests passed: ${passed}/${tests.length}.`
        : combinedOutput,
    error: accepted ? undefined : payload.mode === 'submit' ? 'Logic mismatch on hidden cases. Revisit edge cases and constraints.' : 'Some test cases failed. Check your output against the expected values.',
    executionTimeMs: totalRunTime,
    memoryMB: 42,
    passed,
    total: tests.length,
    aiFeedback: buildAIFeedback(question, coverage, status),
  };
}

export function buildExecutionFailureResult(payload: CodingExecuteRequest, message: string): CodingExecuteResult {
  const question = getQuestionById(payload.questionId);
  const total = question
    ? payload.mode === 'submit'
      ? question.hiddenTestCases.length
      : question.examples.length
    : 0;

  return {
    status: 'Runtime Error',
    output: '',
    error: message,
    executionTimeMs: 0,
    memoryMB: 0,
    passed: 0,
    total,
    aiFeedback: {
      summary: 'Execution failed before verdict generation.',
      timeComplexity: question?.timeComplexity ?? 'N/A',
      spaceComplexity: question?.spaceComplexity ?? 'N/A',
      bestPractices: question?.bestPractices ?? [],
      optimizationSuggestions: ['Fix compile/runtime issues and run again.'],
      explanation: question?.solutionExplanation ?? 'No solution notes available.',
    },
  };
}
