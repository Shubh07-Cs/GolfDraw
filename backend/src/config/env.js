import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,

  // App
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SUBSCRIPTION_PRICE: parseFloat(process.env.SUBSCRIPTION_PRICE || '9.99'),
  CHARITY_PERCENTAGE: parseFloat(process.env.CHARITY_PERCENTAGE || '0.10'),
  PRIZE_POOL_PERCENTAGE: parseFloat(process.env.PRIZE_POOL_PERCENTAGE || '0.50'),
};

export default env;
