# Deployment Guide

## Prerequisites

- pnpm >= 9.0.0
- Node.js >= 20.9.0
- Supabase account (database + storage)
- Clerk account (authentication)
- Vercel account (frontend)
- Railway account (backend API)

---

## Step 1: Supabase Setup (Database + Storage)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy:
   - `DATABASE_URL` (with pgbouncer for connection pooling)
   - `DIRECT_URL` (direct connection for migrations)
3. Go to **Storage** and create a bucket named `qr-assets`
4. Set bucket to **Public** for QR logo images
5. Copy `SUPABASE_URL` and keys from **Settings → API**

---

## Step 2: Clerk Setup (Authentication)

1. Create an app at [clerk.com](https://clerk.com)
2. Enable **Organizations** feature in Clerk dashboard
3. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. Add a webhook endpoint pointing to your deployed API:
   - URL: `https://your-api.railway.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
5. Copy `CLERK_WEBHOOK_SECRET`

---

## Step 3: Database Migration

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL

# Generate Prisma client
pnpm db:generate

# Apply migrations
pnpm --filter @qr-platform/database db:migrate

# (Optional) Seed sample data
pnpm --filter @qr-platform/database db:seed
```

---

## Step 4: Deploy Backend to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. From the `apps/api` directory: `railway init`
4. Set environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<supabase-pooled-url>
   DIRECT_URL=<supabase-direct-url>
   CLERK_SECRET_KEY=<clerk-secret>
   CLERK_WEBHOOK_SECRET=<webhook-secret>
   JWT_SECRET=<random-32+-chars>
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```
5. Deploy: `railway up`
6. Note your Railway API URL (e.g., `https://qr-api.up.railway.app`)

---

## Step 5: Deploy Frontend to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. From the `apps/web` directory: `vercel --prod`
3. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
   CLERK_SECRET_KEY=sk_live_xxx
   CLERK_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_API_URL=https://your-api.railway.app
   API_URL=https://your-api.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxx
   NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
   ```
4. Note your Vercel URL

---

## Step 6: Update Clerk Redirect URLs

In Clerk dashboard → **Paths**:
- Sign-in URL: `https://your-frontend.vercel.app/sign-in`
- Sign-up URL: `https://your-frontend.vercel.app/sign-up`
- After sign-in: `https://your-frontend.vercel.app/dashboard`
- After sign-up: `https://your-frontend.vercel.app/dashboard`

---

## Step 7: Verify Deployment

1. Visit `https://your-api.railway.app/api/health` → should return `{ status: "ok" }`
2. Visit `https://your-frontend.vercel.app` → landing page should load
3. Sign up for an account
4. Create your first QR code
5. Scan it and check analytics

---

## Troubleshooting

### Database connection errors
- Ensure `DATABASE_URL` uses the pooled connection string from Supabase
- Ensure `DIRECT_URL` uses the direct connection string for migrations

### Clerk webhook 401 errors
- Verify `CLERK_WEBHOOK_SECRET` matches the secret shown in Clerk dashboard
- Ensure the webhook URL is correct and publicly accessible

### CORS errors
- Ensure `NEXT_PUBLIC_APP_URL` in the API matches your actual frontend URL exactly
