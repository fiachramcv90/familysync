# GitHub Actions CI/CD Pipeline

This document describes the comprehensive CI/CD pipeline configured for the FamilySync application, designed to ensure code quality, test coverage, and reliable deployments to Vercel.

## Pipeline Overview

The CI/CD pipeline consists of several stages that run automatically on pull requests and pushes to the main branch:

### 🧪 Test Stage
- **TypeScript Compilation**: Ensures all TypeScript code compiles without errors
- **ESLint Validation**: Enforces code quality and style guidelines  
- **Prettier Formatting**: Validates consistent code formatting
- **Unit Tests**: Runs Jest test suite with coverage reporting
- **Component Tests**: Validates React components with Testing Library

### 🏗️ Build Stage
- **Next.js Production Build**: Creates optimized production bundles
- **Bundle Size Analysis**: Monitors application size for performance
- **PWA Service Worker**: Generates progressive web app assets
- **Environment Validation**: Ensures all required environment variables are configured

### 🎭 E2E Testing Stage
- **Authentication Flow Tests**: Validates complete login/register workflows
- **Protected Routes**: Ensures proper access control
- **Mobile Responsiveness**: Tests across desktop and mobile viewports
- **Dashboard Functionality**: Verifies family coordination features

### 🚀 Deployment Stages

#### Preview Deployments (Pull Requests)
- Deploys every pull request to a unique Vercel preview URL
- Automatically comments on PR with preview link
- Enables testing before merging to main

#### Production Deployments (Main Branch)
- Deploys to production only after all tests pass
- Includes health check validation
- Runs Lighthouse performance audits
- Provides deployment notifications

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Vercel Configuration
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Instructions

### 1. Vercel Integration

First, link your repository to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Get project and org IDs
vercel project ls
```

Add the IDs to your GitHub secrets.

### 2. Environment Variables

In your Vercel dashboard, configure the same environment variables that are used in your local `.env.local` file.

### 3. Branch Protection

Enable branch protection for the `main` branch:
- Require status checks to pass
- Require branches to be up to date
- Require pull request reviews

### 4. Notifications (Optional)

Configure Slack or Discord webhooks for deployment notifications by adding:
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Workflow Triggers

### Pull Request Events
- Opens new pull request → Deploy preview
- Updates existing pull request → Update preview
- Runs full test suite on every change

### Main Branch Events  
- Push to main → Deploy to production
- Only deploys if all tests pass
- Includes post-deployment verification

## Performance Monitoring

### Lighthouse Audits
- Runs on every production deployment
- Monitors performance, accessibility, SEO, and PWA metrics
- Fails deployment if critical metrics drop below thresholds

### Bundle Size Analysis
- Tracks JavaScript bundle sizes
- Alerts on significant size increases
- Helps maintain optimal loading performance

## Testing Strategy

### Unit Tests (Jest + Testing Library)
- Component behavior validation
- Hook functionality testing
- Utility function verification
- API endpoint testing

### E2E Tests (Playwright)
- Cross-browser compatibility
- Mobile responsiveness
- Complete user workflows
- Authentication system validation

### Integration Tests
- Database connectivity
- API endpoint functionality  
- Authentication flow end-to-end
- Protected route access control

## Troubleshooting

### Common Issues

**Build Failures**
- Check TypeScript errors in Actions logs
- Verify all environment variables are set
- Ensure dependencies are properly installed

**Test Failures**
- Review test output in Actions summary
- Check for Supabase connectivity issues
- Verify test database is accessible

**Deployment Issues**
- Confirm Vercel tokens are valid
- Check project ID and org ID configuration
- Verify environment variables in Vercel dashboard

**E2E Test Failures**
- Ensure development server starts properly
- Check for authentication setup issues
- Verify test data is available

### Debugging Commands

```bash
# Run tests locally to reproduce issues
npm run ci:test

# Check formatting issues  
npm run format:check

# Run E2E tests with UI
npm run test:e2e:ui

# Build project locally
npm run ci:build
```

## Deployment URLs

- **Production**: https://familysync-production.vercel.app
- **Preview**: Unique URL generated for each PR
- **Health Check**: https://familysync-production.vercel.app/api/health

## Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs
2. Review Vercel deployment logs  
3. Verify all secrets are configured
4. Test locally to reproduce issues
5. Review this documentation for configuration details

The pipeline is designed to catch issues early and ensure reliable deployments, enabling confident releases of the FamilySync authentication system and family coordination features.