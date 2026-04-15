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
  memoryKB: number;
  statusDescription: string;
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

const CURATED_TOPIC_TITLE_MAP: Record<string, string[]> = {
  array: [
    'Two Sum',
    'Best Time to Buy and Sell Stock',
    'Contains Duplicate',
    'Maximum Subarray',
    'Move Zeroes',
    'Missing Number',
    'Product of Array Except Self',
    'Subarray Sum Equals K',
    'Maximum Product Subarray',
    'Sort Colors',
    'Majority Element',
    'Find Peak Element',
    'Merge Intervals',
    'Insert Interval',
    'Spiral Matrix',
    'Rotate Image',
    'Container With Most Water',
    '3Sum',
    '4Sum',
    'Jump Game',
    'Jump Game II',
    'Maximum Sum Circular Subarray',
    'First Missing Positive',
    'Find All Duplicates in an Array',
    'Set Matrix Zeroes',
    'Trapping Rain Water',
    'Largest Number',
    'Subarray Product Less Than K',
    'Range Sum Query',
    'Maximum Points You Can Obtain from Cards',
  ],
  'linked-list': [
    'Reverse Linked List',
    'Linked List Cycle',
    'Detect Cycle II',
    'Merge Two Sorted Lists',
    'Remove Nth Node From End',
    'Middle of the Linked List',
    'Intersection of Two Linked Lists',
    'Palindrome Linked List',
    'Reorder List',
    'Add Two Numbers',
    'Copy List with Random Pointer',
    'Flatten a Multilevel Doubly Linked List',
    'Rotate List',
    'Partition List',
    'Reverse Nodes in k-Group',
    'Swap Nodes in Pairs',
    'Remove Duplicates from Sorted List',
    'Remove Linked List Elements',
    'Odd Even Linked List',
    'Sort List',
  ],
  tree: [
    'Maximum Depth of Binary Tree',
    'Same Tree',
    'Invert Binary Tree',
    'Binary Tree Level Order Traversal',
    'Diameter of Binary Tree',
    'Balanced Binary Tree',
    'Lowest Common Ancestor (BST)',
    'Lowest Common Ancestor (Binary Tree)',
    'Validate Binary Search Tree',
    'Kth Smallest Element in BST',
    'Binary Tree Right Side View',
    'Path Sum',
    'Path Sum II',
    'Serialize and Deserialize Binary Tree',
    'Construct Binary Tree from Preorder and Inorder',
    'Convert Sorted Array to BST',
    'Flatten Binary Tree to Linked List',
    'Sum Root to Leaf Numbers',
    'Count Complete Tree Nodes',
    'House Robber III',
    'Maximum Path Sum',
    'Vertical Order Traversal',
    'Boundary of Binary Tree',
  ],
  stack: [
    'Valid Parentheses',
    'Min Stack',
    'Implement Queue using Stacks',
    'Implement Stack using Queues',
    'Daily Temperatures',
    'Next Greater Element',
    'Largest Rectangle in Histogram',
    'Sliding Window Maximum',
    'Evaluate Reverse Polish Notation',
    'Basic Calculator',
    'Basic Calculator II',
    'Decode String',
    'Remove K Digits',
    'Asteroid Collision',
    'Online Stock Span',
  ],
  'binary-search': [
    'Binary Search',
    'Search in Rotated Sorted Array',
    'Find Minimum in Rotated Sorted Array',
    'Peak Index in Mountain Array',
    'Median of Two Sorted Arrays',
    'Search Insert Position',
    'Find First and Last Position',
    'Koko Eating Bananas',
    'Capacity to Ship Packages Within D Days',
    'Split Array Largest Sum',
    'Aggressive Cows',
    'Allocate Minimum Pages',
  ],
  'dynamic-programming': [
    'Climbing Stairs',
    'House Robber',
    'House Robber II',
    'Coin Change',
    'Longest Increasing Subsequence',
    'Longest Common Subsequence',
    'Edit Distance',
    '0/1 Knapsack',
    'Partition Equal Subset Sum',
    'Unique Paths',
    'Decode Ways',
    'Word Break',
    'Longest Palindromic Subsequence',
    'Burst Balloons',
    'Matrix Chain Multiplication',
    'Egg Dropping Problem',
    'Minimum Cost Climbing Stairs',
    'Distinct Subsequences',
    'Interleaving String',
    'Maximum Rectangle',
    'Palindrome Partitioning II',
    'Russian Doll Envelopes',
  ],
  graph: [
    'Number of Islands',
    'Clone Graph',
    'Course Schedule',
    'Course Schedule II',
    'Pacific Atlantic Water Flow',
    'Rotting Oranges',
    'Word Ladder',
    'Graph Valid Tree',
    'Network Delay Time',
    'Dijkstra\'s Algorithm',
    'Bellman-Ford Algorithm',
    'Floyd Warshall Algorithm',
    'Minimum Spanning Tree (Kruskal)',
    'Minimum Spanning Tree (Prim)',
    'Bridges in Graph',
    'Articulation Points',
    'Strongly Connected Components (Kosaraju)',
    'Bipartite Graph',
    'Cheapest Flights Within K Stops',
  ],
  greedy: [
    'Jump Game',
    'Jump Game II',
    'Gas Station',
    'Candy',
    'Assign Cookies',
    'Task Scheduler',
    'Minimum Platforms',
    'Fractional Knapsack',
    'Job Sequencing Problem',
    'Non-overlapping Intervals',
    'Minimum Arrows to Burst Balloons',
  ],
  string: [
    'Valid Anagram',
    'Longest Substring Without Repeating Characters',
    'Longest Palindromic Substring',
    'Group Anagrams',
    'String to Integer (atoi)',
    'Implement strStr()',
    'Minimum Window Substring',
    'Palindromic Substrings',
    'Z Algorithm',
    'KMP Pattern Matching',
    'Rabin-Karp Algorithm',
    'Longest Common Prefix',
    'Multiply Strings',
    'Valid Palindrome II',
    'Count and Say',
    'Text Justification',
  ],
  backtracking: [
    'Subsets',
    'Subsets II',
    'Permutations',
    'Permutations II',
    'Combination Sum',
    'Combination Sum II',
    'Word Search',
    'N-Queens',
    'Sudoku Solver',
    'Palindrome Partitioning',
    'Restore IP Addresses',
    'Letter Combinations of Phone Number',
    'Combination Sum III',
    'Word Search II',
  ],
  heap: [
    'Kth Largest Element in an Array',
    'Top K Frequent Elements',
    'Find Median from Data Stream',
    'Merge K Sorted Lists',
    'K Closest Points to Origin',
    'Reorganize String',
    'Sliding Window Median',
    'Connect Ropes with Minimum Cost',
    'Find K Pairs with Smallest Sums',
  ],
  'hash-table': [
    'Two Sum',
    'Group Anagrams',
    'Longest Consecutive Sequence',
    'Subarray Sum Equals K',
    'Happy Number',
    'Isomorphic Strings',
    'Find All Anagrams in a String',
    'Longest Substring with K Distinct Characters',
    'Check Subarray Sum',
    'Continuous Subarray Sum',
  ],
  trie: [
    'Implement Trie',
    'Search Suggestions System',
    'Word Search II',
    'Replace Words',
    'Maximum XOR of Two Numbers',
    'Concatenated Words',
    'Word Break II',
    'Design Add and Search Words',
  ],
  'bit-manipulation': [
    'Single Number',
    'Counting Bits',
    'Number of 1 Bits',
    'Missing Number',
    'Sum of Two Integers',
    'Subsets using Bitmask',
    'Maximum XOR of Two Numbers',
    'Bitwise AND of Numbers Range',
    'Power of Two',
    'Power of Four',
  ],
  'sliding-window': [
    'Maximum Sum Subarray of Size K',
    'Longest Substring Without Repeating Characters',
    'Minimum Window Substring',
    'Sliding Window Maximum',
    'Permutation in String',
    'Longest Repeating Character Replacement',
    'Fruit Into Baskets',
  ],
  'two-pointers': [
    'Container With Most Water',
    '3Sum',
    '3Sum Closest',
    'Remove Duplicates from Sorted Array',
    'Valid Palindrome',
    'Squares of Sorted Array',
    'Trapping Rain Water',
  ],
  'prefix-sum': [
    'Range Sum Query',
    'Subarray Sum Equals K',
    'Continuous Subarray Sum',
    'Product of Array Except Self',
    'Pivot Index',
  ],
  'union-find': [
    'Number of Connected Components',
    'Redundant Connection',
    'Accounts Merge',
    'Friend Circles',
    'Detect Cycle in Graph',
  ],
};

