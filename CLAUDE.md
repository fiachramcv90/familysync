# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
FamilySync is a family coordination PWA (Progressive Web App) built with Next.js 14+, TypeScript, and Supabase. It's designed as an offline-first mobile application for household task and schedule management. The project uses the BMad development methodology with comprehensive documentation in docs/.

## Development Commands

### Running the Application
```bash
npm run dev          # Development server with Turbopack (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
```

### Testing Commands
```bash
npm run test         # Run Jest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run Playwright with UI
```

### Code Quality
```bash
npm run lint         # ESLint validation
npm run type-check   # TypeScript type checking
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14+ App Router, React 18, TypeScript 5.2+
- **UI**: Tailwind CSS 4+ for mobile-first responsive design
- **State Management**: React Query (server state) + Zustand (client state)
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **Offline Storage**: IndexedDB for local persistence
- **Real-time**: Supabase WebSocket subscriptions
- **Testing**: Jest, React Testing Library, Playwright

### Project Structure
```
/src
  /app              # Next.js App Router pages and API routes
    /api            # API endpoints (Next.js serverless functions)
    /auth           # Authentication pages
    /dashboard      # Main dashboard view
  /components       # React components
    /auth           # Authentication components
    /layout         # Layout components (Header, Footer)
  /contexts         # React contexts (AuthContext)
  /hooks            # Custom React hooks
  /lib              # Core utilities and configurations
    auth.ts         # Authentication utilities
    supabase.ts     # Supabase client configuration
    validation.ts   # Zod validation schemas
  /types            # TypeScript type definitions
  /__tests__        # Test files (mirrored structure)
```

### Key Architectural Patterns

1. **Offline-First Architecture**: Service workers + IndexedDB for 7-day offline capability
2. **Component-Based UI**: Reusable React components with TypeScript interfaces
3. **Row Level Security (RLS)**: Database-level family data isolation in Supabase
4. **Optimistic UI Updates**: Immediate feedback before server confirmation
5. **Real-time Sync**: WebSocket subscriptions for live family coordination

## Critical Development Rules

### Database & API
- All database queries must include family_id filtering for data isolation
- API routes must use standard error handler middleware from `/lib/api-middleware.ts`
- Never make direct HTTP calls - use the service layer with proper error handling
- All user actions must work offline-first with optimistic updates

### State Management
- Server state: Use React Query mutations and queries
- Client state: Use Zustand actions (never mutate directly)
- Types: Define shared types in `/types` and import consistently

### Authentication & Security
- Authentication state managed via AuthContext
- Protected routes use ProtectedRoute component wrapper
- All API responses must include proper security headers via middleware
- Environment variables accessed only through config objects, never directly

### Naming Conventions
- **Components**: PascalCase (e.g., `TaskCard.tsx`, `WeeklyDashboard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`, `useFamilyTasks.ts`)
- **API Routes**: kebab-case (e.g., `/api/family-members`, `/api/task-sync`)
- **Database Tables**: snake_case (e.g., `family_members`, `sync_logs`)
- **Service Methods**: camelCase (e.g., `createTask()`, `validateFamily()`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`, `JWT_EXPIRES_IN`)

## Database Schema
The application uses Supabase PostgreSQL with the following core tables:
- `families`: Household coordination units
- `family_members`: Users with role-based permissions (admin/member)
- `tasks`: Family coordination tasks
- `events`: Time-specific family events
- `sync_logs`: Audit trail for offline conflict resolution

All tables include optimistic locking with version fields for conflict resolution.

## Current Implementation Status
The project is following a phased development approach:
- **Epic 1**: Foundation & Family Setup (Stories 1.1-1.3 completed)
  - Project infrastructure, authentication system, database schema implemented
- **Epic 2**: Core Task Coordination (In Progress)
- **Epic 3**: Offline-First Experience (Planned)
- **Epic 4**: Production Polish & Launch (Planned)

## Testing Strategy
- **Unit Tests**: Components and utilities in `__tests__/` directories
- **E2E Tests**: Critical user flows in `/e2e` directory
- **Test Database**: Use Supabase test client for API endpoint testing
- Tests must cover offline scenarios and sync conflict resolution

## BMad Development Methodology
The project uses BMad methodology with:
- Comprehensive PRD in `/docs/prd/`
- Architecture documentation in `/docs/architecture/`
- User stories in `/docs/stories/`
- Development agents in `.bmad-core/agents/`

When implementing features, reference the relevant story files for acceptance criteria and implementation details.