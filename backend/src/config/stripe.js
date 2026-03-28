import Stripe from 'stripe';
import env from './env.js';

const stripe = (env.STRIPE_SECRET_KEY && typeof env.STRIPE_SECRET_KEY === 'string' && !env.STRIPE_SECRET_KEY.includes('placeholder'))
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export default stripe;