const TOPIC_TAG_LABELS: Record<string, string> = {
  array: 'Array',
  'linked-list': 'Linked List',
  tree: 'Tree',
  stack: 'Stack',
  queue: 'Queue',
  'binary-search': 'Binary Search',
  'dynamic-programming': 'Dynamic Programming',
  graph: 'Graph',
  greedy: 'Greedy',
  string: 'String',
  backtracking: 'Backtracking',
  heap: 'Heap',
  'hash-table': 'Hash Map',
  trie: 'Trie',
  'bit-manipulation': 'Bit Manipulation',
  'sliding-window': 'Sliding Window',
  'two-pointers': 'Two Pointers',
  'prefix-sum': 'Prefix Sum',
  'union-find': 'Union Find',
};

const EASY_QUESTION_TITLES = new Set([
  'Two Sum',
  'Contains Duplicate',
  'Best Time to Buy and Sell Stock',
  'Move Zeroes',
  'Missing Number',
  'Majority Element',
  'Valid Parentheses',
  'Linked List Cycle',
  'Merge Two Sorted Lists',
  'Middle of the Linked List',
  'Maximum Depth of Binary Tree',
  'Same Tree',
  'Invert Binary Tree',
  'Balanced Binary Tree',
  'Path Sum',
  'Climbing Stairs',
  'Valid Anagram',
  'Longest Common Prefix',
  'Single Number',
  'Counting Bits',
  'Power of Two',
]);

const HARD_QUESTION_TITLES = new Set([
  'First Missing Positive',
  'Trapping Rain Water',
  '4Sum',
  'Reverse Nodes in k-Group',
  'Serialize and Deserialize Binary Tree',
  'Maximum Path Sum',
  'Largest Rectangle in Histogram',
  'Median of Two Sorted Arrays',
  'Burst Balloons',
  'Egg Dropping Problem',
  'Word Ladder',
  'Cheapest Flights Within K Stops',
  'Text Justification',
  'Sudoku Solver',
  'Word Search II',
  'Find Median from Data Stream',
  'Sliding Window Median',
  'Concatenated Words',
]);

