/**
 * GolfDraw — Prize Pool Distribution Service
 * 
 * Distribution splits:
 *   40% → 5-match jackpot
 *   35% → 4-match winners
 *   25% → 3-match winners
 * 
 * If no 5-match winner, jackpot rolls over to next month.
 */

const DISTRIBUTION = {
  FIVE_MATCH: 0.40,
  FOUR_MATCH: 0.35,
  THREE_MATCH: 0.25,
};

/**
 * Calculate prize distribution for a draw
 * @param {number} prizePool - Total prize pool for this month
 * @param {number} rolloverAmount - Carried over jackpot from previous months
 * @param {Object} results - { fiveMatch[], fourMatch[], threeMatch[] }
 * @returns {Object} distribution details
 */
export function distributePrizes(prizePool, rolloverAmount, results) {
  const totalPool = prizePool + rolloverAmount;

  const jackpotPool = totalPool * DISTRIBUTION.FIVE_MATCH;
  const fourMatchPool = totalPool * DISTRIBUTION.FOUR_MATCH;
  const threeMatchPool = totalPool * DISTRIBUTION.THREE_MATCH;

  let newRollover = 0;
  const payouts = [];

  // 5-match winners (jackpot)
  if (results.fiveMatch.length > 0) {
    const perWinner = Math.floor((jackpotPool / results.fiveMatch.length) * 100) / 100;
    results.fiveMatch.forEach((winner) => {
      payouts.push({ userId: winner.userId, matchCount: 5, amount: perWinner });
    });
  } else {
    // No jackpot winner — rollover
    newRollover = jackpotPool;
  }

  // 4-match winners
  if (results.fourMatch.length > 0) {
    const perWinner = Math.floor((fourMatchPool / results.fourMatch.length) * 100) / 100;
    results.fourMatch.forEach((winner) => {
      payouts.push({ userId: winner.userId, matchCount: 4, amount: perWinner });
    });
  }

  // 3-match winners
  if (results.threeMatch.length > 0) {
    const perWinner = Math.floor((threeMatchPool / results.threeMatch.length) * 100) / 100;
    results.threeMatch.forEach((winner) => {
      payouts.push({ userId: winner.userId, matchCount: 3, amount: perWinner });
    });
  }

  return {
    totalPool,
    jackpotPool,
    fourMatchPool,
    threeMatchPool,
    newRollover,
    payouts,
    totalPaidOut: payouts.reduce((sum, p) => sum + p.amount, 0),
    summary: {
      fiveMatchWinners: results.fiveMatch.length,
      fourMatchWinners: results.fourMatch.length,
      threeMatchWinners: results.threeMatch.length,
      jackpotRolledOver: results.fiveMatch.length === 0,
    },
  };
}

export default { distributePrizes };
