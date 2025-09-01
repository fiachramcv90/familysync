# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from @shared/types - prevents API/frontend type mismatches
- **API Calls:** Never make direct HTTP calls - use the service layer with proper error handling and offline support
- **Environment Variables:** Access only through config objects in utils/config.ts, never process.env directly in components
- **Error Handling:** All API routes must use the standard error handler middleware - ensures consistent error responses
- **State Updates:** Never mutate state directly - use proper state management patterns (Zustand actions, React Query mutations)
- **Family Data Isolation:** All database queries must include family ID filtering - prevents cross-family data leaks
- **Offline Support:** All user actions must work offline-first with optimistic updates - core to PWA experience
- **Security Headers:** All API responses must include proper security headers via middleware - prevents XSS and data injection

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TaskCard.tsx`, `WeeklyDashboard.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts`, `useFamilyTasks.ts` |
| API Routes | - | kebab-case | `/api/family-members`, `/api/task-sync` |
| Database Tables | - | snake_case | `family_members`, `sync_logs` |
| Database Columns | - | snake_case | `created_at`, `assignee_id` |
| Service Methods | camelCase | camelCase | `createTask()`, `validateFamily()` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `JWT_EXPIRES_IN` |