const STRICT_QUESTION_OVERRIDES: Record<string, Partial<CodingQuestion>> = {
  'two-sum': {
    functionName: 'twoSum',
    description:
      'Given an integer array nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: ['2 <= nums.length <= 100000', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    hints: ['Use a hash map from value to index.', 'Check complement before inserting current value.'],
    editorial: 'A one-pass hash table solves this in linear time.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    hiddenTestCases: [
      { input: 'nums = [1,5,3,7], target = 12', output: '[1,3]' },
      { input: 'nums = [10,20,30,40], target = 70', output: '[2,3]' },
      { input: 'nums = [-3,4,3,90], target = 0', output: '[0,2]' },
    ],
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n}\n',
      typescript: 'function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def twoSum(nums, target):\n    # Write your solution here\n    return []\n',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: '#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n',
    },
    expectedKeywords: ['map', 'dict', 'unordered_map', 'hash', 'complement'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  'single-number': {
    functionName: 'singleNumber',
    description:
      'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. Your solution must run in linear time and use constant extra space.',
    constraints: [
      '1 <= nums.length <= 3 * 10^4',
      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
      'Each element appears twice except one element that appears once.',
    ],
    hints: ['Use XOR: a ^ a = 0 and a ^ 0 = a.', 'XOR all values; duplicates cancel out.'],
    editorial:
      'Maintain an accumulator initialized to 0 and XOR each value. Paired values cancel, leaving the unique value.',
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
      { input: 'nums = [1]', output: '1' },
    ],
    hiddenTestCases: [
      { input: 'nums = [7,3,5,3,5]', output: '7' },
      { input: 'nums = [-1,-1,-8]', output: '-8' },
      { input: 'nums = [42]', output: '42' },
    ],
    starterCode: {
      javascript: 'function singleNumber(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function singleNumber(nums: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def singleNumber(nums):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int singleNumber(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int singleNumber(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['xor', '^', 'bit', 'bit manipulation'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  '4sum': {
    functionName: 'fourSum',
    description:
      'Given an array nums of n integers, return all unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that a, b, c, and d are distinct indices and nums[a] + nums[b] + nums[c] + nums[d] == target. You may return the answer in any order.',
    constraints: [
      '1 <= nums.length <= 200',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
    ],
    hints: [
      'Sort the array first so duplicates can be skipped deterministically.',
      'Fix two indices and solve the remaining 2-sum with two pointers.',
    ],
    editorial:
      'Sort nums, iterate i and j for the first two numbers, then run a two-pointer sweep for the remaining pair. Skip duplicate values for i, j, left, and right to keep only unique quadruplets.',
    examples: [
      { input: 'nums = [1,0,-1,0,-2,2], target = 0', output: '[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]' },
      { input: 'nums = [2,2,2,2,2], target = 8', output: '[[2,2,2,2]]' },
    ],
    hiddenTestCases: [
      { input: 'nums = [0,0,0,0], target = 0', output: '[[0,0,0,0]]' },
      { input: 'nums = [-3,-1,0,2,4,5], target = 2', output: '[[-3,-1,2,4]]' },
      { input: 'nums = [1,2,3,4], target = 100', output: '[]' },
    ],
    starterCode: {
      javascript: 'function fourSum(nums, target) {\n  // Write your solution here\n}\n',
      typescript: 'function fourSum(nums: number[], target: number): number[][] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def fourSum(nums, target):\n    # Write your solution here\n    return []\n',
      java: 'class Solution {\n    public java.util.List<java.util.List<Integer>> fourSum(int[] nums, int target) {\n        // Write your solution here\n        return new java.util.ArrayList<>();\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> fourSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: 'int** fourSum(int* nums, int numsSize, int target, int* returnSize, int** returnColumnSizes) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n',
    },
    expectedKeywords: ['sort', 'two pointers', 'dedup', 'quadruplet', 'n^3'],
    timeComplexity: 'O(n^3)',
    spaceComplexity: 'O(1) extra (excluding output)',
  },
  'contains-duplicate': {
    functionName: 'containsDuplicate',
    description: 'Return true if any value appears at least twice in the array.',
    constraints: ['1 <= nums.length <= 100000', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Track values in a set.', 'Return early once duplicate appears.'],
    editorial: 'Set membership gives O(1) average lookups for each value.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    hiddenTestCases: [
      { input: 'nums = [0,0]', output: 'true' },
      { input: 'nums = [5,6,7,8]', output: 'false' },
      { input: 'nums = [9,1,9]', output: 'true' },
    ],
    starterCode: {
      javascript: 'function containsDuplicate(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function containsDuplicate(nums: number[]): boolean {\n  // Write your solution here\n  return false;\n}\n',
      python: 'def containsDuplicate(nums):\n    # Write your solution here\n    return False\n',
      java: 'class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your solution here\n        return false;\n    }\n};\n',
      c: 'int containsDuplicate(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['set', 'hash', 'duplicate'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  'best-time-stock': {
    functionName: 'maxProfit',
    description: 'Return the maximum profit from one buy and one sell transaction.',
    constraints: ['1 <= prices.length <= 100000', '0 <= prices[i] <= 10000'],
    hints: ['Track running minimum price.', 'Update max profit each step.'],
    editorial: 'One linear scan with best buy price so far.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5' },
      { input: 'prices = [7,6,4,3,1]', output: '0' },
    ],
    hiddenTestCases: [
      { input: 'prices = [2,4,1]', output: '2' },
      { input: 'prices = [3,2,6,5,0,3]', output: '4' },
      { input: 'prices = [1,2]', output: '1' },
    ],
    starterCode: {
      javascript: 'function maxProfit(prices) {\n  // Write your solution here\n}\n',
      typescript: 'function maxProfit(prices: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def maxProfit(prices):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int maxProfit(int* prices, int pricesSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['min', 'profit', 'buy', 'sell'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  'max-subarray': {
    functionName: 'maxSubArray',
    description: 'Find the contiguous subarray with the largest sum and return its sum.',
    constraints: ['1 <= nums.length <= 100000', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Kadane\'s algorithm works in one pass.'],
    editorial: 'Track best subarray ending at each index.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    hiddenTestCases: [
      { input: 'nums = [-1,-2,-3]', output: '-1' },
      { input: 'nums = [1,2,3,4]', output: '10' },
      { input: 'nums = [8,-19,5,-4,20]', output: '21' },
    ],
    starterCode: {
      javascript: 'function maxSubArray(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function maxSubArray(nums: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def maxSubArray(nums):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int maxSubArray(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['kadane', 'current', 'max'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  'product-except-self': {
    functionName: 'productExceptSelf',
    description: 'Return output[i] as product of all numbers except nums[i], without division.',
    constraints: ['2 <= nums.length <= 100000', '-30 <= nums[i] <= 30'],
    hints: ['Build prefix and suffix products.'],
    editorial: 'Two passes with running product, no division needed.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    hiddenTestCases: [
      { input: 'nums = [2,3,4,5]', output: '[60,40,30,24]' },
      { input: 'nums = [1,0,2,3]', output: '[0,6,0,0]' },
      { input: 'nums = [2,2,2]', output: '[4,4,4]' },
    ],
    starterCode: {
      javascript: 'function productExceptSelf(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function productExceptSelf(nums: number[]): number[] {\n  // Write your solution here\n  return [];\n}\n',
      python: 'def productExceptSelf(nums):\n    # Write your solution here\n    return []\n',
      java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};\n',
      c: '#include <stdlib.h>\n\nint* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    // Write your solution here\n    *returnSize = 0;\n    return NULL;\n}\n',
    },
    expectedKeywords: ['prefix', 'suffix', 'product'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1) extra',
  },
  'subarray-sum-equals-k': {
    functionName: 'subarraySum',
    description: 'Count continuous subarrays whose sum equals k.',
    constraints: ['1 <= nums.length <= 20000', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    hints: ['Use prefix sums and a frequency map.'],
    editorial: 'Track how many times each prefix sum appears.',
    examples: [
      { input: 'nums = [1,1,1], k = 2', output: '2' },
      { input: 'nums = [1,2,3], k = 3', output: '2' },
    ],
    hiddenTestCases: [
      { input: 'nums = [1,-1,0], k = 0', output: '3' },
      { input: 'nums = [2,2,2], k = 4', output: '2' },
      { input: 'nums = [3,4,7,2,-3,1,4,2], k = 7', output: '4' },
    ],
    starterCode: {
      javascript: 'function subarraySum(nums, k) {\n  // Write your solution here\n}\n',
      typescript: 'function subarraySum(nums: number[], k: number): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def subarraySum(nums, k):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int subarraySum(int* nums, int numsSize, int k) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['prefix', 'map', 'frequency'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  'longest-consecutive-sequence': {
    functionName: 'longestConsecutive',
    description: 'Return the length of the longest run of consecutive values.',
    constraints: ['0 <= nums.length <= 100000', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Use a set and start only at sequence heads.'],
    editorial: 'Only expand from values that have no predecessor.',
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' },
    ],
    hiddenTestCases: [
      { input: 'nums = [1,2,0,1]', output: '3' },
      { input: 'nums = [9,1,4,7,3,-1,0,5,8,-1,6]', output: '7' },
      { input: 'nums = []', output: '0' },
    ],
    starterCode: {
      javascript: 'function longestConsecutive(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function longestConsecutive(nums: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def longestConsecutive(nums):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int longestConsecutive(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int longestConsecutive(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['set', 'sequence', 'consecutive'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  'house-robber': {
    functionName: 'rob',
    description: 'Maximize robbery amount without taking adjacent houses.',
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    hints: ['Use rolling DP states.'],
    editorial: 'At each index choose rob vs skip.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4' },
      { input: 'nums = [2,7,9,3,1]', output: '12' },
    ],
    hiddenTestCases: [
      { input: 'nums = [2,1,1,2]', output: '4' },
      { input: 'nums = [6,7,1,30,8,2,4]', output: '41' },
      { input: 'nums = [1]', output: '1' },
    ],
    starterCode: {
      javascript: 'function rob(nums) {\n  // Write your solution here\n}\n',
      typescript: 'function rob(nums: number[]): number {\n  // Write your solution here\n  return 0;\n}\n',
      python: 'def rob(nums):\n    # Write your solution here\n    return 0\n',
      java: 'class Solution {\n    public int rob(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
      c: 'int rob(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}\n',
    },
    expectedKeywords: ['dp', 'adjacent', 'rob'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  'coin-change': {
    functionName: 'coinChange',
    description: 'Return the minimum number of coins needed to make amount, or -1 if impossible.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 10000', '0 <= amount <= 10000'],
    hints: ['Bottom-up DP over amount.'],
    editorial: 'Transition from smaller amounts using all coin options.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    hiddenTestCases: [
      { input: 'coins = [1,3,4], amount = 6', output: '2' },
      { input: 'coins = [2,5,10,1], amount = 27', output: '4' },
      { input: 'coins = [2], amount = 1', output: '-1' },
    ],
    starterCode: {
      javascript: 'function coinChange(coins, amount) {\n  // Write your solution here\n}\n',
      typescript: 'function coinChange(coins: number[], amount: number): number {\n  // Write your solution here\n  return -1;\n}\n',
      python: 'def coinChange(coins, amount):\n    # Write your solution here\n    return -1\n',
      java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n};\n',
      c: 'int coinChange(int* coins, int coinsSize, int amount) {\n    // Write your solution here\n    return -1;\n}\n',
    },
    expectedKeywords: ['dp', 'minimum', 'amount'],
    timeComplexity: 'O(amount * coins.length)',
    spaceComplexity: 'O(amount)',
  },
};

