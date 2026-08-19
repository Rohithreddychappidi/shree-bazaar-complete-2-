# Shree Bazaar — Frontend (Client Preview)

A Next.js 15 (App Router) + TypeScript + Tailwind CSS frontend for the Shree Bazaar e-commerce site.
This is the **frontend only** — no backend, auth, cart logic, or payment integration yet. All product/category
data lives in `lib/data.ts` as placeholders, shaped the way the future admin-panel API response will look.

## Tech stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- lucide-react (icons)
- Swiper.js (hero banner slider)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project structure

```
app/
  page.tsx                    → Home
  products/page.tsx            → Product listing with sidebar filter + sort
  products/[slug]/page.tsx      → Product detail (gallery of 3 photos, "Delivery by
                                   Shiprocket" tag, Description, add to cart, related
                                   products from the same category)
  cart/page.tsx                  → Cart page (quantity update, remove, order summary)
  checkout/page.tsx               → Checkout (address select, payment method, order summary)
  wishlist/page.tsx                → Full wishlist page
  login/page.tsx                    → Login / signup UI, incl. "Continue with Google" button
  services/page.tsx                  → Services / FAQ page
  about/page.tsx                      → About page
  profile/
    layout.tsx                         → Shared sidebar + profile header (real <Link> nav)
    page.tsx                            → Profile overview (stats + recent orders)
    orders/page.tsx                      → Full order history
    addresses/page.tsx                    → Saved addresses (add/edit/remove UI)
    payments/page.tsx                      → Saved payment methods
    settings/page.tsx                       → Account settings form
  layout.tsx                                 → Root layout (Navbar + Footer + cart/wishlist provider)
  globals.css                                 → Tailwind theme tokens (purple palette, fonts)

components/                → One component per file (Navbar, Footer, HeroBanner,
                              CategoryCard, ProductCard, ProductGrid, Sidebar,
                              ServiceCard, TeamCard, SectionTitle, SearchBar,
                              Button, Badge)

lib/
  data.ts                  → Placeholder categories, products (3 images each), services, team
  types.ts                  → Shared TypeScript types
  hero-slides.ts             → Hero banner slide content
  profile-data.ts             → Placeholder orders, addresses, saved cards
  store-context.tsx           → Cart + wishlist state (React Context, persisted to
                                 localStorage so it survives a page refresh)
```

## Every route

| Route | What's there |
|---|---|
| `/` | Home |
| `/products` | Listing, category filter + sort |
| `/products/[slug]` | Detail — 3-photo gallery, Shiprocket delivery tag, description, quantity, add to cart, related products |
| `/cart` | Quantity update, remove, order summary, empty state |
| `/checkout` | Address selection, payment method choice, order summary, "Place Order" |
| `/wishlist` | Full wishlist grid, empty state |
| `/login` | Login/signup form + "Continue with Google" |
| `/services` | Services, stats, FAQ, CTA |
| `/about` | Story, values, timeline, team |
| `/profile` | Overview: stats + recent orders |
| `/profile/orders` | Full order history |
| `/profile/addresses` | Saved addresses, add/edit/remove UI |
| `/profile/payments` | Saved cards, add/remove UI |
| `/profile/settings` | Name/email/phone form |

## What's functional vs. placeholder

**Working (client-side only, no backend yet):**
- Add to cart / remove / change quantity — persists across pages and refreshes (localStorage)
- Wishlist toggle from any product card or the product detail page
- Product listing filter by category + sort
- Product detail page with 3-photo gallery and related products from the same category
- All profile pages are real routes now (`/profile/orders`, `/profile/addresses`, etc.),
  not tabs on one page — sidebar highlights the active route
- Checkout page lets you pick a saved address and a payment method (UI only)

**UI only, not wired to anything real yet:**
- Login / signup form and "Continue with Google" button — no auth is actually happening.
  Real Google sign-in needs a backend (e.g. NextAuth.js + Google OAuth credentials from
  Google Cloud Console), which comes in the backend phase.
