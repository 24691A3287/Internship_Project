# 🔷 Unified QR Platform
### Enterprise Digital Identity & Smart QR Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-ready, full-stack enterprise QR code management platform. Create dynamic QR codes, track every scan with deep analytics, manage teams with role-based access, and scale to millions of scans.

---

## ✨ Features

| Feature | Description |
|---|---|
| **10 QR Types** | URL, vCard, WiFi, Email, Phone, SMS, Crypto, Location, Event, Text |
| **Dynamic QR Codes** | Change destination URLs after creation without reprinting |
| **Real-time Analytics** | Scan tracking with geo, device, browser, and time-series data |
| **Multi-tenant Orgs** | Multiple organizations with isolated data per org |
| **Role-Based Access** | OWNER → ADMIN → MEMBER → VIEWER permission hierarchy |
| **QR Customization** | Colors, styles, logos, error correction levels |
| **Download Formats** | Export QR as PNG, SVG |
| **API Keys** | Programmatic access via generated API keys |
| **Admin Dashboard** | Platform-wide stats, user management, audit logs |
| **Dark Mode** | Beautiful dark/light theme with system preference support |

---

## 🏗️ Architecture

```
qr-platform/                 ← Monorepo root (pnpm + Turborepo)
├── apps/
│   ├── web/                 ← Next.js 15 frontend (Vercel)
│   └── api/                 ← Express.js REST API (Railway)
└── packages/
    ├── database/            ← Prisma schema + client
    └── types/               ← Shared TypeScript types
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js 20, Express.js 5, TypeScript, Zod v3 |
| **Database** | PostgreSQL 16 via Supabase + Prisma 7 ORM |
| **Auth** | Clerk (JWT, webhooks, organizations) |
| **Storage** | Supabase Storage (logos, assets) |
| **Cache** | Upstash Redis (rate limiting) |
| **QR Generation** | node-qrcode |
| **Charts** | Recharts 2.x |
| **State** | Zustand + TanStack Query |
| **Deploy** | Vercel (web) + Railway (api) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.9.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **PostgreSQL** database (Supabase recommended)
- **Clerk** account ([clerk.com](https://clerk.com))

### 1. Clone & Install

```bash
git clone https://github.com/24691A3287/Internship_Project.git qr-platform
cd qr-platform
pnpm install
```

### 2. Configure Environment

```bash
# Copy and fill in environment variables
cp .env.example .env
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env
```

Fill in the required values in each `.env` file:
- `DATABASE_URL` — Your PostgreSQL connection string
- `CLERK_SECRET_KEY` — From Clerk dashboard
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — From Clerk dashboard
- `JWT_SECRET` — A random 32+ character string

### 3. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed with sample data
pnpm --filter @qr-platform/database db:seed
```

### 4. Start Development

```bash
# Start both frontend and backend simultaneously
pnpm dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health**: http://localhost:4000/api/health

---

## 📁 Project Structure

### Frontend (`apps/web/src/`)

```
app/
├── (auth)/           # Clerk sign-in/sign-up pages
├── (dashboard)/      # Protected dashboard routes
│   ├── dashboard/    # Overview & KPIs
│   ├── qrcodes/      # QR code management
│   ├── analytics/    # Analytics dashboard
│   ├── folders/      # Folder organization
│   ├── organization/ # Org settings & members
│   ├── settings/     # User settings & API keys
│   └── admin/        # Super admin panel
├── (public)/         # Landing page, pricing
└── api/              # Next.js route handlers
components/
├── ui/               # shadcn/ui primitives
├── layout/           # Sidebar, Header, Nav
├── qr/               # QR-specific components
├── analytics/        # Chart components
└── shared/           # Reusable components
```

### Backend (`apps/api/src/`)

```
modules/
├── auth/             # Clerk webhook handling
├── qrcodes/          # QR CRUD + redirect + download
├── analytics/        # Scan tracking + aggregation
├── organizations/    # Multi-tenant org management
├── folders/          # QR folder organization
├── apikeys/          # Programmatic API access
└── admin/            # Super admin endpoints
services/
├── qr.service.ts     # QR code generation (qrcode)
├── geo.service.ts    # IP geolocation
└── analytics.service.ts # Analytics aggregation
```

---

## 🔐 Authentication & RBAC

Clerk handles authentication. Roles are stored in the database and checked server-side.

| Permission | VIEWER | MEMBER | ADMIN | OWNER | SUPER_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| View QR codes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create QR codes | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete QR codes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage members | ❌ | ❌ | ✅ | ✅ | ✅ |
| Org settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🌐 API Reference

Base URL: `http://localhost:4000/api`

### QR Codes
```
GET    /qrcodes              List QR codes (paginated, filtered)
POST   /qrcodes              Create QR code
GET    /qrcodes/:id          Get QR code details
PATCH  /qrcodes/:id          Update QR code
DELETE /qrcodes/:id          Soft delete QR code
POST   /qrcodes/:id/duplicate Duplicate QR code
GET    /qrcodes/:id/download Download QR (PNG/SVG)
GET    /r/:shortCode         QR redirect (public)
```

### Analytics
```
GET    /analytics/overview        Dashboard KPIs
GET    /analytics/timeseries      Scan time series
GET    /analytics/geo             Geographic breakdown
GET    /analytics/devices         Device breakdown
GET    /analytics/qrcodes/:id     Per-QR analytics
GET    /analytics/scans           Scan feed
```

### Organizations
```
GET    /organizations              List user's orgs
POST   /organizations              Create org
GET    /organizations/:id          Get org
PATCH  /organizations/:id          Update org
GET    /organizations/:id/members  List members
POST   /organizations/:id/members  Invite member
PATCH  /organizations/:id/members/:userId  Update role
DELETE /organizations/:id/members/:userId  Remove member
```

**Authentication**: Include `Authorization: Bearer <clerk-token>` header on all protected routes.

---

## 🚢 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL` (your Railway API URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend → Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd apps/api
railway up
```

Set environment variables in Railway dashboard:
- `DATABASE_URL` (Supabase connection string)
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL` (your Vercel frontend URL)

### Database → Supabase

1. Create a new Supabase project
2. Copy connection strings to your `.env`
3. Run `pnpm db:migrate` to apply schema

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend tests only
pnpm --filter @qr-platform/api test

# Frontend tests only
pnpm --filter @qr-platform/web test
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database with sample data |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ using Next.js, Express, Prisma, and Clerk
</div>