const LEGACY_QUESTION_ID_BY_TITLE: Record<string, string> = {
  'Two Sum': 'two-sum',
  'Single Number': 'single-number',
  'Valid Parentheses': 'valid-parentheses',
  'Maximum Subarray': 'max-subarray',
  'Merge Intervals': 'merge-intervals',
  'Binary Tree Level Order Traversal': 'binary-tree-level-order',
  'Word Break': 'word-break',
  'Number of Islands': 'number-of-islands',
  'LRU Cache': 'lru-cache',
  'Min Stack': 'min-stack',
  'Contains Duplicate': 'contains-duplicate',
  'Best Time to Buy and Sell Stock': 'best-time-stock',
  'Product of Array Except Self': 'product-except-self',
  'Longest Substring Without Repeating Characters': 'longest-substring-without-repeating-characters',
  'Coin Change': 'coin-change',
  'Subarray Sum Equals K': 'subarray-sum-equals-k',
  'Longest Consecutive Sequence': 'longest-consecutive-sequence',
  'House Robber': 'house-robber',
};

function slugifyQuestionTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function toFunctionNameFromTitle(title: string): string {
  const words = slugifyQuestionTitle(title)
    .split('-')
    .filter(Boolean);

  const rawName = words
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');

  if (!rawName) return 'solve';
  if (/^[0-9]/.test(rawName)) return `solve${rawName.charAt(0).toUpperCase()}${rawName.slice(1)}`;
  return rawName;
}

function getQuestionIdFromTitle(title: string): string {
  return LEGACY_QUESTION_ID_BY_TITLE[title] ?? slugifyQuestionTitle(title);
}

function inferDifficulty(title: string): Difficulty {
  if (EASY_QUESTION_TITLES.has(title)) return 'Easy';
  if (HARD_QUESTION_TITLES.has(title)) return 'Hard';
  return 'Medium';
}

interface LeetCodeStyleDraft {
  description: string;
  examples: FunctionTestCase[];
  hiddenTestCases: FunctionTestCase[];
  constraints: string[];
  hints: string[];
  editorial: string;
  solutionExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  bestPractices: string[];
  expectedKeywords: string[];
}

function pickPrimaryTag(tags: string[]): string {
  if (!tags.length) return 'Algorithm';
  const ordered = [
    'Array',
    'String',
    'Hash Map',
    'Two Pointers',
    'Sliding Window',
    'Stack',
    'Queue',
    'Binary Search',
    'Linked List',
    'Tree',
    'Graph',
    'Heap',
    'Dynamic Programming',
    'Greedy',
    'Backtracking',
    'Bit Manipulation',
    'Math',
    'Prefix Sum',
    'Matrix',
    'Trie',
    'Interval',
  ];

  for (const preferred of ordered) {
    if (tags.includes(preferred)) return preferred;
  }

  return tags[0];
}

function buildExamplesByTag(primaryTag: string): { examples: FunctionTestCase[]; hiddenTestCases: FunctionTestCase[] } {
  switch (primaryTag) {
    case 'String':
      return {
        examples: [
          { input: 's = "abcabcbb"', output: '3' },
          { input: 's = "bbbbb"', output: '1' },
        ],
        hiddenTestCases: [
          { input: 's = "pwwkew"', output: '3' },
          { input: 's = ""', output: '0' },
        ],
      };
    case 'Graph':
    case 'Tree':
      return {
        examples: [
          { input: 'nodes = 5, edges = [[0,1],[0,2],[1,3],[1,4]]', output: '[0,1,2,3,4]' },
          { input: 'nodes = 1, edges = []', output: '[0]' },
        ],
        hiddenTestCases: [
          { input: 'nodes = 7, edges = [[0,1],[0,2],[2,3],[2,4],[4,5],[4,6]]', output: '[0,1,2,3,4,5,6]' },
          { input: 'nodes = 0, edges = []', output: '[]' },
        ],
      };
    case 'Matrix':
      return {
        examples: [
          { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '45' },
          { input: 'matrix = [[1]]', output: '1' },
        ],
        hiddenTestCases: [
          { input: 'matrix = [[1,0,1],[0,1,0],[1,0,1]]', output: '5' },
          { input: 'matrix = []', output: '0' },
        ],
      };
    case 'Linked List':
      return {
        examples: [
          { input: 'head = [1,2,3,4]', output: '[1,2,3,4]' },
          { input: 'head = [1]', output: '[1]' },
        ],
        hiddenTestCases: [
          { input: 'head = [1,1,2,3,3]', output: '[1,1,2,3,3]' },
          { input: 'head = []', output: '[]' },
        ],
      };
    default:
      return {
        examples: [
          { input: 'nums = [1,2,3,4]', output: '10' },
          { input: 'nums = [4,3,2,1]', output: '10' },
        ],
        hiddenTestCases: [
          { input: 'nums = [2,7,11,15]', output: '35' },
          { input: 'nums = [0,0,0,0]', output: '0' },
        ],
      };
  }
}

