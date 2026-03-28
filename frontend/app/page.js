'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="navbar-brand">
          <span className="navbar-logo">⛳ Golf<span>Draw</span></span>
        </div>
        <div className="navbar-actions">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Log In</Link>
              <Link href="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            🏆 Monthly Prize Draws with Real Cash Prizes
          </div>
          <h1 className="hero-title animate-fade-in stagger-1">
            Play Golf.<br />
            <span className="text-gradient">Win Big.</span><br />
            Give Back.
          </h1>
          <p className="hero-subtitle animate-fade-in stagger-2">
            Join the ultimate golf community platform. Track your scores, enter our monthly prize draws 
            based on a lottery system, and automatically support amazing charities with every subscription.
          </p>
          <div className="hero-cta animate-fade-in stagger-3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              🚀 Start Your Journey — £9.99/mo
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More ↓
            </a>
          </div>
          <div className="hero-stats animate-fade-in stagger-4">
            <div className="hero-stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Golfers</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">£250K+</div>
              <div className="stat-label">Prizes Awarded</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">£50K+</div>
              <div className="stat-label">Donated to Charity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to <span className="text-gradient">Play & Win</span></h2>
            <p>Our platform combines golf performance tracking, exciting prize draws, and charitable giving into one seamless experience.</p>
          </div>
          <div className="grid-3">
            <div className="card card-interactive feature-card animate-slide-up stagger-1">
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>⛳</div>
              <h3>Track Your Game</h3>
              <p>Submit and track your last 5 golf scores. Our rolling score system keeps you focused on consistent improvement.</p>
            </div>
            <div className="card card-interactive feature-card animate-slide-up stagger-2">
              <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>🎰</div>
              <h3>Monthly Prize Draws</h3>
              <p>Every month, our lottery system draws winning numbers. Match 3, 4, or 5 numbers to win escalating prizes from the pool.</p>
            </div>
            <div className="card card-interactive feature-card animate-slide-up stagger-3">
              <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>💝</div>
              <h3>Support Charities</h3>
              <p>10% of every subscription goes directly to the golf charity of your choice. Play golf, make a real difference in the world.</p>
            </div>
            <div className="card card-interactive feature-card animate-slide-up stagger-1">
              <div className="feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>📊</div>
              <h3>Performance Stats</h3>
              <p>Track your averages, best scores, and improvement trends over time with detailed analytics and insights.</p>
            </div>
            <div className="card card-interactive feature-card animate-slide-up stagger-2">
              <div className="feature-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>🏆</div>
              <h3>Jackpot Rollover</h3>
              <p>No 5-match winner this month? The jackpot prize rolls over, creating ever-growing prize pools for bigger wins.</p>
            </div>
            <div className="card card-interactive feature-card animate-slide-up stagger-3">
              <div className="feature-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>🤝</div>
              <h3>Community</h3>
              <p>Join a community of passionate golfers. See how your scores compare and celebrate each other's successes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>How the <span className="text-gradient">Draw Works</span></h2>
            <p>Our unique lottery-style draw system gives every subscriber a fair chance at winning each month.</p>
          </div>
          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎱</div>
              <h4 style={{ marginBottom: '8px' }}>5 Numbers Drawn</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Each month, 5 winning numbers are randomly drawn from 1-50.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
              <h4 style={{ marginBottom: '8px' }}>Match to Win</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Your numbers are generated automatically. Match 3, 4, or 5 to win prizes.</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💰</div>
              <h4 style={{ marginBottom: '8px' }}>Prize Pool Split</h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>40% jackpot (5-match), 35% for 4-match, 25% for 3-match winners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple, <span className="text-gradient">Transparent</span> Pricing</h2>
            <p>One plan, everything included. No hidden fees, no complicated tiers.</p>
          </div>
          <div className="pricing-card card card-glow">
            <div className="badge badge-gold" style={{ marginBottom: '16px' }}>Most Popular</div>
            <h3>GolfDraw Premium</h3>
            <div className="price-display">
              <div className="price-amount">
                <span className="currency">£</span>9<span style={{ fontSize: '2rem' }}>.99</span>
              </div>
              <div className="price-period">per month</div>
            </div>
            <ul className="price-features">
              <li><span className="check">✓</span> Submit & track golf scores</li>
              <li><span className="check">✓</span> Entry into monthly prize draws</li>
              <li><span className="check">✓</span> Random or weighted draw modes</li>
              <li><span className="check">✓</span> Automatic charity contributions</li>
              <li><span className="check">✓</span> Performance analytics</li>
              <li><span className="check">✓</span> Full draw results history</li>
              <li><span className="check">✓</span> Winner verification & payouts</li>
              <li><span className="check">✓</span> Choose your charity each month</li>
            </ul>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Get Started Now →
            </Link>
            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
            Ready to <span className="text-gradient">Tee Off</span>?
          </h2>
          <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of golfers already winning prizes and making a difference.
          </p>
          <Link href="/signup" className="btn btn-gold btn-lg">
            🏌️ Join GolfDraw Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2026 GolfDraw. All rights reserved. Play responsibly. 18+ only.</p>
        </div>
      </footer>
    </div>
  );
}
