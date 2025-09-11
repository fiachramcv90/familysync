# 🔐 Vercel Environment Variables Setup

## Your Production Supabase Credentials

Based on your Supabase project `supabase-rose-book` (ID: `yxrritixuupcvmnucwop`):

### ✅ Step 1: Set These Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **simple-todo-app-bmad** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yxrritixuupcvmnucwop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cnJpdGl4dXVwY3ZtbnVjd29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTUzNDQsImV4cCI6MjA3MjU5MTM0NH0.NR4jS0KxHk7c2pdiFHnm3shHwiGe-ZNoWJfcj7_i5YE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cnJpdGl4dXVwY3ZtbnVjd29wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNTM0NCwiZXhwIjoyMDcyNTkxMzQ0fQ.e859A7apgN-17acVq37xjICnoU8HYBF6ByOGZPGkAT8
```

### ✅ Step 2: Update GitHub Secrets (for CI/CD)

1. Go to your GitHub repository: **Settings** → **Secrets and Variables** → **Actions**
2. Add/Update these secrets:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yxrritixuupcvmnucwop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cnJpdGl4dXVwY3ZtbnVjd29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTUzNDQsImV4cCI6MjA3MjU5MTM0NH0.NR4jS0KxHk7c2pdiFHnm3shHwiGe-ZNoWJfcj7_i5YE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cnJpdGl4dXVwY3ZtbnVjd29wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxNTM0NCwiZXhwIjoyMDcyNTkxMzQ0fQ.e859A7apgN-17acVq37xjICnoU8HYBF6ByOGZPGkAT8
```

### ✅ Step 3: Redeploy Your Application

After setting the environment variables:

1. In Vercel dashboard, go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete (usually 2-3 minutes)

### 🗄️ Database Status: ✅ READY

Your production database now has:

- ✅ **families** table with UUID IDs, invite codes, settings
- ✅ **family_members** table integrated with Supabase Auth
- ✅ **tasks** table with full task management features
- ✅ **Row Level Security (RLS)** enabled for data isolation
- ✅ **Proper foreign key relationships** between tables
- ✅ **Authentication integration** with auth.users

### 🧪 Step 4: Test the Fix

After redeploying:

1. Visit: https://simple-todo-app-bmad.vercel.app/
2. Try to register a new account
3. Try to log in with the created account

### 🔍 If Issues Persist

Run the diagnostic tests:
```bash
npx playwright test e2e/auth-diagnostics.spec.ts --headed
```

## ✅ Expected Result

- ✅ Users can register new accounts
- ✅ Users can log in successfully  
- ✅ Authentication redirects work properly
- ✅ No more "Failed to create family" errors
- ✅ Database operations work correctly