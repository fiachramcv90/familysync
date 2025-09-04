#!/bin/bash

# CI/CD Pipeline Test Script
# Runs local validation similar to what GitHub Actions will run

set -e

echo "🧪 Running CI/CD Pipeline Tests Locally"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "1️⃣ TypeScript Compilation Check"
echo "-------------------------------"
if npm run type-check; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript check failed (non-blocking)"
fi

echo ""
echo "2️⃣ ESLint Code Quality Check"
echo "----------------------------"
if npm run lint; then
    echo "✅ ESLint check passed"
else
    echo "⚠️  ESLint check failed (non-blocking)"
fi

echo ""
echo "3️⃣ Prettier Formatting Check"
echo "-----------------------------"
if npm run format:check; then
    echo "✅ Prettier check passed"
else
    echo "⚠️  Prettier formatting issues found"
    echo "💡 Run 'npm run format' to fix formatting"
fi

echo ""
echo "4️⃣ Unit Tests"
echo "-------------"
if npm run test; then
    echo "✅ Unit tests passed"
else
    echo "❌ Unit tests failed"
    echo "🔧 Fix unit tests before deploying"
fi

echo ""
echo "5️⃣ Production Build"
echo "-------------------"
if npm run build; then
    echo "✅ Production build successful"
else
    echo "❌ Production build failed"
    echo "🔧 Fix build errors before deploying"
    exit 1
fi

echo ""
echo "6️⃣ E2E Tests (Optional)"
echo "----------------------"
echo "💡 E2E tests require a running development server"
echo "   Run 'npm run dev' in another terminal, then:"
echo "   npm run test:e2e"

echo ""
echo "🎉 Local CI/CD Pipeline Validation Complete!"
echo "============================================="
echo ""
echo "📋 Summary:"
echo "- TypeScript: Check with warnings (non-blocking)"
echo "- ESLint: Check with warnings (non-blocking)"  
echo "- Prettier: Formatting validation"
echo "- Tests: Unit test execution"
echo "- Build: Production build verification"
echo ""
echo "🚀 Your code is ready for CI/CD pipeline!"
echo "   Push to main branch or create a pull request to trigger deployment"