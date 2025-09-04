# Vercel Deployment Setup Guide

## Prerequisites

Your FamilySync project should already be linked to Vercel. This guide assumes you have:
- A Vercel account
- The project already created in Vercel
- Access to your GitHub repository settings

## Required GitHub Secrets

To enable automatic deployments, you need to configure the following secrets in your GitHub repository:

### 1. Vercel Tokens

#### VERCEL_TOKEN
- Go to [Vercel Account Settings](https://vercel.com/account/tokens)
- Click "Create Token"
- Name it something like "GitHub Actions Deploy"
- Copy the token and save it as `VERCEL_TOKEN` in GitHub Secrets

#### VERCEL_ORG_ID
- Go to your [Vercel Team Settings](https://vercel.com/account)
- Find your Organization/Team ID
- Save it as `VERCEL_ORG_ID` in GitHub Secrets

#### VERCEL_PROJECT_ID
- Go to your project in Vercel Dashboard
- Navigate to Settings → General
- Find the Project ID
- Save it as `VERCEL_PROJECT_ID` in GitHub Secrets

### 2. Turbo Cache (Optional but Recommended)

#### TURBO_TOKEN
- If using Turbo for build caching
- Get from Vercel Remote Caching settings
- Save as `TURBO_TOKEN`

#### TURBO_TEAM
- Your Vercel team slug
- Save as `TURBO_TEAM`

## Setting Up GitHub Secrets

1. Navigate to your GitHub repository
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

### Required Secrets Checklist:
- [ ] `VERCEL_TOKEN` - Your personal Vercel token
- [ ] `VERCEL_ORG_ID` - Set to: `team_N1dYKZlb2bxkiIDTb2ZkwXaz`
- [ ] `VERCEL_PROJECT_ID` - Set to: `prj_dax9EmyjRjOxDva4gMfvLEGBy37o`

## Environment Variables in Vercel

Make sure these environment variables are configured in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

## Deployment Workflow

The GitHub Actions pipeline will:

### On Pull Requests:
- Deploy a preview environment
- Comment the preview URL on the PR
- Update the comment on new commits

### On Main Branch Push:
- Deploy to production
- Create a GitHub deployment record
- Track deployment status

## Verifying the Setup

1. After adding all secrets, create a test PR
2. Check the Actions tab to see if the workflow runs
3. Verify the preview deployment comment appears
4. Merge to main and verify production deployment

## Troubleshooting

### Common Issues:

1. **"Project not linked"**: Run `vercel link` locally first
2. **Authentication errors**: Verify VERCEL_TOKEN is correct
3. **Build failures**: Check environment variables in Vercel dashboard
4. **Missing preview URLs**: Ensure PR has proper permissions

### Debugging Steps:

1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are properly set (no extra spaces)
3. Ensure Vercel project exists and is accessible
4. Check that the token has proper permissions

## Local Testing

To test the Vercel build locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull

# Run local build
vercel build

# Deploy preview
vercel
```

## Security Notes

- Never commit tokens or secrets to the repository
- Rotate VERCEL_TOKEN periodically
- Use environment-specific variables in Vercel
- Enable branch protection on main branch