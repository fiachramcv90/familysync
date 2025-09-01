# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Node.js 18+ (using nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version  # v18.x.x
npm --version   # 9.x.x

# Install global dependencies
npm install -g turbo  # Optional: for faster builds
```

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd familysync

# Install dependencies
npm install

# Copy environment configuration
cp .env.example apps/web/.env.local
cp .env.example apps/api/.env

# Edit environment variables
nano apps/web/.env.local
nano apps/api/.env

# Initialize database
npm run db:setup

# Generate shared types
npm run codegen

# Run initial build to verify setup
npm run build
```

### Development Commands

```bash
# Start Next.js development server (full-stack)
npm run dev

# Start Supabase local development
npx supabase start

# Run database migrations
npx supabase db reset

# Run tests
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:e2e          # E2E tests only
npm run test:watch        # Watch mode for development

# Type checking
npm run typecheck         # All packages
npm run typecheck:web     # Frontend only
npm run typecheck:api     # Backend only

# Linting and formatting
npm run lint              # ESLint check
npm run lint:fix          # Fix linting issues
npm run format            # Prettier formatting

# Database operations
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed with test data
npm run db:reset          # Reset database

# Build operations
npm run build             # Production build all
npm run build:web         # Frontend build
npm run build:api         # Backend build

# Package operations
npm run clean             # Clean all build artifacts
npm run clean:deps        # Remove all node_modules
npm run reset             # Clean + reinstall dependencies
```

## Environment Configuration

### Required Environment Variables

```bash
# Next.js Application (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_NAME=FamilySync
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_SYNC_INTERVAL=30000

# Security
NEXTAUTH_SECRET=your-nextauth-secret-for-middleware
NEXTAUTH_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Shared
APP_NAME=FamilySync
APP_VERSION=1.0.0
ENVIRONMENT=development
```

## Implementation Sequencing & Epic Dependencies

**Overview:** This architecture supports phased implementation following the PRD epic structure. Critical dependencies and technical complexity require specific sequencing.

### Epic 1: Foundation (Weeks 1-4)
**Architecture Focus:** Basic Next.js + Supabase integration
- ✅ **Supabase Setup:** Database, authentication, Row Level Security policies
- ✅ **Next.js Application:** Basic routing, API routes, server components  
- ✅ **Component Foundation:** Core UI components (TaskCard, FamilyCard, basic layouts)
- ✅ **Authentication Flow:** Supabase Auth integration, protected routes, family linking

**Technical Dependencies:**
- Supabase project provisioning → Database schema creation → RLS policies → Authentication setup
- Next.js app structure → API route foundation → Component library setup

### Epic 2: Core Features (Weeks 5-8)  
**Architecture Focus:** Task management with real-time updates
- ✅ **Task Management API:** Full CRUD operations with family isolation
- ✅ **Weekly Dashboard:** Complex state management, React Query integration
- ✅ **Real-time Updates:** Supabase subscriptions for live family coordination
- ✅ **Mobile UI:** Touch-friendly interactions, responsive weekly views

**Technical Dependencies:**
- Authentication (Epic 1) → Task API endpoints → Weekly dashboard components → Real-time subscriptions
- Database schema → API validation → Frontend state management → UI optimistic updates

### Epic 3: Offline-First (Weeks 9-18) ⚠️ HIGH COMPLEXITY
**Architecture Focus:** Service worker + IndexedDB + sync orchestration
- ⚠️ **Service Worker Implementation:** Asset caching, background sync, update strategies
- ⚠️ **IndexedDB Architecture:** Local task storage, efficient querying, data cleanup
- ⚠️ **Sync Engine:** Conflict detection, resolution strategies, retry logic
- ⚠️ **Performance Optimization:** Memory management, mobile device compatibility

**Critical Technical Dependencies:**
- Task Management API (Epic 2) → Service Worker caching → IndexedDB schema → Sync conflict resolution
- Real-time subscriptions (Epic 2) → Background sync triggers → Offline indicator UI

**Complexity Warning:** Epic 3 requires 3-week additional buffer due to:
- IndexedDB cross-browser compatibility challenges (iOS Safari limitations)
- Service worker lifecycle complexity in PWA context  
- Sync conflict resolution for family coordination scenarios
- Performance optimization for mobile devices (iPhone 8+, Android 9+)

### Epic 4: Production (Weeks 19-22)
**Architecture Focus:** Security hardening + performance optimization + deployment
- ✅ **Security Implementation:** Input validation, rate limiting, encryption at rest
- ✅ **Performance Monitoring:** Observability setup, metrics tracking, alerting
- ✅ **Deployment Pipeline:** Vercel deployment, environment management, backup systems
- ✅ **Documentation:** API documentation, deployment guides, operational procedures

**Technical Dependencies:**
- All Epic 1-3 features → Security audit → Performance testing → Production deployment
- Monitoring setup → Performance validation → Security hardening → Launch preparation

## Architecture Risk Considerations by Epic

**Epic 1 Risks (LOW):** Standard Next.js + Supabase integration - well-documented patterns  
**Epic 2 Risks (MODERATE):** Real-time subscriptions complexity, mobile UI performance  
**Epic 3 Risks (HIGH):** Offline-first architecture, IndexedDB complexity, sync conflict resolution  
**Epic 4 Risks (LOW):** Standard production practices, monitoring setup

**Epic 3 Architecture Fallback Options:**
- **Simplified Offline:** Remove advanced sync, basic offline viewing only
- **Network-Required MVP:** Defer all offline features to post-MVP
- **Progressive Enhancement:** Ship basic offline, enhance post-launch
