#!/bin/bash

# Direct SQL migration deployment for FamilySync
# Alternative approach using direct SQL execution

set -e

echo "🚀 FamilySync Direct SQL Migration Deployment"
echo "============================================="

# Check if credentials are provided
if [ $# -eq 2 ]; then
    SUPABASE_PROJECT_URL="$1"
    SUPABASE_SERVICE_KEY="$2"
elif [ -n "$SUPABASE_PROJECT_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo "✅ Using environment variables"
else
    echo "❌ Usage: $0 'https://project.supabase.co' 'service-role-key'"
    exit 1
fi

# Extract project reference
PROJECT_REF=$(echo $SUPABASE_PROJECT_URL | sed 's|https://||' | sed 's|.supabase.co||')
echo "📍 Deploying to project: $PROJECT_REF"

# Supabase database connection details
DB_URL="postgresql://postgres:[SERVICE_KEY]@db.$PROJECT_REF.supabase.co:5432/postgres"
DB_URL_WITH_KEY=$(echo $DB_URL | sed "s/\[SERVICE_KEY\]/$SUPABASE_SERVICE_KEY/")

echo "🗄️  Applying database migrations..."

# Try to apply the migration directly using curl to Supabase REST API
echo "📡 Using Supabase REST API to execute migration..."

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/20250905000000_supabase_auth_schema.sql)

# Create a temporary file with the SQL
cat > /tmp/migration.sql << 'EOF'
-- Apply migration via REST API
EOF
cat supabase/migrations/20250905000000_supabase_auth_schema.sql >> /tmp/migration.sql

echo "🔧 Executing SQL migration via Supabase API..."

# Use curl to execute the SQL via Supabase REST API
curl -X POST "$SUPABASE_PROJECT_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(cat /tmp/migration.sql | tr '\n' ' ' | sed 's/"/\\"/g')\"}" \
  --fail-with-body

# Clean up
rm /tmp/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "Next steps:"
echo "1. Set these environment variables in Vercel:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_PROJECT_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]"
echo "   SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY"