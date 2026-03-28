import stripe from '../config/stripe.js';
import { supabaseAdmin } from '../config/database.js';
import env from '../config/env.js';

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateCustomer(user) {
  // Check if user already has a Stripe customer ID
  if (user.profile.stripe_customer_id) {
    return user.profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.profile.full_name,
    metadata: {
      supabase_user_id: user.id,
    },
  });

  // Save customer ID to our database
  await supabaseAdmin
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id);

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(customerId, userId) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/dashboard?subscription=success`,
    cancel_url: `${env.FRONTEND_URL}/dashboard?subscription=cancelled`,
    metadata: {
      supabase_user_id: userId,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: userId,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(customerId) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.FRONTEND_URL}/dashboard`,
  });

  return session;
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      await upsertSubscription(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await handlePaymentFailed(invoice);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutComplete(session) {
  const subscriptionId = session.subscription;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription);
}

async function upsertSubscription(subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    // Try to find user by Stripe customer ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (!user) {
      console.error('Could not find user for subscription:', subscription.id);
      return;
    }

    subscription.metadata = { ...subscription.metadata, supabase_user_id: user.id };
  }

  const subData = {
    user_id: subscription.metadata.supabase_user_id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  await supabaseAdmin
    .from('subscriptions')
    .upsert(subData, { onConflict: 'stripe_subscription_id' });
}

async function handleSubscriptionDeleted(subscription) {
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // Could send notification to user
}

export default {
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
};
