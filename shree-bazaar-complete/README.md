# Shree Bazaar — Complete Project

Full e-commerce project: `frontend` (Next.js 15) + `backend` (Express + PostgreSQL API).
They're separate deployables that talk to each other over HTTP — run both to get the
full working app.

> **Every time you unzip a fresh copy of this project, `.env` (backend) and `.env.local`
> (frontend) will be missing** — they hold secrets, so they're never bundled into the zip.
> You'll need to recreate them each time (`cp .env.example .env`, then fill in your real
> values) unless you keep a saved copy from a previous setup to copy over instead. This
> is expected, not a bug — don't skip refilling them after a fresh download.

## Quick start (local testing with Neon)

### 1. Backend first
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env`:
- `DATABASE_URL` / `DIRECT_URL` — from a free [Neon](https://neon.tech) project (see
  `backend/README.md` for the exact steps — pooled URL for `DATABASE_URL`, direct URL for
  `DIRECT_URL`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` — from Google Cloud
  Console (redirect URI: `http://localhost:4000/auth/google/callback` for local testing)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your Razorpay dashboard (test mode keys
  are fine for now)
- `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` — your Shiprocket account login, and
  `SHIPROCKET_PICKUP_LOCATION` must match a pickup address name already added under
  Shiprocket Dashboard → Settings → Pickup Addresses (required before their API will
  accept any order)
- `FRONTEND_URL=http://localhost:3000`
- `JWT_SECRET` — any long random string

```bash
npm run prisma:generate
npm run prisma:push     # syncs the database to match schema.prisma — safe to rerun anytime
npm run prisma:seed      # loads the demo categories/products into your database
npm run dev               # starts the API on http://localhost:4000
```
Rerun `npm run prisma:push` any time you pull an update that changes the backend's
`prisma/schema.prisma` — it's non-destructive and just applies what's different. (Proper
migration files come later, only once you're deploying to the VPS for real — see
`backend/README.md`.)

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
```
Fill in `.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same Key ID as the backend's `RAZORPAY_KEY_ID`

```bash
npm run dev   # starts the storefront on http://localhost:3000
```

### 3. Sign in and make yourself admin
1. Open `http://localhost:3000`, click **Account → Continue with Google**, sign in.
2. This creates your user row in Postgres as a regular `CUSTOMER`.
3. In `backend/.env`, set `SEED_ADMIN_EMAIL` to the email you just signed in with.
4. Run `npm run prisma:seed` again in `backend/` — it promotes that user to `ADMIN`
   without touching your other data.
5. Log out and back in on the frontend (or just refresh) — you'll now see **Admin Panel**
   in the account menu, and `/admin` will let you in.

## What's real vs. still a placeholder

**Fully working, end to end:**
- Storefront browsing, search, cart, wishlist (cart/wishlist are still local to the
  browser — no backend cart table yet, which is normal for a guest-cart pattern)
- Google login (real OAuth, real Postgres user records, JWT cookie session)
- Admin panel: categories and products are read from and written to Postgres through the
  real API — add a product in `/admin/products/new`, it appears on the storefront
  immediately
- Real image uploads — files go to `backend/uploads` on disk, not localStorage/base64
- Addresses (`/profile/addresses`) — full CRUD against the real `/api/addresses` backend
- Orders (`/profile/orders`, `/profile`) — read real orders from `/api/orders`
- Checkout — creates a real Razorpay order server-side, opens the actual Razorpay
  checkout modal, and verifies the payment signature server-side before saving the order
- **Razorpay webhook** (`POST /api/webhooks/razorpay`) — server-to-server payment
  confirmation, independent of the customer's browser staying open
- **Shiprocket** — a real shipment is created automatically right after every order is
  saved (`backend/src/config/shiprocket.js`); if that call fails, the order still saves
  and the admin panel's "Create Shipment" button on `/admin/orders` retries it
- **Admin all-orders view** — `/admin/orders` and the admin dashboard now show real data
  from every customer via `GET /api/admin/orders`, not static demo data
- **Order cancellation** — customers can cancel their own order from
  `/profile/orders/[id]` within a configurable time window (default 8 hours from when the
  order was placed, admin-configurable at `/admin/settings`). Per the client's direction,
  there is **no return workflow** — cancellation-only, nothing to build or maintain around
  returns/refunds-after-delivery

**Still placeholder / not built:**
- Saved payment methods (`/profile/payments`) — still static demo data; Razorpay doesn't
  expose a simple "save a card" API without their separate tokenization/vault product, so
  this was deliberately left as UI only
- Email/password login — the form exists on `/login` but only Google is wired up
- No rate limiting, input validation library (e.g. zod), or production logging yet
- Shiprocket item weight/dimensions use flat estimates (no per-product weight tracked in
  the schema yet) — fine for creating shipments, worth refining before relying on it for
  accurate shipping rate calculation

## Deploying for real
Both `frontend/README.md` and `backend/README.md` have their own deployment sections —
frontend to Vercel (or your VPS), backend to your VPS with Nginx + PM2 + self-hosted
Postgres. When you move off Neon, only `DATABASE_URL`/`DIRECT_URL` in the backend's `.env`
change — nothing else in the code does.
