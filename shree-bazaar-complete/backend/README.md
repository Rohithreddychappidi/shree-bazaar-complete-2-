# Shree Bazaar — Backend API

Express + PostgreSQL (via Prisma) + Google OAuth + local (VPS-disk) image storage.
This is the backend companion to the `shree-bazaar` Next.js frontend.

## Stack
- Express 5
- PostgreSQL (self-hosted on your VPS — not a managed service)
- Prisma ORM
- Google OAuth 2.0 login (Passport.js), JWT issued in an httpOnly cookie
- Multer — product images saved directly to disk on the VPS (`./uploads`), served statically
- Razorpay Node SDK — server-side order creation + payment signature verification

## Project structure

```
src/
  app.js                  → Express app, middleware, route mounting
  server.js                → entrypoint (loads .env, starts the server)
  config/
    prisma.js               → shared Prisma client
    passport.js               → Google OAuth strategy
    razorpay.js                → Razorpay SDK client
  middleware/
    auth.js                  → JWT cookie auth (attachUser, requireAuth, requireAdmin)
    upload.js                  → multer disk storage config
  routes/
    auth.routes.js              → /auth/google, /auth/google/callback, /auth/me, /auth/logout
    categories.routes.js          → /api/categories (CRUD, admin-protected writes)
    products.routes.js              → /api/products (CRUD, admin-protected writes)
    uploads.routes.js                 → /api/uploads (admin, multipart image upload)
    addresses.routes.js                 → /api/addresses (user's own addresses)
    orders.routes.js                      → /api/orders + Razorpay order creation/verification
prisma/
  schema.prisma            → User, Category, Product, ProductVariant, Address, Order, OrderItem
uploads/                  → uploaded product images live here on the VPS disk
```

## ⚠️ One thing I couldn't verify in this environment

`npx prisma generate` needs to download engine binaries from `binaries.prisma.sh`, and the
sandbox this was built in has no network access to that domain — so I could not run
`prisma generate` or `prisma migrate` here to confirm the schema compiles end-to-end. The
schema follows standard Prisma syntax and every route file passed a Node syntax check, but
**please run `npm run prisma:generate` yourself as the first step on the VPS** (it has normal
internet access) and fix anything that comes up before going further — I'd rather flag this
than claim it's fully verified when it isn't.

## Testing now with Neon (before you have a VPS ready)

1. Go to [neon.tech](https://neon.tech) → sign up (free tier is enough) → create a project.
2. On the project dashboard, copy the **pooled** connection string into `DATABASE_URL` and
   the **direct** connection string into `DIRECT_URL` in your `.env` (see `.env.example` —
   Neon shows both on the same screen, the pooled one has `-pooler` in the hostname).
3. Run:
   ```bash
   npm install
   cp .env.example .env   # then fill in DATABASE_URL / DIRECT_URL from Neon, plus the rest
   npm run prisma:generate
   npm run prisma:push     # syncs the database schema — safe to rerun anytime schema.prisma changes
   npm run prisma:seed     # populates it with the same demo categories/products the frontend used
   npm run dev
   ```
4. Confirm it's alive: `curl http://localhost:4000/health` → `{"ok":true}`

**Why `prisma db push` instead of `migrate dev`/`migrate deploy`:** during active development,
`db push` just syncs your database to match whatever's currently in `schema.prisma` —
no migration files, no history to keep in sync across different copies of this project,
no "drift detected, reset your database" prompts if you ever re-download or re-clone this
project onto a machine that doesn't have the exact same migration history as your database.
It's the right tool while the schema is still actively changing (which it has been, across
several rounds of updates). **Rerun `npm run prisma:push` any time you pull an update that
changes `schema.prisma`** — it's non-destructive, it only adds/adjusts what's different.

Proper timestamped migrations (`prisma migrate dev`, committed to git, then `prisma migrate
deploy` in production) are worth switching to once the schema stabilizes and you're
deploying to the VPS for real — see the note at the end of the VPS section below.

**I could not run any of this myself** — this sandbox has no network access to Neon's
servers (or even to `binaries.prisma.sh`, which `prisma generate` needs), so steps 3–4
above are untested by me. The code follows standard, well-documented Prisma + Neon
patterns, but please run through them yourself and tell me what breaks, if anything.

### Migrating from Neon to your VPS later
When you're ready to deploy for real, install Postgres on the VPS (steps below), then just
change `DATABASE_URL` / `DIRECT_URL` in `.env` to point at the VPS instance instead of Neon
— no code changes needed. At that point it's worth generating a clean, proper migration
history for the first time: run `npx prisma migrate dev --name init` once against the VPS
database (assuming it's empty), commit the resulting `prisma/migrations/` folder to git,
and from then on use `npm run prisma:migrate` (`prisma migrate deploy`) for every deploy —
that's the non-interactive, production-safe way to apply schema changes once the schema
isn't changing every few days anymore.

## VPS Setup (for the real deployment)

### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
```
Inside `psql`:
```sql
CREATE DATABASE shreebazaar;
CREATE USER shreebazaar WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE shreebazaar TO shreebazaar;
```

### 2. Set up the project
```bash
# upload/clone this folder to the VPS, then:
cd shree-bazaar-server
npm install
cp .env.example .env
# edit .env — DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID/SECRET, RAZORPAY keys, etc.

npm run prisma:generate
npm run prisma:migrate    # applies existing migrations from prisma/migrations/
```
If `prisma/migrations/` doesn't exist yet in your copy (e.g. you're going straight to the
VPS without testing on Neon first), use `npm run prisma:migrate:dev` instead for this one
first-time run — it creates the migration files as well as applying them.

### 3. Google OAuth credentials
In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials:
1. Create an OAuth 2.0 Client ID (Web application)
2. Authorized redirect URI: `https://api.yourdomain.com/auth/google/callback`
3. Copy the Client ID and Client Secret into `.env`

### 4. Run with PM2
```bash
npm install -g pm2
pm2 start src/server.js --name shree-bazaar-api
pm2 save
pm2 startup   # follow the printed instructions to survive reboots
```

### 5. Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploaded images directly if you want (optional — Express already serves them)
    client_max_body_size 10M;
}
```
Then get HTTPS with Certbot: `sudo certbot --nginx -d api.yourdomain.com`

## Auth flow (Google login)
1. Frontend links/redirects the user to `GET https://api.yourdomain.com/auth/google`
2. Google shows the consent screen, then redirects to `/auth/google/callback`
3. The backend finds-or-creates the user in Postgres, issues a JWT in an httpOnly cookie,
   and redirects back to `FRONTEND_URL`
4. Frontend calls `GET /auth/me` (with `credentials: "include"`) to check who's logged in
5. `POST /auth/logout` clears the cookie

**Note on CORS + cookies:** since the cookie is httpOnly and cross-origin (frontend and
API on different subdomains), the frontend must send `credentials: "include"` on every
fetch call, and `FRONTEND_URL` in `.env` must exactly match the frontend's origin.

## Razorpay flow (server side)
1. Frontend calls `POST /api/orders/razorpay/create` with the cart total → gets back a
   real Razorpay `order_id`
