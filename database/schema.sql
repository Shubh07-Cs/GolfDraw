-- ============================================
-- GolfDraw Platform — Database Schema
-- PostgreSQL (Supabase)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
    avatar_url      TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id  TEXT NOT NULL UNIQUE,
    stripe_price_id         TEXT NOT NULL,
    status                  TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','incomplete','trialing')),
    current_period_start    TIMESTAMPTZ NOT NULL,
    current_period_end      TIMESTAMPTZ NOT NULL,
    cancel_at_period_end    BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- SCORES
-- ============================================
CREATE TABLE scores (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score       INTEGER NOT NULL CHECK (score >= 18 AND score <= 200),
    course_name TEXT NOT NULL,
    played_at   DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_user_created ON scores(user_id, created_at DESC);

-- ============================================
-- DRAWS
-- ============================================
CREATE TABLE draws (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_month      DATE NOT NULL UNIQUE,
    mode            TEXT NOT NULL CHECK (mode IN ('random', 'weighted')),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
    prize_pool      DECIMAL(10,2) NOT NULL DEFAULT 0,
    jackpot_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    rollover_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    winning_numbers INTEGER[] NOT NULL DEFAULT '{}',
    total_entries   INTEGER NOT NULL DEFAULT 0,
    executed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_draws_month ON draws(draw_month);
CREATE INDEX idx_draws_status ON draws(status);

-- ============================================
-- DRAW RESULTS
-- ============================================
CREATE TABLE draw_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id         UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_numbers    INTEGER[] NOT NULL,
    matched_numbers INTEGER[] NOT NULL,
    match_count     INTEGER NOT NULL CHECK (match_count >= 0 AND match_count <= 5),
    prize_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(draw_id, user_id)
);

CREATE INDEX idx_draw_results_draw ON draw_results(draw_id);
CREATE INDEX idx_draw_results_user ON draw_results(user_id);
CREATE INDEX idx_draw_results_match ON draw_results(match_count);

-- ============================================
-- CHARITIES
-- ============================================
CREATE TABLE charities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    logo_url    TEXT,
    website     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CHARITY CONTRIBUTIONS
-- ============================================
CREATE TABLE charity_contributions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    charity_id  UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    amount      DECIMAL(10,2) NOT NULL,
    month       DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, month)
);

CREATE INDEX idx_contributions_user ON charity_contributions(user_id);
CREATE INDEX idx_contributions_charity ON charity_contributions(charity_id);
CREATE INDEX idx_contributions_month ON charity_contributions(month);

-- ============================================
-- WINNERS
-- ============================================
CREATE TABLE winners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_result_id  UUID NOT NULL REFERENCES draw_results(id) ON DELETE CASCADE UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proof_url       TEXT,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','forfeited')),
    verified_at     TIMESTAMPTZ,
    verified_by     UUID REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_winners_status ON winners(status);
CREATE INDEX idx_winners_user ON winners(user_id);

-- ============================================
-- PAYOUTS
-- ============================================
CREATE TABLE payouts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_id   UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE,
    amount      DECIMAL(10,2) NOT NULL,
    method      TEXT NOT NULL CHECK (method IN ('bank_transfer','stripe_payout','check')),
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
    reference   TEXT,
    paid_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_winner ON payouts(winner_id);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE admin_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    UUID NOT NULL REFERENCES users(id),
    action      TEXT NOT NULL,
    target_type TEXT,
    target_id   UUID,
    metadata    JSONB,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: users read own
CREATE POLICY "Users read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores: users manage own
CREATE POLICY "Users read own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Draws: everyone can read completed draws
CREATE POLICY "Everyone reads completed draws" ON draws FOR SELECT USING (status = 'completed');

-- Draw results: users read own, everyone reads completed draws
CREATE POLICY "Users read own draw results" ON draw_results FOR SELECT USING (auth.uid() = user_id);

-- Charities: everyone can read active
CREATE POLICY "Everyone reads active charities" ON charities FOR SELECT USING (is_active = TRUE);

-- Contributions: users read own
CREATE POLICY "Users read own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);

-- Winners: users read own
CREATE POLICY "Users read own winner status" ON winners FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses RLS for backend operations

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_charities_updated_at BEFORE UPDATE ON charities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_winners_updated_at BEFORE UPDATE ON winners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user signup: sync auth.users → public.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