function buildLeetCodeStyleDraft(title: string, difficulty: Difficulty, tags: string[]): LeetCodeStyleDraft {
  const primaryTag = pickPrimaryTag(tags);
  const complexityByDifficulty: Record<Difficulty, string> = {
    Easy: 'linear or near-linear',
    Medium: 'near-linear or n log n',
    Hard: 'optimized approach under tight constraints',
  };

  const { examples, hiddenTestCases } = buildExamplesByTag(primaryTag);

  return {
    description: `Given the inputs for "${title}", return the required output using an optimal ${primaryTag} strategy.`,
    examples,
    hiddenTestCases,
    constraints: [
      'Input size can be up to 10^5 unless otherwise stated in the prompt.',
      'Values may include negatives and duplicates when applicable.',
      `Your solution should target ${complexityByDifficulty[difficulty]} time complexity.`,
    ],
    hints: [
      `Identify whether ${primaryTag} is the dominant pattern before coding.`,
      'Start with a simple baseline, then optimize while preserving correctness.',
    ],
    editorial: `Model the problem around the core ${primaryTag} invariant, then implement a single-pass or bounded-pass solution that preserves correctness on edge cases.`,
    solutionExplanation:
      'Use the canonical algorithmic pattern for this topic, validate with edge cases, and keep implementation deterministic and readable.',
    timeComplexity: difficulty === 'Hard' ? 'O(n log n) or better depending on constraints' : 'O(n) expected',
    spaceComplexity: primaryTag === 'Hash Map' || primaryTag === 'Dynamic Programming' ? 'O(n)' : 'O(1) to O(n) depending on approach',
    bestPractices: [
      'Handle empty or minimal input first.',
      'Avoid unnecessary copies and nested loops when possible.',
      'Keep helper functions pure and deterministic.',
    ],
    expectedKeywords: Array.from(new Set([primaryTag.toLowerCase(), ...tags.map((tag) => tag.toLowerCase())])),
  };
}

function normalizeExample(example: FunctionTestCase, index: number): FunctionTestCase {
  const input = String(example.input ?? '').trim();
  const output = String(example.output ?? '').trim();

  return {
    input: input.length > 0 ? input : `value = ${index + 1}`,
    output: output.length > 0 ? output : '0',
    explanation: example.explanation,
  };
}

function ensureLeetCodeQuestionFormat(question: CodingQuestion): CodingQuestion {
  if (question.problemType === 'DESIGN') {
    return question;
  }

  const normalizedExamples = (question.examples as FunctionTestCase[])
    .filter((item): item is FunctionTestCase => !isDesignTestCase(item as CodingTestCase))
    .map(normalizeExample);

  const normalizedHidden = (question.hiddenTestCases as FunctionTestCase[])
    .filter((item): item is FunctionTestCase => !isDesignTestCase(item as CodingTestCase))
    .map(normalizeExample);

  const examples = normalizedExamples.length >= 2
    ? normalizedExamples
    : [
        ...normalizedExamples,
        { input: 'nums = [1,2,3]', output: '6' },
        { input: 'nums = [3,2,1]', output: '6' },
      ].slice(0, 2);

  const hiddenTestCases = normalizedHidden.length >= 2
    ? normalizedHidden
    : [
        ...normalizedHidden,
        { input: 'nums = [0]', output: '0' },
        { input: 'nums = [10,20,30]', output: '60' },
      ].slice(0, 2);

  const constraints = question.constraints.filter(Boolean);
  const hints = question.hints.filter(Boolean);
  const expectedKeywords = question.expectedKeywords.filter(Boolean);
  const bestPractices = question.bestPractices.filter(Boolean);

  return {
    ...question,
    description: question.description.trim().length
      ? question.description.trim()
      : `Given the inputs for "${question.title}", return the required output using an optimal approach.`,
    examples,
    hiddenTestCases,
    constraints: constraints.length >= 2
      ? constraints
      : [
          ...constraints,
          'Input size can be large; design for efficiency.',
          'Handle boundary and edge cases explicitly.',
        ].slice(0, 2),
    hints: hints.length >= 2
      ? hints
      : [
          ...hints,
          'Start from a simple approach and optimize.',
          'Use the dominant data-structure pattern for this problem.',
        ].slice(0, 2),
    editorial: question.editorial.trim().length
      ? question.editorial.trim()
      : 'Apply the canonical solution pattern for this problem and validate edge cases.',
    solutionExplanation: question.solutionExplanation.trim().length
      ? question.solutionExplanation.trim()
      : 'Use a correct and efficient approach that meets constraints.',
    timeComplexity: question.timeComplexity.trim().length ? question.timeComplexity.trim() : 'O(n)',
    spaceComplexity: question.spaceComplexity.trim().length ? question.spaceComplexity.trim() : 'O(1) to O(n)',
    expectedKeywords: expectedKeywords.length > 0 ? expectedKeywords : question.tags.map((tag) => tag.toLowerCase()),
    bestPractices: bestPractices.length > 0
      ? bestPractices
      : ['Write deterministic logic.', 'Test with edge cases before submit.'],
  };
}

function createDefaultStarterCode(functionName: string): Record<CodingLanguage, string> {
  return {
    javascript: `function ${functionName}(input) {\n  // Write your solution here\n}\n`,
    typescript: `function ${functionName}(input: any): any {\n  // Write your solution here\n  return null;\n}\n`,
    python: `def ${functionName}(input):\n    # Write your solution here\n    return None\n`,
    java: `class Solution {\n    public Object ${functionName}(Object input) {\n        // Write your solution here\n        return null;\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    auto ${functionName}(auto input) {\n        // Write your solution here\n        return 0;\n    }\n};\n`,
    c: `int ${functionName}(void* input) {\n    // Write your solution here\n    return 0;\n}\n`,
  };
}

function buildCuratedQuestionPool(): CodingQuestion[] {
  const titleToTopicIds = new Map<string, Set<string>>();

  for (const [topicId, titles] of Object.entries(CURATED_TOPIC_TITLE_MAP)) {
    for (const title of titles) {
      if (!titleToTopicIds.has(title)) {
        titleToTopicIds.set(title, new Set());
      }
      titleToTopicIds.get(title)!.add(topicId);
    }
  }

  const questions: CodingQuestion[] = [];

  for (const [title, topicIdsSet] of titleToTopicIds.entries()) {
    const topicIds = Array.from(topicIdsSet);
    const tags = topicIds.map((topicId) => TOPIC_TAG_LABELS[topicId] ?? topicId);
    const id = getQuestionIdFromTitle(title);
    const functionName = toFunctionNameFromTitle(title);
    const difficulty = inferDifficulty(title);
    const leetCodeDraft = buildLeetCodeStyleDraft(title, difficulty, tags);
    const override = STRICT_QUESTION_OVERRIDES[id];

    const baseQuestion: CodingQuestion = {
      id,
      title,
      difficulty,
      tags,
      description: leetCodeDraft.description,
      examples: leetCodeDraft.examples,
      constraints: leetCodeDraft.constraints,
      hints: leetCodeDraft.hints,
      editorial: leetCodeDraft.editorial,
      functionName,
      starterCode: createDefaultStarterCode(functionName),
      hiddenTestCases: leetCodeDraft.hiddenTestCases,
      expectedKeywords: leetCodeDraft.expectedKeywords,
      solutionExplanation: leetCodeDraft.solutionExplanation,
      timeComplexity: leetCodeDraft.timeComplexity,
      spaceComplexity: leetCodeDraft.spaceComplexity,
      bestPractices: leetCodeDraft.bestPractices,
    };

    const mergedQuestion = override ? ({ ...baseQuestion, ...override, id, title, tags } as CodingQuestion) : baseQuestion;
    questions.push(ensureLeetCodeQuestionFormat(mergedQuestion));
  }

  return questions.sort((a, b) => a.title.localeCompare(b.title));
}

