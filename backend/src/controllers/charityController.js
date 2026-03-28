import { supabaseAdmin } from '../config/database.js';
import env from '../config/env.js';

const STRIPE_CONFIGURED = env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes('placeholder');

export async function getCharities(req, res, next) {
  try {
    const { data: charities, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json({ charities: charities || [] });
  } catch (err) {
    next(err);
  }
}

export async function selectCharity(req, res, next) {
  try {
    const { charity_id } = req.body;
    const userId = req.user.id;

    if (!charity_id) {
      return res.status(400).json({ error: 'charity_id is required' });
    }

    // Verify charity exists
    const { data: charity, error: charityError } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('id', charity_id)
      .eq('is_active', true)
      .single();

    if (charityError || !charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    // Check active subscription (skip in dev if Stripe not configured)
    if (STRIPE_CONFIGURED) {
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return res.status(403).json({ error: 'Active subscription required' });
      }
    }

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Calculate charity amount (10% of subscription)
    const charityAmount = (9.99 * 0.10).toFixed(2);

    // Upsert contribution for current month
    const { data: contribution, error: contribError } = await supabaseAdmin
      .from('charity_contributions')
      .upsert(
        {
          user_id: userId,
          charity_id: charity_id,
          amount: parseFloat(charityAmount),
          month: currentMonth,
        },
        { onConflict: 'user_id,month' }
      )
      .select(`
        *,
        charities:charity_id (name, logo_url)
      `)
      .single();

    if (contribError) throw contribError;

    res.json({
      message: 'Charity selected successfully',
      contribution,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyContributions(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: contributions, error } = await supabaseAdmin
      .from('charity_contributions')
      .select(`
        *,
        charities:charity_id (name, logo_url, website)
      `)
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) throw error;

    const totalDonated = contributions
      ? contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
      : 0;

    res.json({
      contributions: contributions || [],
      total_donated: totalDonated.toFixed(2),
    });
  } catch (err) {
    next(err);
  }
}
