# ⛳ GolfDraw Platform

A subscription-based web application combining golf performance tracking, monthly prize draws, and charity donations.

## 🏗 Architecture

```
Frontend:  Next.js 14 (App Router) → Vercel
Backend:   Node.js + Express API → Any Node host
Database:  PostgreSQL (Supabase)
Auth:      Supabase Auth (JWT)
Payments:  Stripe (subscriptions + webhooks)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in Supabase dashboard
3. Run `database/schema.sql` to create all tables
4. Run `database/seed.sql` to add sample charities
5. Create an admin user via Supabase Auth, then run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

### 3. Stripe Setup

1. Create a Product + Price in Stripe Dashboard (£9.99/month recurring)
2. Copy the Price ID
3. Set up a Webhook endpoint pointing to `your-backend-url/api/webhooks/stripe`
4. Listen for events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 4. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/subscribe | ✅ | Create Stripe checkout |
| GET | /api/subscribe/status | ✅ | Subscription status |
| POST | /api/scores | ✅ | Add score (rolling 5) |
| GET | /api/scores | ✅ | Get my scores |
| PUT | /api/scores/:id | ✅ | Update score |
| DELETE | /api/scores/:id | ✅ | Delete score |
| GET | /api/draw-results | ✅ | Get draw results |
| GET | /api/draw-results/latest | ✅ | Latest draw |
| GET | /api/charities | — | List charities |
| POST | /api/charities/select | ✅ | Select charity |
| POST | /api/winners/proof | ✅ | Submit winner proof |
| POST | /api/admin/run-draw | 🛡️ | Execute draw |
| GET | /api/admin/users | 🛡️ | List users |
| GET | /api/admin/reports | 🛡️ | Platform reports |
| POST | /api/admin/verify-winner | 🛡️ | Verify winner |

✅ = Requires auth token | 🛡️ = Requires admin role

## 🎯 Core Features

- **Rolling Score System**: Users maintain only their last 5 scores
- **Draw Engine**: Random lottery + weighted (score-based) draw modes
- **Prize Distribution**: 40% jackpot (5-match), 35% (4-match), 25% (3-match)
- **Jackpot Rollover**: Unclaimed jackpots carry over to next month
- **Charity Donations**: 10% of each subscription goes to user's chosen charity
- **Admin Panel**: Full dashboard with draw management, user oversight, analytics

## 📁 Project Structure

```
├── frontend/          Next.js 14 App
│   ├── app/           Pages (App Router)
│   ├── components/    UI Components
│   ├── hooks/         Custom React hooks
│   └── lib/           API client, utilities
├── backend/           Express API
│   └── src/
│       ├── config/    DB, Stripe, env config
│       ├── controllers/  Route handlers
│       ├── routes/    Express routers
│       ├── services/  Business logic
│       ├── middleware/ Auth, rate limiting
│       └── validators/ Zod schemas
└── database/          SQL schema & seeds
```

## 🔒 Security

- JWT authentication via Supabase Auth
- Role-based access control (subscriber/admin)
- Row Level Security (RLS) on all tables
- Stripe webhook signature verification
- Rate limiting on auth and score endpoints
- Input validation with Zod on all endpoints
- CORS + Helmet security headers

## 📦 Deployment

**Frontend**: Deploy to Vercel (`vercel --prod`)
**Backend**: Deploy to Railway, Render, or any Node.js host
**Database**: Already hosted on Supabase

## License

MIT