- "Place Order" on checkout — no payment is actually processed (Razorpay comes later)
- Addresses / saved cards / order history are static placeholder data, not editable yet

## Next steps (not in this build)
- Admin panel / CMS for categories & products (multi-image upload, edit, delete)
- Backend + database to replace `lib/data.ts`
- Real authentication (NextAuth.js with Google provider + email/password)
- Razorpay payment integration
- Shiprocket shipping integration
- Real checkout flow, order placement, address CRUD

## Deploying (for client preview)

**Vercel (recommended):**
```bash
npm i -g vercel
vercel
```

**Any Node host:**
```bash
npm run build
npm start
```

---

## Update: Product Variants, Search, and Full Admin Panel

### Product variants
Products now have a `variantType`: `"none"`, `"size-color"` (fashion — pick a size and a
color, e.g. sarees, chudidhars, kids wear), or `"weight"` (grocery/food — pick a pack size
like 100g / 250g / 500g / 1kg, each with its own price). This is set **per product in the
admin panel**, not locked to a category — so any product can be plain, size/color, or
weight-based regardless of which category it's filed under.

On the product detail page, selecting a size+color or a weight updates the price shown and
what gets added to the cart. Cart and checkout both display the selected variant next to
the product name.

### Search
The header search bar is functional — typing and hitting enter takes you to
`/products?search=your query`, which filters by product name and brand.

### Admin Panel (`/admin`)
A full CMS-style admin section, with its own sidebar shell (the storefront Navbar/Footer
are hidden on `/admin/*` routes):

| Route | What it does |
|---|---|
| `/admin` | Dashboard — product/category counts, demo revenue, recent orders, products missing details |
| `/admin/categories` | List, add, edit, delete categories (delete is blocked if products still use it) |
| `/admin/products` | List with search + category filter, add, edit, delete |
| `/admin/products/new` / `/admin/products/[id]/edit` | Full product form: name, brand, category, price, description, **multi-image upload** (drag in files, first image becomes the cover), and the **variant builder** (toggle none / size-color / weight, pick sizes+colors or add pack-size rows) |
| `/admin/orders` | Order list with a Shiprocket tracking ID column (placeholder data) |
| `/admin/settings` | Store name, free shipping threshold, Razorpay Key ID, Shiprocket account email |

**Important — this is a real, working CMS demo, not just a form that goes nowhere.**
Categories and products are held in a shared `AdminDataProvider`
(`lib/admin-data-context.tsx`) that persists to `localStorage`. Add a product in the admin
panel and it appears on the Home page and `/products` immediately, in the same browser —
that's what proves this structure is genuinely ready for a backend swap later: once there's
a real API, this context's `fetch`/CRUD calls point at it instead of `localStorage`, and
nothing in the storefront pages needs to change.

**Image uploads** are stored as base64 data URLs in `localStorage` for this demo (no server
to upload to yet). Fine for a client walkthrough; real uploads will go to object storage
(S3/Cloudinary/etc.) once the backend exists — the upload UI itself won't need to change.

### Razorpay — what's real vs. what needs the backend
The checkout page (`/checkout`) loads the actual Razorpay `checkout.js` script and opens
the real payment modal in test mode when you click **Place Order** with "Pay Online"
selected. This proves the integration point and the UI flow. **It is not production-safe
as-is**: Razorpay requires the order to be created server-side (`POST /api/razorpay/
create-order`) so the payment can be signature-verified after success — a real backend and
webhook are required before this can take real payments. The exact spot this plugs into is
commented in `app/checkout/page.tsx`.

### Shiprocket
Shiprocket has no frontend SDK — it's a backend-only REST API. There's nothing to "wire up"
on the frontend beyond what's already here: a "Delivery by Shiprocket" tag on product pages,
a note on the checkout page, and a tracking-ID column in `/admin/orders`. The real
integration (creating the shipment after payment, polling/webhook for status) is entirely
backend work.
