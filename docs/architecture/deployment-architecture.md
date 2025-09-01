# Deployment Architecture

## Deployment Strategy

**Full-Stack Deployment:**
- **Platform:** Vercel (Next.js optimized)
- **Build Command:** `npm run build` (Next.js handles both client and API)
- **Output Directory:** `.next/` (Next.js optimized build)
- **CDN/Edge:** Global edge caching with Vercel Edge Network + API Routes at edge

**Database Deployment:**
- **Platform:** Supabase (managed PostgreSQL)
- **Migrations:** Automated via Supabase CLI
- **Deployment Method:** Git-based migrations with RLS policy updates

## CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ':memory:'
          JWT_SECRET: test-secret
      
      - name: Build applications
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_API_URL: http://localhost:3000

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
        
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: familysync-api

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web
```

## Environments

| Environment | Application URL | Database URL | Purpose |
|-------------|-----------------|--------------|---------|
| Development | http://localhost:3000 | http://localhost:54321 | Local development with Supabase local |
| Staging | https://staging-familysync.vercel.app | https://staging.supabase.co | Pre-production testing |
| Production | https://familysync.vercel.app | https://familysync.supabase.co | Live environment |
