/**
 * GolfDraw — Draw Engine Service
 * Implements lottery-style draw with random and weighted modes.
 */

const NUMBER_RANGE = 50;
const NUMBERS_PER_DRAW = 5;

/**
 * Generate N unique random numbers from 1 to max
 */
function generateRandomNumbers(count, max = NUMBER_RANGE) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate weighted numbers based on user's golf scores.
 * Better (lower) scores = higher weight = slight bias toward lower numbers
 * which are more likely to match winning numbers.
 */
function generateWeightedNumbers(scores, count = NUMBERS_PER_DRAW, max = NUMBER_RANGE) {
  if (!scores || scores.length === 0) {
    return generateRandomNumbers(count, max);
  }

  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  // Lower golf score is better. Weight ranges from 1.0 (score 200) to ~1.8 (score 18)
  const weight = Math.max(1, (200 - avgScore) / 100);

  const numbers = new Set();
  while (numbers.size < count) {
    // Weighted random: bias toward certain ranges based on performance
    let num;
    if (Math.random() < (weight - 1)) {
      // Bonus pick: slightly biased toward a favorable range
      const center = Math.floor(Math.random() * max / 2) + 1;
      num = Math.max(1, Math.min(max, center + Math.floor((Math.random() - 0.5) * 10)));
    } else {
      num = Math.floor(Math.random() * max) + 1;
    }
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Count matching numbers between user's numbers and winning numbers
 */
function countMatches(userNumbers, winningNumbers) {
  const winningSet = new Set(winningNumbers);
  const matched = userNumbers.filter((n) => winningSet.has(n));
  return {
    matchCount: matched.length,
    matchedNumbers: matched,
  };
}

/**
 * Execute the draw for all eligible users
 * @param {Array} eligibleUsers - Array of { id, scores[] }
 * @param {string} mode - 'random' or 'weighted'
 * @returns {{ winningNumbers, entries, results }}
 */
export function executeDraw(eligibleUsers, mode = 'random') {
  // 1. Generate winning numbers
  const winningNumbers = generateRandomNumbers(NUMBERS_PER_DRAW);

  // 2. Generate numbers for each user
  const entries = eligibleUsers.map((user) => {
    const userNumbers =
      mode === 'weighted'
        ? generateWeightedNumbers(user.scores)
        : generateRandomNumbers(NUMBERS_PER_DRAW);

    const { matchCount, matchedNumbers } = countMatches(userNumbers, winningNumbers);

    return {
      userId: user.id,
      userNumbers,
      matchedNumbers,
      matchCount,
    };
  });

  // 3. Filter to winners (3+ matches)
  const results = entries.filter((e) => e.matchCount >= 3);

  return {
    winningNumbers,
    entries,
    results,
    totalEntries: eligibleUsers.length,
    fiveMatch: results.filter((r) => r.matchCount === 5),
    fourMatch: results.filter((r) => r.matchCount === 4),
    threeMatch: results.filter((r) => r.matchCount === 3),
  };
}

export default {
  executeDraw,
  generateRandomNumbers,
  generateWeightedNumbers,
  countMatches,
};
