#!/bin/bash

# GitHub Actions CI/CD Setup Script
# This script helps configure the CI/CD pipeline for FamilySync

set -e

echo "🚀 Setting up GitHub Actions CI/CD Pipeline for FamilySync"
echo "========================================================="

# Check if running in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged into Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    echo "🔗 Linking project to Vercel..."
    vercel link
fi

# Get project information
echo "📋 Project Information:"
echo "----------------------"

# Extract project and org IDs
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    
    echo "Project ID: $PROJECT_ID"
    echo "Org ID: $ORG_ID"
    
    echo ""
    echo "🔑 Add these secrets to your GitHub repository:"
    echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/settings/secrets/actions"
    echo ""
    echo "VERCEL_PROJECT_ID = $PROJECT_ID"
    echo "VERCEL_ORG_ID = $ORG_ID"
    echo "VERCEL_TOKEN = [Get from https://vercel.com/account/tokens]"
    echo ""
fi

# Check for environment file
if [ -f ".env.local" ]; then
    echo "🌍 Detected environment variables in .env.local"
    echo "Make sure to add these to both GitHub Secrets and Vercel:"
    echo ""
    grep "SUPABASE" .env.local | sed 's/=.*/= [YOUR_VALUE]/' || true
    echo ""
fi

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Run initial checks
echo "🧪 Running initial quality checks..."

# Check TypeScript
if npm run type-check; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check failed - please fix before deploying"
fi

# Check linting
if npm run lint; then
    echo "✅ ESLint check passed"  
else
    echo "❌ ESLint check failed - run 'npm run lint:fix' to auto-fix"
fi

# Check formatting
if npm run format:check; then
    echo "✅ Prettier check passed"
else
    echo "❌ Prettier check failed - run 'npm run format' to fix formatting"
fi

# Test build
echo "🏗️ Testing production build..."
if npm run build; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed - please fix before deploying"
    exit 1
fi

echo ""
echo "🎉 CI/CD Pipeline Setup Complete!"
echo "================================="
echo ""
echo "Next steps:"
echo "1. Add the GitHub secrets shown above"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Enable branch protection on main branch"
echo "4. Create a pull request to test the pipeline"
echo ""
echo "📚 For more details, see .github/README.md"