# Elarenza — Perfume Decants & Full Bottles

Customer website + admin panel for **Elarenza**, built with Next.js, Tailwind CSS,
and Prisma (SQLite).

## What's included

- **Customer site**: home page, shop with search/filters, product detail pages
  with size/price selection, cart, checkout, order confirmation with a
  one-tap WhatsApp message, and an About/Contact page.
- **Admin panel** (`/admin`): login-protected dashboard, product management
  (add/edit/delete, multiple images, decant + full bottle variants with
  price & stock), and an orders list with status updates.
- Orders are **request-based**: a customer submits their order and address,
  then confirms payment/delivery with you over WhatsApp or bank transfer —
  no payment gateway required to launch.

## Getting started

1. Install dependencies (already done if you're reading this after setup):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values (already created for
   you with a generated secret and a default admin login — see below).

3. Apply the database schema (already applied — SQLite file lives at
   `prisma/dev.db`):

   ```bash
   npx prisma migrate dev
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000 for the storefront and
   http://localhost:3000/admin for the admin panel.

## Admin login

Default credentials (change these before going live):

- **Username**: `admin`
- **Password**: `Elarenza@2026`

To set a new password:

```bash
node scripts/hash-password.js "your-new-password"
```

This prints **two versions** of the hash — use the right one for where
you're pasting it:

- **Local `.env` file**: use the escaped version (with `\$`). Next.js
  expands `$` when it reads a `.env` file, so raw bcrypt hashes must have
  every `$` written as `\$` or the value gets corrupted.
- **Netlify / Vercel environment variable settings**: use the plain
  (unescaped) version. Their dashboards store the value as-is and don't do
  `$` expansion — pasting the escaped version here will save literal
  backslashes into the value and break login.

Update `ADMIN_USERNAME` too if you want a different username. The dev
server picks up local `.env` changes automatically; on Netlify/Vercel
you need to trigger a redeploy after changing an environment variable.

## Adding your logo

Drop your logo file at `public/images/logo.png` (a square image works best,
e.g. 512×512). The header and homepage will automatically pick it up — until
then, a placeholder "E" monogram is shown.

## Sample data

Six sample perfumes were added via the seed script so you can see the site
in action:

```bash
npm run seed
```

Delete them from `/admin/products` whenever you're ready to add your real
catalogue.

## Uploaded images (local development)

While `CLOUDINARY_*` env vars are unset, product images uploaded via the
admin panel are stored in `public/uploads/`. This is fine for local
development but does **not** work on serverless hosts (see below).

## Deploying for free (Netlify or Vercel)

Netlify and Vercel's free tiers run this app's backend as serverless
functions, which have no persistent disk — so the local SQLite file and
`public/uploads/` won't work there. To deploy for free, swap in two free
hosted services first; the app already supports both and falls back to the
local file/disk automatically when they're not configured, so local
development is unaffected.

### 1. Database — Turso (free hosted SQLite)

1. Sign up at [turso.tech](https://turso.tech) and install their CLI, or use
   the web dashboard to create a database.
2. Create a database (e.g. `elarenza`) and copy its connection URL
   (`libsql://...`) and create an auth token.
3. Apply the existing schema to it. The simplest way is to run the
   generated migration SQL directly against Turso:

   ```bash
   turso db shell elarenza < prisma/migrations/20260912163529_init/migration.sql
   turso db shell elarenza < prisma/migrations/20260912170924_add_image_public_id/migration.sql
   ```

   (Run any future migration files the same way, in order, after creating
   them locally with `npx prisma migrate dev`.)
4. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in your Netlify/Vercel
   site's environment variables.

### 2. Product images — Cloudinary (free tier)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier includes
   25GB storage/bandwidth).
2. From your Cloudinary dashboard, copy the **Cloud Name**, **API Key**, and
   **API Secret**.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
   `CLOUDINARY_API_SECRET` in your Netlify/Vercel site's environment
   variables. Once set, new product image uploads go to Cloudinary instead
   of local disk automatically.

### 3. Deploy the app

1. Push this project to a GitHub repository.
2. On Netlify (or Vercel): "New site from Git" → pick the repo → it
   auto-detects Next.js, no extra config needed.
3. Add all the environment variables from your `.env` file to the site's
   environment variable settings (`SESSION_SECRET`, `ADMIN_USERNAME`,
   `ADMIN_PASSWORD_HASH`, `DATABASE_URL="file:./dev.db"`,
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
4. Deploy. Your live site's admin panel and storefront will now read/write
   through Turso and Cloudinary instead of local files.

`DATABASE_URL` itself can stay as the local file value even in
production — it's only read by the Prisma CLI when you run migrations
locally, never by the deployed app (the app always uses
`TURSO_DATABASE_URL` when it's set, via `src/lib/prisma.ts`).

## Alternative: deploy as-is to a persistent-disk host

If you'd rather not use Turso/Cloudinary, this app runs unmodified on any
host with real disk storage (a VPS, or Railway/Render with a paid disk
add-on): just run `npm run build && npm run start` and leave
`TURSO_DATABASE_URL`/`CLOUDINARY_*` unset so it keeps using the local
SQLite file and `public/uploads/`. This is simpler but rarely free
long-term.

## Business details

- **Name**: Elarenza
- **Address**: Wattala, Wattala, Sri Lanka, 11300
- **Phone / WhatsApp**: +94 75 090 8002

These are set in `src/lib/constants.ts` — update them there if they ever
change.
