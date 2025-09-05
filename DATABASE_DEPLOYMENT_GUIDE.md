# 🚀 Database Deployment Guide for FamilySync

This guide will help you deploy the database schema to your production Supabase instance and fix the authentication issues.

## 🔧 Prerequisites

1. **Supabase CLI installed** ✅ (Already done)
2. **Production Supabase project created**
3. **Supabase project credentials**

## 📋 Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **Project Reference ID** (e.g., `abcdefghijk`)
   - **anon public key** 
   - **service_role secret key**

## 🗄️ Step 2: Deploy Database Schema

### Option A: Using the Deployment Script (Recommended)

```bash
# Set your credentials
export SUPABASE_PROJECT_URL='https://your-project-ref.supabase.co'
export SUPABASE_SERVICE_KEY='your-service-role-key'

# Run the deployment script
./deploy-database.sh
```

### Option B: Manual Deployment

```bash
# 1. Link to your production project
supabase link --project-ref your-project-ref

# 2. Apply migrations
supabase db push
```

## 🔐 Step 3: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **familysync** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔄 Step 4: Redeploy Application

1. In Vercel dashboard, go to **Deployments**
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

## ✅ Step 5: Test Authentication

1. Visit your deployed app: https://simple-todo-app-bmad.vercel.app/
2. Try to register a new account
3. Try to log in with the created account

## 🧪 Step 6: Run Diagnostic Tests (Optional)

```bash
# Test authentication flow
npx playwright test e2e/auth-diagnostics.spec.ts --headed

# Test simple authentication
npx playwright test e2e/simple-auth-diagnostic.spec.ts --headed
```

## 🔍 What Changed?

The new database schema:

1. **✅ Uses Supabase Auth** instead of custom authentication
2. **✅ Integrates with `auth.users` table**
3. **✅ Proper Row Level Security (RLS) policies**
4. **✅ Family-based data isolation**
5. **✅ Invitation system for family members**

## 🚨 Troubleshooting

### Issue: "Cannot connect to Supabase"
- **Solution**: Check your `NEXT_PUBLIC_SUPABASE_URL` in Vercel environment variables

### Issue: "Invalid JWT"
- **Solution**: Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### Issue: "RLS policy violation"
- **Solution**: The migrations include proper RLS policies. If issues persist, check Supabase logs

### Issue: "No tables exist"
- **Solution**: Run the migration deployment again: `supabase db push`

## 📞 Need Help?

If you encounter issues:

1. Check Supabase project logs in the dashboard
2. Verify environment variables are set correctly in Vercel
3. Run the diagnostic tests to identify specific problems
4. Check that your Supabase project is in the correct region

## 🎯 Expected Result

After following this guide:

- ✅ Users can register new accounts
- ✅ Users can log in successfully  
- ✅ Authentication redirects work properly
- ✅ Family data is properly isolated
- ✅ All CI tests pass