const QUESTION_POOL: CodingQuestion[] = buildCuratedQuestionPool();

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

export interface CodingTopic {
  id: string;
  label: string;
  description: string;
  tags: string[];
}

export const CODING_TOPICS: CodingTopic[] = [
  { id: 'array', label: 'Array', description: 'Core array manipulation, scanning, and indexing problems.', tags: ['Array', 'Sorting', 'Intervals', 'Prefix Sum'] },
  { id: 'string', label: 'String', description: 'String parsing, matching, and transformation problems.', tags: ['String'] },
  { id: 'hash-table', label: 'Hash Table', description: 'Lookup-heavy problems with constant-time mapping.', tags: ['Hash Map', 'Hash Table'] },
  { id: 'two-pointers', label: 'Two Pointers', description: 'Pairwise scanning and window-style traversal.', tags: ['Two Pointers'] },
  { id: 'sliding-window', label: 'Sliding Window', description: 'Range-based scanning with moving boundaries.', tags: ['Sliding Window'] },
  { id: 'stack', label: 'Stack', description: 'Nested order, monotonic processing, and stack design.', tags: ['Stack', 'Monotonic Stack'] },
  { id: 'queue', label: 'Queue', description: 'Breadth-first traversal and level-order processing.', tags: ['Queue', 'BFS'] },
  { id: 'linked-list', label: 'Linked List', description: 'Node-based pointer manipulation problems.', tags: ['Linked List'] },
  { id: 'tree', label: 'Tree', description: 'Binary tree and hierarchical traversal problems.', tags: ['Tree', 'Binary Tree', 'BFS'] },
  { id: 'graph', label: 'Graph', description: 'DFS, BFS, and connected-component style problems.', tags: ['Graph', 'DFS', 'BFS'] },
  { id: 'binary-search', label: 'Binary Search', description: 'Search and partition problems over sorted data.', tags: ['Binary Search'] },
  { id: 'dynamic-programming', label: 'Dynamic Programming', description: 'State transition and optimal-substructure problems.', tags: ['Dynamic Programming', 'DP'] },
  { id: 'greedy', label: 'Greedy', description: 'Locally optimal decisions that build a global answer.', tags: ['Greedy'] },
  { id: 'backtracking', label: 'Backtracking', description: 'Search trees with pruning and recursive exploration.', tags: ['Backtracking'] },
  { id: 'heap', label: 'Heap', description: 'Priority-based selection and scheduling problems.', tags: ['Heap', 'Priority Queue'] },
  { id: 'trie', label: 'Trie', description: 'Prefix tree lookup and autocomplete problems.', tags: ['Trie'] },
  { id: 'intervals', label: 'Intervals', description: 'Range merging, scheduling, and overlap problems.', tags: ['Intervals'] },
  { id: 'matrix', label: 'Matrix', description: 'Grid traversal and 2D coordinate problems.', tags: ['Matrix'] },
  { id: 'design', label: 'Design', description: 'Data structure design and interface-driven problems.', tags: ['Design'] },
  { id: 'math', label: 'Math', description: 'Arithmetic, counting, and number-theory style problems.', tags: ['Math'] },
  { id: 'bit-manipulation', label: 'Bit Manipulation', description: 'Low-level bitwise reasoning and encoding problems.', tags: ['Bit Manipulation'] },
  { id: 'recursion', label: 'Recursion', description: 'Self-referential and divide-and-conquer problems.', tags: ['Recursion'] },
  { id: 'prefix-sum', label: 'Prefix Sum', description: 'Prefix accumulation and subarray sum problems.', tags: ['Prefix Sum'] },
  { id: 'union-find', label: 'Union Find', description: 'Disjoint-set connectivity and grouping problems.', tags: ['Union Find', 'Disjoint Set'] },
  { id: 'simulation', label: 'Simulation', description: 'Direct state simulation and step-by-step processing.', tags: ['Simulation'] },
];

const TOPIC_QUESTION_ID_MAP: Record<string, string[]> = Object.fromEntries(
  Object.entries(CURATED_TOPIC_TITLE_MAP).map(([topicId, titles]) => [
    topicId,
    Array.from(new Set(titles.map((title) => getQuestionIdFromTitle(title)))),
  ])
);

function dedupeQuestionsById(questions: CodingQuestion[]): CodingQuestion[] {
  const seen = new Set<string>();
  return questions.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}

function getMappedQuestionsForTopic(questions: CodingQuestion[], topicId: string): CodingQuestion[] {
  const mappedIds = TOPIC_QUESTION_ID_MAP[topicId];
  if (!mappedIds || mappedIds.length === 0) return [];

  const questionById = new Map(questions.map((question) => [question.id, question]));
  const mappedQuestions = mappedIds
    .map((id) => questionById.get(id))
    .filter((question): question is CodingQuestion => Boolean(question));

  return dedupeQuestionsById(mappedQuestions);
}

export function filterCodingQuestionsByTopic(
  questions: CodingQuestion[],
  topicId: string,
  limit = 10
): CodingQuestion[] {
  const topic = CODING_TOPICS.find((item) => item.id === topicId);
  if (!topic) return [];

  const mappedQuestions = getMappedQuestionsForTopic(questions, topicId);
  if (mappedQuestions.length > 0) {
    return mappedQuestions.slice(0, limit);
  }

  const matchingQuestions = questions.filter((question) =>
    question.tags.some((tag) => topic.tags.includes(tag))
  );

  return dedupeQuestionsById(matchingQuestions).slice(0, limit);
}

export function getCodingTopicQuestionCount(questions: CodingQuestion[], topicId: string): number {
  return filterCodingQuestionsByTopic(questions, topicId, Number.POSITIVE_INFINITY).length;
}

