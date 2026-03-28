import { supabaseAdmin } from '../config/database.js';

export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('users')
      .select('*, subscriptions(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query;
    if (error) throw error;

    res.json({
      users: users || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil((count || 0) / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
}

export async function getReports(req, res, next) {
  try {
    const { type = 'overview' } = req.query;

    // Total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total scores
    const { count: totalScores } = await supabaseAdmin
      .from('scores')
      .select('*', { count: 'exact', head: true });

    // Completed draws
    const { count: completedDraws } = await supabaseAdmin
      .from('draws')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Total paid out
    const { data: payoutsData } = await supabaseAdmin
      .from('payouts')
      .select('amount')
      .eq('status', 'completed');

    const totalPaidOut = payoutsData
      ? payoutsData.reduce((sum, p) => sum + parseFloat(p.amount), 0)
      : 0;

    // Total charity contributions
    const { data: charityData } = await supabaseAdmin
      .from('charity_contributions')
      .select('amount');

    const totalCharityDonated = charityData
      ? charityData.reduce((sum, c) => sum + parseFloat(c.amount), 0)
      : 0;

    // Current rollover
    const { data: lastDraw } = await supabaseAdmin
      .from('draws')
      .select('rollover_amount')
      .eq('status', 'completed')
      .order('draw_month', { ascending: false })
      .limit(1)
      .single();

    // Recent admin logs
    const { data: recentLogs } = await supabaseAdmin
      .from('admin_logs')
      .select(`
        *,
        users:admin_id (full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    // Pending winners
    const { count: pendingWinners } = await supabaseAdmin
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json({
      report: {
        total_users: totalUsers || 0,
        active_subscriptions: activeSubscriptions || 0,
        total_scores: totalScores || 0,
        completed_draws: completedDraws || 0,
        total_paid_out: totalPaidOut.toFixed(2),
        total_charity_donated: totalCharityDonated.toFixed(2),
        current_rollover: lastDraw?.rollover_amount || 0,
        pending_winners: pendingWinners || 0,
        monthly_revenue: ((activeSubscriptions || 0) * 9.99).toFixed(2),
      },
      recent_logs: recentLogs || [],
    });
  } catch (err) {
    next(err);
  }
}

export async function manageCharity(req, res, next) {
  try {
    const { action } = req.params;

    if (action === 'create') {
      const { name, description, logo_url, website } = req.body;
      const { data, error } = await supabaseAdmin
        .from('charities')
        .insert({ name, description, logo_url, website })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ charity: data });
    }

    if (action === 'update') {
      const { id, ...updates } = req.body;
      const { data, error } = await supabaseAdmin
        .from('charities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ charity: data });
    }

    if (action === 'delete') {
      const { id } = req.body;
      await supabaseAdmin
        .from('charities')
        .update({ is_active: false })
        .eq('id', id);

      return res.json({ message: 'Charity deactivated' });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    next(err);
  }
}

export async function getAdminDraws(req, res, next) {
  try {
    const { data: draws, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false });

    if (error) throw error;

    res.json({ draws: draws || [] });
  } catch (err) {
    next(err);
  }
}

export async function getPendingWinners(req, res, next) {
  try {
    const { data: winners, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        users:user_id (full_name, email),
        draw_results:draw_result_id (
          prize_amount, match_count,
          draws:draw_id (draw_month)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ winners: winners || [] });
  } catch (err) {
    next(err);
  }
}
