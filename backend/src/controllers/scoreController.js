import { supabaseAdmin } from '../config/database.js';
import { scoreSchema, updateScoreSchema } from '../validators/scoreValidator.js';
import env from '../config/env.js';

const MAX_SCORES = 5;
const STRIPE_CONFIGURED = env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes('placeholder');

export async function addScore(req, res, next) {
  try {
    const validated = scoreSchema.parse(req.body);
    const userId = req.user.id;

    // Check active subscription (skip in dev if Stripe not configured)
    if (STRIPE_CONFIGURED) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return res.status(403).json({ error: 'Active subscription required to submit scores' });
      }
    }

    // Get existing scores count
    const { data: existingScores, error: fetchError } = await supabaseAdmin
      .from('scores')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    // Enforce rolling 5 limit — remove oldest if at limit
    if (existingScores && existingScores.length >= MAX_SCORES) {
      const scoresToDelete = existingScores.slice(0, existingScores.length - MAX_SCORES + 1);
      for (const oldScore of scoresToDelete) {
        await supabaseAdmin.from('scores').delete().eq('id', oldScore.id);
      }
    }

    // Insert new score
    const { data: newScore, error: insertError } = await supabaseAdmin
      .from('scores')
      .insert({
        user_id: userId,
        score: validated.score,
        course_name: validated.course_name,
        played_at: validated.played_at,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Return updated scores
    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    res.status(201).json({
      message: 'Score added successfully',
      score: newScore,
      scores: allScores,
      remaining_slots: Math.max(0, MAX_SCORES - allScores.length),
    });
  } catch (err) {
    next(err);
  }
}

export async function getScores(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: scores, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const avg = scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
      : null;

    res.json({
      scores,
      stats: {
        count: scores.length,
        max_scores: MAX_SCORES,
        remaining_slots: MAX_SCORES - scores.length,
        average: avg ? parseFloat(avg) : null,
        best: scores.length > 0 ? Math.min(...scores.map((s) => s.score)) : null,
        worst: scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateScore(req, res, next) {
  try {
    const { id } = req.params;
    const validated = updateScoreSchema.parse(req.body);
    const userId = req.user.id;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Score not found' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('scores')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Score updated', score: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteScore(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabaseAdmin
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await supabaseAdmin.from('scores').delete().eq('id', id);

    res.json({ message: 'Score deleted' });
  } catch (err) {
    next(err);
  }
}
