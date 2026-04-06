<p align="center">
  <img src="src/images/original.png" alt="Zakiya Design" width="320" />
</p>

<h1 align="center">Zakiya Design</h1>

<p align="center"><strong>Management system for Zakiya Design</strong> — public storefront, order tracking, and a protected admin console backed by Supabase.</p>

<p align="center">
  React · Vite · Tailwind CSS · Supabase
</p>

<p align="center">
  <strong>Live:</strong> <a href="https://zakiya-desig.vercel.app">zakiya-desig.vercel.app</a>
  · <a href="https://zakiya-desig.vercel.app/login">Admin login</a>
</p>

---

## Production (Vercel)

| | URL |
|--|-----|
| **Site** | [https://zakiya-desig.vercel.app](https://zakiya-desig.vercel.app) |
| **Admin sign-in** | [https://zakiya-desig.vercel.app/login](https://zakiya-desig.vercel.app/login) |

In **Vercel → Project → Settings → Environment Variables**, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production), then redeploy. In **Supabase → Authentication → URL configuration**, set **Site URL** to `https://zakiya-desig.vercel.app` and add the same origin under **Redirect URLs**.

---

## Overview

This application serves two audiences:

| Area | Route | Audience |
|------|--------|----------|
| **Storefront** | `/` | Customers browse products, track orders by order number |
| **Admin dashboard** | `/dashboard` | Staff manage customers, orders, finances, reports, and team access |

Authentication is handled with **Supabase Auth**. The storefront uses the public anon key for reads where your Row Level Security allows it. Dashboard routes require a signed-in user.

---

## Features

- Landing page with featured products and **order tracking** (by order reference)
- **Admin dashboard**: overview metrics, customer growth chart, recent orders
- **CRM-style** customers, orders, financial summaries, reports
- **Settings**: change password for email/password accounts
- **Admin users**: invite additional dashboard users (profiles + Auth signup)
- Responsive layouts and light/dark theme support (`class`-based dark mode)
- Session protection: dashboard requires login; logged-in users are redirected away from `/login`

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19, React Router 7 |
| Build | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Supabase (Postgres, Auth, API) |

---

## Prerequisites

- A **Supabase** project with tables such as `products`, `orders`, `order_details`, `customers`, `profiles` (and policies that match your security model)
- **Environment variables** (see below)

---

## Environment variables

Create a `.env` in the project root (see `.env.example` if present):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Never commit real keys or service-role keys. The anon key is safe for the frontend only with RLS properly configured.

---

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

Other scripts:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run seed:admin` | Run admin user seed script (if `scripts/seed-user.mjs` exists and is configured) |

---

## Project structure (high level)

```
src/
  App.jsx              # Routes and layouts
  pages/               # Landing, login, dashboard pages
  layouts/             # Landing shell, dashboard shell (sidebar)
  components/          # Track order, auth route guards, etc.
  services/supabase.js # Supabase client
  images/              # Brand assets (e.g. original.png, white_on_trans.png)
public/
  favicon.svg
```

---

## Admin access

1. Open **`/login`**, or use **Admin** in the storefront header.
2. Sign in with an account that exists in **Supabase Auth** and has access to your data per RLS.

### Admin credentials (live + local)

Use on [Admin login](https://zakiya-desig.vercel.app/login) or `/login` when running locally. **Rotate the password regularly**; treat this repo as sensitive if the password is real.

| | |
|--|--|
| **Email** | `zakiya@gmail.com` |
| **Password** | `12345678` |

If sign-in fails on production, confirm the user exists in Supabase **Authentication → Users**, that **Email** provider is enabled, that **Site URL / Redirect URLs** include `https://zakiya-desig.vercel.app`, and that Gmail addresses meet Supabase email-validation rules if applicable.

---

## Supabase notes

- Ensure **Row Level Security** policies allow what each role needs (public reads for products/orders where appropriate; authenticated reads/writes for admin tables).
- **`customers.created_at`** powers the dashboard **customer growth** chart; missing dates are ignored for that series.
- New admins may be created from **Dashboard → Admin users**; email confirmation settings affect whether the current session stays active after inviting someone.

---

## Brand assets

Primary logo for documentation and offline use: **`src/images/original.png`**.  
The app also uses variants such as `white_on_trans.png` and `trans_bg.png` in the UI (e.g. login and sidebar) for contrast on different backgrounds.

---
