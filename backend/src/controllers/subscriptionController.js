import { supabaseAdmin } from '../config/database.js';
import stripeService from '../services/stripeService.js';
import env from '../config/env.js';

const STRIPE_CONFIGURED = env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY !== '' && !env.STRIPE_SECRET_KEY.includes('placeholder');

export async function subscribe(req, res, next) {
  try {
    if (!STRIPE_CONFIGURED) {
      // 🚧 DEV MODE: Mock a successful subscription
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);

      await supabaseAdmin.from('subscriptions').insert({
        user_id: req.user.id,
        stripe_subscription_id: `mock_sub_${Date.now()}`,
        stripe_price_id: 'mock_price',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
      });

      return res.json({
        checkout_url: `${env.FRONTEND_URL}/dashboard?subscription=success`,
        session_id: 'mock_session',
      });
    }

    // Create/get Stripe customer
    const customerId = await stripeService.getOrCreateCustomer(req.user);

    // Create checkout session
    const session = await stripeService.createCheckoutSession(customerId, req.user.id);

    res.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubscriptionStatus(req, res, next) {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      subscription: subscription || null,
      is_active: subscription?.status === 'active',
    });
  } catch (err) {
    next(err);
  }
}

export async function manageSubscription(req, res, next) {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.json({ portal_url: `${env.FRONTEND_URL}/dashboard?manage=dev_mode` });
    }

    const customerId = req.user.profile.stripe_customer_id;
    if (!customerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripeService.createPortalSession(customerId);
    res.json({ portal_url: session.url });
  } catch (err) {
    next(err);
  }
}
