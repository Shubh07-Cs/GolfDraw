import { supabaseAdmin } from '../config/database.js';

export async function submitProof(req, res, next) {
  try {
    const { draw_result_id } = req.body;
    const userId = req.user.id;

    if (!draw_result_id) {
      return res.status(400).json({ error: 'draw_result_id is required' });
    }

    // Verify winner belongs to user
    const { data: winner, error: winnerError } = await supabaseAdmin
      .from('winners')
      .select('*')
      .eq('draw_result_id', draw_result_id)
      .eq('user_id', userId)
      .single();

    if (winnerError || !winner) {
      return res.status(404).json({ error: 'Winner record not found' });
    }

    if (winner.status !== 'pending') {
      return res.status(400).json({ error: `Proof already ${winner.status}` });
    }

    // In production: upload file to Supabase Storage
    // For now: accept a proof URL
    const proofUrl = req.body.proof_url || '/uploads/proof-placeholder.pdf';

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('winners')
      .update({ proof_url: proofUrl })
      .eq('id', winner.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      message: 'Proof submitted successfully. Awaiting admin verification.',
      winner: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyWinner(req, res, next) {
  try {
    const { winner_id, status, notes } = req.body;

    if (!winner_id || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'winner_id and valid status required' });
    }

    const { data: winner, error } = await supabaseAdmin
      .from('winners')
      .update({
        status,
        notes: notes || null,
        verified_at: new Date().toISOString(),
        verified_by: req.user.id,
      })
      .eq('id', winner_id)
      .select(`
        *,
        draw_results:draw_result_id (prize_amount, match_count)
      `)
      .single();

    if (error) throw error;

    // If verified, create payout record
    if (status === 'verified' && winner.draw_results) {
      await supabaseAdmin.from('payouts').insert({
        winner_id: winner.id,
        amount: winner.draw_results.prize_amount,
        method: 'bank_transfer',
        status: 'pending',
      });
    }

    // Log admin action
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: req.user.id,
      action: `VERIFY_WINNER_${status.toUpperCase()}`,
      target_type: 'winner',
      target_id: winner.id,
      metadata: { status, notes },
    });

    res.json({
      message: `Winner ${status}`,
      winner,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyWins(req, res, next) {
  try {
    const { data: wins, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        draw_results:draw_result_id (
          prize_amount,
          match_count,
          matched_numbers,
          draws:draw_id (draw_month, winning_numbers)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ wins: wins || [] });
  } catch (err) {
    next(err);
  }
}