2. Frontend opens the Razorpay checkout modal using that `order_id` (this replaces the
   amount-only demo call currently in the frontend's `app/checkout/page.tsx`)
3. On success, frontend calls `POST /api/orders` with the cart items, address, and the
   `razorpay_order_id` / `razorpay_payment_id` / `razorpay_signature` Razorpay returns
4. The backend verifies the signature with the Key **Secret** (never exposed to the
   frontend) before writing the order to Postgres

## Still not built (next steps)
- Shiprocket order creation — call their API after payment succeeds, save the returned
  tracking ID onto the order (there's a placeholder field for it in the schema already)
- Wiring the actual Next.js frontend to call these endpoints instead of its current
  localStorage-based `AdminDataProvider` / `StoreProvider` — right now this API and that
  frontend are not yet connected to each other
- Admin user creation/promotion (currently every Google sign-in becomes role `CUSTOMER`;
  you'll need to manually flip one user to `ADMIN` in the database, e.g. via `prisma studio`,
  until an invite/promotion flow exists)
- Rate limiting, request validation (e.g. zod), and centralized logging for production

## Shiprocket — now actually implemented

`src/config/shiprocket.js` handles auth (token cached ~9 days, auto-refreshed) and two
calls: `createShiprocketOrder(order)` and `trackShipment(shipmentId)`.

**When it runs:** automatically, right after an order is saved in `POST /api/orders` —
whether paid via Razorpay (after signature verification) or COD. If Shiprocket's API is
unreachable or misconfigured, the order still saves successfully; it just won't have a
`trackingId` yet.

**Retrying a failed shipment:** `POST /api/admin/orders/:id/shiprocket/retry` (admin only)
— this is what the "Create Shipment" button on the frontend's `/admin/orders` page calls.

**Live tracking:** `GET /api/admin/orders/:id/track` pulls current status straight from
Shiprocket for one order.

**Webhook (optional but recommended):** `POST /api/webhooks/shiprocket` — Shiprocket can
push status changes (picked up, in transit, delivered) here instead of you polling. Add
this URL under Shiprocket Dashboard → Settings → API → Webhooks:
`https://api.yourdomain.com/api/webhooks/shiprocket`

**What you must configure before this works:**
1. `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` in `.env`
2. `SHIPROCKET_PICKUP_LOCATION` — must exactly match a pickup address name you've already
   added under Shiprocket Dashboard → Settings → Pickup Addresses (Shiprocket requires
   this to exist before you can create any order via their API)
3. Item weight/dimensions in `createShiprocketOrder()` currently use flat estimates
   (0.3kg per item, fixed box size) since the product schema doesn't track real package
   dimensions yet — accurate enough to get shipments created, but worth adding real
   per-product weight/dimensions to the schema before relying on Shiprocket's rate
   calculation for anything price-sensitive

## Razorpay — webhook added for robustness

The original client-confirmed flow (`POST /api/orders/razorpay/create` → checkout modal →
signature-verified `POST /api/orders`) still works exactly as before. Added on top:

`POST /api/webhooks/razorpay` — Razorpay calls this server-to-server when a payment is
captured, independent of whether the customer's browser is still open. This matters
because a customer can close the tab right after paying, before the frontend's own
verification call fires — the webhook is the more reliable source of truth. Configure it
in Razorpay Dashboard → Settings → Webhooks:
`https://api.yourdomain.com/api/webhooks/razorpay`, subscribed to `payment.captured`, and
copy the webhook secret it gives you into `RAZORPAY_WEBHOOK_SECRET`.

## Admin all-orders endpoint — added

`GET /api/admin/orders` (admin only) — every order from every customer, with the
customer's name/email included. This is what the frontend's `/admin/orders` page and
dashboard now actually use, replacing the static demo data they showed before.

## Order Cancellation (no returns — client requirement)

Per the client's direction, there is **no return workflow** — only order cancellation
within a configurable time window (default 8 hours from when the order was placed).

- `POST /api/orders/:id/cancel` (customer, own order only) — blocked once the order is
  `Delivered` or already `Cancelled`, and blocked once `StoreSettings.cancellationWindowHours`
  has passed since `order.createdAt`
- `GET /api/orders/:id` — order detail, used by the frontend's cancel button/countdown
- `GET /api/settings` (public) / `PUT /api/settings` (admin) — the cancellation window
  (hours) and the policy text shown to customers are both admin-configurable from
  `/admin/settings` on the frontend, backed by the single-row `StoreSettings` table

## Fixed: Prisma version pin

Earlier versions of this project didn't pin a Prisma version, so `npm install` grabbed
whatever was newest — including Prisma 7, released after this was originally built. Prisma
7 removed `url`/`directUrl` from `schema.prisma` in favor of a separate `prisma.config.ts`
file with driver adapters, which broke `prisma generate`/`migrate`/`seed` with a schema
validation error (`P1012`).

This is now fixed by pinning `prisma` and `@prisma/client` to `^6.19.3` in `package.json`,
which still uses the traditional `url`/`directUrl` approach this project's `schema.prisma`
is written for. If you already ran `npm install` before this fix, delete `node_modules` and
`package-lock.json` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Latest updates (client feedback round)

- **Hero banners are now CMS-managed** — new `HeroSlide` model + `/api/hero-slides`
  (public GET, admin CRUD). The frontend's homepage banner no longer reads from a
  hardcoded file; manage slides at `/admin/hero-slides` on the frontend.
- **Store contact info & social links are now admin-configurable** — added
  `contactPhone`, `contactEmail`, `contactAddress`, `socialInstagram`, `socialFacebook`,
  `socialLinkedin` to `StoreSettings`. Seeded with the real values provided (phone,
  address, Instagram); email/Facebook/LinkedIn left blank until provided, and the
  frontend footer only shows a field once it's actually filled in.
- **Cash on Delivery removed** — `POST /api/orders` now rejects any `paymentMethod`
  other than `"razorpay"`. Razorpay is the only supported payment method.
- **User profile is now editable for real** — added `phone` to the `User` model and a
  new `PATCH /auth/me` endpoint (name + phone only; email stays tied to the Google
  account and isn't editable). This fixes the frontend's Account Settings page, which
  was previously just showing hardcoded placeholder data and doing nothing on save.
- Rating/review display removed from the storefront per client request (the underlying
  `rating`/`ratingCount` fields are still in the `Product` model, just unused — no
  migration needed to remove them, nothing references them in the UI anymore).

### ⚠️ Database schema changed
This round changed `schema.prisma` (new `HeroSlide` model, new fields on `User` and
`StoreSettings`). Sync your database with:
```bash
npm run prisma:push
npm run prisma:seed
```
This only adds the new table/columns — won't touch your existing categories/products/
orders. (If you're on an older copy of this project that still recommends `prisma migrate
dev` for this, use `prisma:push` instead — it avoids the "drift detected" issue that comes
up when migration history doesn't travel cleanly between machines/re-downloads.)

## Fixed: Shiprocket was getting the wrong customer email

`createShiprocketOrder()` was sending `SHIPROCKET_FALLBACK_EMAIL` (a generic store address)
for every single order instead of the actual customer's email — the `Order` record's
`addressSnapshot` never captured it, so there was nothing else to send. Fixed by passing
the logged-in customer's real email (`req.user.email`) into `createShiprocketOrder()` at
both call sites (checkout in `orders.routes.js`, and the admin retry button in
`admin.routes.js`). `SHIPROCKET_FALLBACK_EMAIL` now only kicks in on the rare case a user
record somehow has no email, which shouldn't normally happen since Google accounts always
provide one.

This matters because Shiprocket uses this email for its own shipment notifications to the
customer — with the bug, those would have gone nowhere useful.

## Latest updates: announcement bar, size charts, coupons, sub-admins

### 1. Scrolling announcement bar (CMS-managed)
`StoreSettings.announcementText` / `announcementEnabled` — editable at `/admin/settings`
→ Announcement Bar. The frontend renders it as a real CSS marquee animation instead of
static text.

### 2. Per-size measurements (size chart)
`Product.sizeChart` (JSON) — e.g. `{ "M": { "Shoulder": "18in", "Chest": "40in" } }`.
Admin builds this per selected size in the product form's variant builder (only for
`size_color` products). Shown to customers as a "Size Guide" table under the size
selector on the product page.

### 3. Coupon codes
New `Coupon` model — code, discount type (percent/flat), optional single-product scope,
start/end dates, optional max uses. `/admin/coupons` for full CRUD. `POST /api/coupons/
validate` is public and used in two places: a preview input on the product page (shows
the discounted price for that product, informational only) and the real thing on the
checkout page (actually applies the discount to the order total). **The discount is
always re-validated server-side in `POST /api/orders`** — the frontend's validate call is
never trusted as authoritative for what actually gets charged.

### 4. Sub-admins (master admin creates credentials directly — no email invite)
- New `SUB_ADMIN` role, and a `password` field on `User` (bcrypt-hashed, only set for
  sub-admin accounts — customers and the master admin still sign in with Google only)
- `POST /api/staff` (master admin only) creates a sub-admin with name/email/password —
  share those credentials with them manually (WhatsApp, in person, however you'd
  normally); there's no automated invite email, per your direction to skip SMTP/email
  entirely
- Sub-admins log in at `/login` → "Staff login" (email + password), via the new
  `POST /auth/login` endpoint
- `requireStaff` middleware (ADMIN or SUB_ADMIN) now guards Products, Categories,
  Coupons, and image uploads — sub-admins can use all of those. `requireAdmin` (master
  admin only) still guards Orders, Settings, Hero Banners, and Staff management itself
- The frontend admin sidebar automatically shows only the sub-admin's allowed sections
  when logged in as one, and redirects them away from anything else even if they try
  navigating there directly by URL

**What was deliberately left out:** automated order-notification emails to sub-admins.
There's no concept yet of a sub-admin "owning" a product or category, so "email whoever
created it" isn't a defined routing rule — and per your message, no SMTP/email
integration was wanted anyway. If you want this later, it needs: (a) tracking which
staff member added each product, and (b) picking an email-sending approach — both are
straightforward to add on top of what's here.

### ⚠️ Database schema changed again
```bash
npm run prisma:push
npm run prisma:seed
```
Non-destructive as always — only adds the new table/columns.

## Latest updates: coupon limits, inventory, multi-warehouse shipping, WhatsApp, clearance

### 1. One coupon use per customer
New `CouponRedemption` table (unique on `couponId` + `userId`). Checked both at
`/api/coupons/validate` (if the person is logged in) and authoritatively in
`POST /api/orders` — a redemption row is only created once the order actually succeeds,
so an abandoned checkout doesn't burn someone's one use of a coupon.

### 2. Inventory tracking
- `Product.stock` for simple products; `ProductVariant.stock` (already existed) for
  size/color and weight products.
- Stock is decremented **atomically** on order creation using `updateMany` with a
  `stock: { gte: quantity }` condition — this is what actually prevents overselling
  under concurrent load (your "1000 people order the last 100 units" scenario): if two
  requests race for the same unit, only one's conditional update matches, and the other
  gets a clean "out of stock" rejection instead of silently taking the DB negative.
- `Product.outOfStockSince` is set the moment stock (or every variant) hits 0. Products
  stay visible with an "Out of Stock" label for 24 hours from that timestamp, then are
  automatically excluded from `GET /api/products` (computed on every read — no cron job
  needed). Staff (admin/sub-admin) always see everything regardless, so they can restock.
- Cancelling an order restocks every item and clears `outOfStockSince` if appropriate.

### 3. Multi-warehouse Shiprocket shipping
`Product.pickupLocation` (falls back to `StoreSettings.defaultPickupLocation` if unset).
An order's items are grouped by pickup location; **one Shiprocket shipment is created
per group**, since Shiprocket requires one shipment = one origin address. This is
tracked in a new `Shipment` table (an Order now has `shipments: Shipment[]` instead of
a single tracking ID) — the admin Orders page shows every shipment on an order and lets
you retry just the ones that failed.

**Before this works:** every pickup location referenced (the default, and any
product-specific overrides) must already exist as a registered pickup address in your
Shiprocket account — same requirement as before, just now potentially more than one.

### 4. WhatsApp (Meta Cloud API)
`src/config/whatsapp.js` — order-placed, order-cancelled, and order-status-update
(triggered by the Shiprocket webhook) notifications, plus an admin broadcast tool at
`/admin/marketing` for promotional messages to opted-in customers.

**This needs real setup before anything sends, and none of it can be done by writing
code:**
1. A Meta Business Account + a WhatsApp Business Account (WABA)
2. A verified WhatsApp business phone number
3. A **permanent** access token — via a System User in Meta Business Suite, not the 24h
   temporary token from the developer console (that one expires and isn't meant for
   production)
4. Message **templates** created and approved by Meta — required for basically
   everything here (order confirmations, status updates, and all marketing messages),
   since free-form text only works within 24 hours of the customer's last message to
   you. Approval can take minutes to ~48 hours and can't be sped up from our side.

Until `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` are set, every WhatsApp
function silently no-ops (just logs what it would have sent) — nothing else breaks.

Customer WhatsApp numbers + marketing consent are captured via a one-time prompt shown
after a customer's first Google login (skippable, never shown again once dismissed
either way) — see `User.whatsappNumber`, `User.marketingConsent`,
`User.profileCompletedAt`, and `PATCH /auth/me`.

### 5. Clearance Day Sale
No schema change needed — `Product.tag` was already a free-text field. Set a product's
tag to `"clearance"` in the admin product form (now an option in the Tag dropdown) and
it shows up in a dedicated homepage section, linking to `/products?tag=clearance`.
`GET /api/products` now accepts a `?tag=` filter.

### ⚠️ Fixed: real secrets were committed in `.env.example`
Found real Neon database credentials, a real Google OAuth client secret, and a real
Razorpay test key secret sitting in `.env.example` — restored to placeholders. **If this
repository has ever been public, rotate all three:** regenerate the Google OAuth client
secret, regenerate the Razorpay test key, and change the Neon database password.

### ⚠️ Database schema changed again
```bash
npm run prisma:push
npm run prisma:seed
```
Non-destructive, as always.
