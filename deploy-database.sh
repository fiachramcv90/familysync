#!/bin/bash

# Database deployment script for FamilySync production
# This script applies the database schema to your production Supabase instance

set -e

echo "🚀 FamilySync Database Deployment Script"
echo "========================================"

# Check if credentials are provided as arguments
if [ $# -eq 2 ]; then
    SUPABASE_PROJECT_URL="$1"
    SUPABASE_SERVICE_KEY="$2"
    echo "✅ Using credentials from command line arguments"
elif [ -n "$SUPABASE_PROJECT_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo "✅ Using credentials from environment variables"
else
    echo "❌ Missing required credentials. Provide them either as:"
    echo ""
    echo "Option 1 - Environment variables:"
    echo "   export SUPABASE_PROJECT_URL='https://your-project.supabase.co'"
    echo "   export SUPABASE_SERVICE_KEY='eyJ...your-service-key'"
    echo "   ./deploy-database.sh"
    echo ""
    echo "Option 2 - Command arguments:"
    echo "   ./deploy-database.sh 'https://your-project.supabase.co' 'eyJ...your-service-key'"
    echo ""
    exit 1
fi

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_PROJECT_URL | sed 's|https://||' | sed 's|.supabase.co||')
echo "📍 Deploying to project: $PROJECT_REF"

# Initialize Supabase connection
echo "🔑 Linking to production Supabase project..."
supabase link --project-ref $PROJECT_REF --password ""

# Apply migrations
echo "🗄️  Applying database migrations..."
supabase db push

echo "✅ Database deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set these environment variables in Vercel:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_PROJECT_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]"
echo "   SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY"
echo ""
echo "2. Redeploy your application on Vercel"
echo "3. Test authentication on your deployed app"