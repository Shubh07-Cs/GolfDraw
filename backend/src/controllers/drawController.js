import { supabaseAdmin } from '../config/database.js';
import { executeDraw } from '../services/drawEngine.js';
import { distributePrizes } from '../services/prizePool.js';
import { runDrawSchema } from '../validators/drawValidator.js';
import env from '../config/env.js';

export async function runDraw(req, res, next) {
  try {
    const validated = runDrawSchema.parse(req.body);
    const drawMonth = `${validated.month}-01`; // First day of month

    // Check if draw already completed for this month
    const { data: existingDraw } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('draw_month', drawMonth)
      .single();

    if (existingDraw && existingDraw.status === 'completed') {
      return res.status(400).json({ error: 'Draw already completed for this month' });
    }

    // Get eligible users (active subscription + at least 1 score)
    const { data: activeSubscribers } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    if (!activeSubscribers || activeSubscribers.length === 0) {
      return res.status(400).json({ error: 'No eligible users for this draw' });
    }

    const eligibleUsers = [];
    for (const sub of activeSubscribers) {
      const { data: scores } = await supabaseAdmin
        .from('scores')
        .select('*')
        .eq('user_id', sub.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (scores && scores.length > 0) {
        eligibleUsers.push({ id: sub.user_id, scores });
      }
    }

    if (eligibleUsers.length === 0) {
      return res.status(400).json({ error: 'No users with scores found' });
    }

    // Calculate prize pool
    const prizePool = activeSubscribers.length * env.SUBSCRIPTION_PRICE * env.PRIZE_POOL_PERCENTAGE;

    // Get previous rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('rollover_amount')
      .eq('status', 'completed')
      .order('draw_month', { ascending: false })
      .limit(1)
      .single();

    const rolloverAmount = lastDraw?.rollover_amount || 0;

    // Execute draw
    const drawResult = executeDraw(eligibleUsers, validated.mode);

    // Distribute prizes
    const distribution = distributePrizes(prizePool, rolloverAmount, drawResult);

    // Save draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .upsert({
        ...(existingDraw ? { id: existingDraw.id } : {}),
        draw_month: drawMonth,
        mode: validated.mode,
        status: 'completed',
        prize_pool: prizePool,
        jackpot_amount: distribution.jackpotPool,
        rollover_amount: distribution.newRollover,
        winning_numbers: drawResult.winningNumbers,
        total_entries: eligibleUsers.length,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (drawError) throw drawError;

    // Save draw results — only for users with matches
    const drawResults = [];
    for (const entry of drawResult.entries) {
      const payout = distribution.payouts.find((p) => p.userId === entry.userId);
      const { data: result } = await supabaseAdmin
        .from('draw_results')
        .insert({
          draw_id: draw.id,
          user_id: entry.userId,
          user_numbers: entry.userNumbers,
          matched_numbers: entry.matchedNumbers,
          match_count: entry.matchCount,
          prize_amount: payout ? payout.amount : 0,
        })
        .select()
        .single();

      if (result) {
        drawResults.push(result);

        // Create winner record for 3+ matches
        if (entry.matchCount >= 3 && payout) {
          await supabaseAdmin.from('winners').insert({
            draw_result_id: result.id,
            user_id: entry.userId,
          });
        }
      }
    }

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: req.user.id,
      action: 'RUN_DRAW',
      target_type: 'draw',
      target_id: draw.id,
      metadata: {
        month: validated.month,
        mode: validated.mode,
        entries: eligibleUsers.length,
        winners: distribution.payouts.length,
      },
    });

    res.json({
      message: 'Draw completed successfully',
      draw,
      distribution: distribution.summary,
      results: drawResults.filter((r) => r.match_count >= 3),
      winningNumbers: drawResult.winningNumbers,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDrawResults(req, res, next) {
  try {
    const { month } = req.query;

    let query = supabaseAdmin
      .from('draws')
      .select(`
        *,
        draw_results (
          *,
          users:user_id (full_name, email, avatar_url)
        )
      `)
      .eq('status', 'completed')
      .order('draw_month', { ascending: false });

    if (month) {
      query = query.eq('draw_month', `${month}-01`);
    }

    const { data: draws, error } = await query.limit(12);
    if (error) throw error;

    res.json({ draws: draws || [] });
  } catch (err) {
    next(err);
  }
}

export async function getLatestDraw(req, res, next) {
  try {
    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        draw_results (
          *,
          users:user_id (full_name, avatar_url)
        )
      `)
      .eq('status', 'completed')
      .order('draw_month', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!draw) {
      return res.json({ draw: null, message: 'No draws have been completed yet' });
    }

    // Sort results by match count desc
    if (draw.draw_results) {
      draw.draw_results.sort((a, b) => b.match_count - a.match_count);
    }

    res.json({ draw });
  } catch (err) {
    next(err);
  }
}