export function getCodingTopicsWithCounts(questions: CodingQuestion[]) {
  return CODING_TOPICS.map((topic) => ({
    ...topic,
    questionCount: getCodingTopicQuestionCount(questions, topic.id),
  }));
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
    case '4sum': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      const target = compact.match(/target\s*=\s*([^,\s]+)/i)?.[1] ?? '0';
      return { nums: JSON.parse(nums), target: Number(target) };
    }
    case 'single-number': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
    }
    case 'contains-duplicate': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
    }
    case 'best-time-stock': {
      const prices = compact.match(/prices\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { prices: JSON.parse(prices) };
    }
    case 'product-except-self': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
    }
    case 'longest-substring-without-repeating-characters': {
      const s = compact.match(/s\s*=\s*(".*?"|'.*?')/i)?.[1] ?? '""';
      return { s: JSON.parse(s.replace(/'/g, '"')) };
    }
    case 'coin-change': {
      const coins = compact.match(/coins\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      const amount = compact.match(/amount\s*=\s*([^,\s]+)/i)?.[1] ?? '0';
      return { coins: JSON.parse(coins), amount: Number(amount) };
    }
    case 'subarray-sum-equals-k': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      const k = compact.match(/k\s*=\s*([^,\s]+)/i)?.[1] ?? '0';
      return { nums: JSON.parse(nums), k: Number(k) };
    }
    case 'longest-consecutive-sequence': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
    }
    case 'house-robber': {
      const nums = compact.match(/nums\s*=\s*(\[[^\]]*\])/i)?.[1] ?? '[]';
      return { nums: JSON.parse(nums) };
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
    case '4sum':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums, payload.target);\nprocess.stdout.write(JSON.stringify(result));`;
    case 'single-number':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(String(result));`;
    case 'contains-duplicate':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(String(result));`;
    case 'best-time-stock':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.prices);\nprocess.stdout.write(String(result));`;
    case 'product-except-self':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(JSON.stringify(result));`;
    case 'longest-substring-without-repeating-characters':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.s);\nprocess.stdout.write(String(result));`;
    case 'coin-change':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.coins, payload.amount);\nprocess.stdout.write(String(result));`;
    case 'subarray-sum-equals-k':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums, payload.k);\nprocess.stdout.write(String(result));`;
    case 'longest-consecutive-sequence':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(String(result));`;
    case 'house-robber':
      return `const payload = ${payload};\nconst result = ${question.functionName}(payload.nums);\nprocess.stdout.write(String(result));`;
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
    case '4sum':
      return `import json\npayload = json.loads(${payload})\nresult = ${question.functionName}(payload['nums'], payload['target'])\nprint(json.dumps(result), end='')`;
    case 'single-number':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['nums']), end='')`;
    case 'contains-duplicate':
      return `import json\npayload = json.loads(${payload})\nprint(str(${question.functionName}(payload['nums'])).lower(), end='')`;
    case 'best-time-stock':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['prices']), end='')`;
    case 'product-except-self':
      return `import json\npayload = json.loads(${payload})\nprint(json.dumps(${question.functionName}(payload['nums'])), end='')`;
    case 'longest-substring-without-repeating-characters':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['s']), end='')`;
    case 'coin-change':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['coins'], payload['amount']), end='')`;
    case 'subarray-sum-equals-k':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['nums'], payload['k']), end='')`;
    case 'longest-consecutive-sequence':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['nums']), end='')`;
    case 'house-robber':
      return `import json\npayload = json.loads(${payload})\nprint(${question.functionName}(payload['nums']), end='')`;
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

  if (question.id === '4sum') {
    const data = input as { nums: number[]; target: number };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    int target = ${data.target ?? 0};
    System.out.print(new Solution().fourSum(nums, target).toString().replace(" ", ""));
  }
}`;
  }

  if (question.id === 'single-number') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().singleNumber(nums));
  }
}`;
  }

  if (question.id === 'contains-duplicate') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().containsDuplicate(nums));
  }
}`;
  }

  if (question.id === 'best-time-stock') {
    const data = input as { prices: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] prices = ${toJavaIntArrayLiteral(data.prices ?? [])};
    System.out.print(new Solution().maxProfit(prices));
  }
}`;
  }

  if (question.id === 'product-except-self') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(java.util.Arrays.toString(new Solution().productExceptSelf(nums)).replace(" ", ""));
  }
}`;
  }

  if (question.id === 'longest-substring-without-repeating-characters') {
    const data = input as { s: string };
    return `
class Main {
  public static void main(String[] args) {
    System.out.print(new Solution().lengthOfLongestSubstring(${JSON.stringify(data.s ?? '')}));
  }
}`;
  }

  if (question.id === 'coin-change') {
    const data = input as { coins: number[]; amount: number };
    return `
class Main {
  public static void main(String[] args) {
    int[] coins = ${toJavaIntArrayLiteral(data.coins ?? [])};
    System.out.print(new Solution().coinChange(coins, ${data.amount ?? 0}));
  }
}`;
  }

  if (question.id === 'subarray-sum-equals-k') {
    const data = input as { nums: number[]; k: number };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().subarraySum(nums, ${data.k ?? 0}));
  }
}`;
  }

  if (question.id === 'longest-consecutive-sequence') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().longestConsecutive(nums));
  }
}`;
  }

  if (question.id === 'house-robber') {
    const data = input as { nums: number[] };
    return `
class Main {
  public static void main(String[] args) {
    int[] nums = ${toJavaIntArrayLiteral(data.nums ?? [])};
    System.out.print(new Solution().rob(nums));
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

  if (question.id === '4sum') {
    const data = input as { nums: number[]; target: number };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  auto result = Solution().fourSum(nums, ${data.target ?? 0});
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

  if (question.id === 'single-number') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << Solution().singleNumber(nums);
  return 0;
}`;
  }

  if (question.id === 'contains-duplicate') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << (Solution().containsDuplicate(nums) ? "true" : "false");
  return 0;
}`;
  }

  if (question.id === 'best-time-stock') {
    const data = input as { prices: number[] };
    return `
int main() {
  vector<int> prices = ${toCppIntVectorLiteral(data.prices ?? [])};
  cout << Solution().maxProfit(prices);
  return 0;
}`;
  }

  if (question.id === 'product-except-self') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  auto result = Solution().productExceptSelf(nums);
  cout << "[";
  for (size_t i = 0; i < result.size(); i++) {
    if (i) cout << ",";
    cout << result[i];
  }
  cout << "]";
  return 0;
}`;
  }

  if (question.id === 'longest-substring-without-repeating-characters') {
    const data = input as { s: string };
    return `
int main() {
  string s = ${JSON.stringify(data.s ?? '')};
  cout << Solution().lengthOfLongestSubstring(s);
  return 0;
}`;
  }

  if (question.id === 'coin-change') {
    const data = input as { coins: number[]; amount: number };
    return `
int main() {
  vector<int> coins = ${toCppIntVectorLiteral(data.coins ?? [])};
  cout << Solution().coinChange(coins, ${data.amount ?? 0});
  return 0;
}`;
  }

  if (question.id === 'subarray-sum-equals-k') {
    const data = input as { nums: number[]; k: number };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << Solution().subarraySum(nums, ${data.k ?? 0});
  return 0;
}`;
  }

  if (question.id === 'longest-consecutive-sequence') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << Solution().longestConsecutive(nums);
  return 0;
}`;
  }

  if (question.id === 'house-robber') {
    const data = input as { nums: number[] };
    return `
int main() {
  vector<int> nums = ${toCppIntVectorLiteral(data.nums ?? [])};
  cout << Solution().rob(nums);
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

function getJudge0LanguageId(language: CodingLanguage): number | null {
  switch (language) {
    case 'cpp':
      return 54;
    case 'python':
      return 71;
    case 'java':
      return 62;
    case 'javascript':
      return 63;
    default:
      return null;
  }
}

async function runInSandbox(language: CodingLanguage, source: string, stdin = ''): Promise<SandboxExecutionResult> {
  const languageId = getJudge0LanguageId(language);
  if (!languageId) {
    throw new Error(`Language '${language}' is not currently supported for Judge0 execution.`);
  }

  const endpoint = process.env.JUDGE0_URL?.trim()
    ? `${process.env.JUDGE0_URL!.trim().replace(/\/$/, '')}/submissions?base64_encoded=false&wait=true`
    : 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'interview-ai-agent/1.0',
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        source_code: source,
        language_id: languageId,
        stdin,
        cpu_time_limit: 2,
        wall_time_limit: 2,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'network failure calling Judge0';
    throw new Error(`Judge0 request failed: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`Judge0 request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    message?: string | null;
    time?: string | number | null;
    memory?: number | null;
    status?: { id?: number; description?: string };
  };

  const statusDescription = payload.status?.description ?? 'Unknown';
  const timeSec = Number(payload.time ?? 0);
  const runTimeMs = Number.isFinite(timeSec) ? Math.max(0, Math.round(timeSec * 1000)) : 0;

  const compileOutput = payload.compile_output ?? '';
  const stderr = payload.stderr ?? payload.message ?? '';

  return {
    stdout: payload.stdout ?? '',
    stderr,
    compileOutput,
    runTimeMs,
    memoryKB: Math.max(0, Number(payload.memory ?? 0)),
    statusDescription,
  };
}

function hasConcreteFunctionTests(question: CodingQuestion): boolean {
  if (question.problemType === 'DESIGN') {
    return false;
  }

  return question.hiddenTestCases.some((test) => {
    if (isDesignTestCase(test)) {
      return false;
    }

    const input = String(test.input ?? '').trim().toLowerCase();
    const output = String(test.output ?? '').trim().toLowerCase();
    return input.length > 0 && output.length > 0 && input !== 'hidden test input' && output !== 'expected output';
  });
}

function getQuestionTests(question: CodingQuestion, mode: 'run' | 'submit'): CodingTestCase[] {
  if (question.problemType === 'DESIGN') {
    return mode === 'submit' ? question.hiddenTestCases : question.examples;
  }

  return mode === 'submit' ? question.hiddenTestCases : question.examples;
}

async function evaluateSubmissionAgainstTests(
  question: CodingQuestion,
  payload: CodingExecuteRequest,
  tests: CodingTestCase[]
): Promise<CodingExecuteResult> {
  if (payload.code.trim().length === 0) {
    return {
      status: 'Wrong Answer',
      output: '',
      error: 'Code is empty.',
      executionTimeMs: 0,
      memoryMB: 0,
      passed: 0,
      total: tests.length,
      aiFeedback: buildAIFeedback(question, 0, 'Wrong Answer'),
    };
  }

  let passed = 0;
  let combinedOutput = '';
  let totalRunTime = 0;
  let maxMemoryKB = 0;
  let runtimeError = '';

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];

    const source = isDesignTestCase(test)
      ? buildDesignSandboxSource(question, payload.language, payload.code, test)
      : buildSandboxSource(question, payload.language, payload.code, parseCaseInput(question.id, (test as FunctionTestCase).input));

    const result = await runInSandbox(
      payload.language,
      source,
      payload.mode === 'run' && payload.customInput ? payload.customInput : ''
    );

    totalRunTime += result.runTimeMs;
    maxMemoryKB = Math.max(maxMemoryKB, result.memoryKB);

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
      memoryMB: Number((maxMemoryKB / 1024).toFixed(2)),
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
    error: accepted ? undefined : payload.mode === 'submit' ? 'Logic mismatch on test cases. Revisit edge cases and constraints.' : 'Some test cases failed. Check your output against the expected values.',
    executionTimeMs: totalRunTime,
    memoryMB: Number((maxMemoryKB / 1024).toFixed(2)),
    passed,
    total: tests.length,
    aiFeedback: buildAIFeedback(question, coverage, status),
  };
}

async function evaluateCodingSubmissionGeneric(
  payload: CodingExecuteRequest,
  question: CodingQuestion
): Promise<CodingExecuteResult> {
  const tests = getQuestionTests(question, payload.mode);

  if (tests.length > 0) {
    return evaluateSubmissionAgainstTests(question, payload, tests);
  }

  const source = buildSandboxSource(question, payload.language, payload.code, { raw: payload.customInput ?? '' });
  const result = await runInSandbox(payload.language, source, payload.customInput?.trim() ?? '');

  if (result.compileOutput || result.stderr) {
    const runtimeError = result.compileOutput || result.stderr;
    return {
      status: runtimeError.toLowerCase().includes('memory')
        ? 'Memory Limit Exceeded'
        : runtimeError.toLowerCase().includes('time')
          ? 'Time Limit Exceeded'
          : 'Runtime Error',
      output: result.stdout ?? '',
      error: runtimeError,
      executionTimeMs: result.runTimeMs,
      memoryMB: Number((Math.max(0, result.memoryKB) / 1024).toFixed(2)),
      passed: 0,
      total: 1,
      aiFeedback: buildAIFeedback(question, 0.35, 'Runtime Error'),
    };
  }

  return {
    status: 'Accepted',
    output: result.stdout || '(execution finished with no stdout output)',
    executionTimeMs: result.runTimeMs,
    memoryMB: Number((Math.max(0, result.memoryKB) / 1024).toFixed(2)),
    passed: 1,
    total: 1,
    aiFeedback: buildAIFeedback(question, 0.8, 'Accepted'),
  };
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

  const normalizeTemplate = (code: string) => code.replace(/\s+/g, ' ').trim();
  const starterTemplate = question.starterCode[payload.language] ?? '';
  if (starterTemplate && normalizeTemplate(payload.code) === normalizeTemplate(starterTemplate)) {
    return {
      status: 'Wrong Answer',
      output: '',
      error: 'Starter code was submitted without changes. Please implement the function logic before running tests.',
      executionTimeMs: 0,
      memoryMB: 0,
      passed: 0,
      total: payload.mode === 'submit' ? question.hiddenTestCases.length : question.examples.length,
      aiFeedback: buildAIFeedback(question, 0, 'Wrong Answer'),
    };
  }

  if (!hasConcreteFunctionTests(question)) {
    return evaluateCodingSubmissionGeneric(payload, question);
  }

  const tests = getQuestionTests(question, payload.mode);
  return evaluateSubmissionAgainstTests(question, payload, tests);
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
