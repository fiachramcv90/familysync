# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.2+ | Type safety across components and API calls | Prevents runtime errors and enables better IDE support for component architecture |
| Frontend Framework | Next.js | 14.2+ | Full-stack React framework with App Router | Server Components for performance, API Routes for serverless backend, excellent PWA support |
| UI Component Library | Custom + Tailwind CSS | Latest | Mobile-first responsive design system | Front-end spec requires custom lightweight components, Tailwind enables rapid mobile-optimized styling |
| State Management | React Query + Zustand | 5.0+ / 4.4+ | Server state (React Query) + Client state (Zustand) | React Query handles Supabase integration and offline sync, Zustand for simple local state |
| Backend Framework | Next.js API Routes | 14.2+ | Serverless functions integrated with frontend | Eliminates separate backend complexity, optimal for solo developer, automatic Vercel deployment |
| Database Service | Supabase PostgreSQL | Latest | Managed PostgreSQL with real-time capabilities | Built-in auth, Row Level Security, real-time subscriptions, eliminates migration complexity |
| API Style | REST + Real-time | HTTP + WebSocket | RESTful endpoints with live subscriptions | Simple REST for mutations, WebSocket subscriptions for live updates, works with service workers |
| Authentication | Supabase Auth | Latest | Managed authentication with JWT tokens | Built-in user management, MFA support, automatic token refresh, reduces auth complexity by 80% |
| Cache | IndexedDB | Native | Offline-first local storage | Browser-native, supports complex queries needed for weekly dashboard |
| File Storage | Supabase Storage | Latest | Managed cloud storage for future file uploads | Integrated with database, automatic CDN, simple API, scales with usage |
| Frontend Testing | Jest + React Testing Library | Latest | Unit and integration testing for components | Matches React patterns, supports component testing from front-end spec |
| Backend Testing | Jest + Supabase Test Client | Latest | API endpoint and database testing | Tests Next.js API routes with Supabase, supports RLS policy testing |
| E2E Testing | Playwright | Latest | Critical user flow testing | Excellent PWA support, cross-browser mobile testing capabilities |
| Build Tool | Next.js | 14.2+ | Integrated build system with optimizations | Built-in TypeScript, CSS, image optimization, automatic code splitting |
| Bundler | Turbopack | Next.js 14+ | Next-generation bundler for development | Faster than Webpack, built into Next.js, optimal for large applications |
| IaC Tool | Vercel Configuration | Built-in | Simple deployment via vercel.json | Zero-config deployment, environment variables, preview deployments |
| CI/CD | Vercel + GitHub | Built-in | Automatic deployment on git push | Integrated with Vercel, automatic preview deployments, built-in testing |
| Monitoring | Vercel Analytics + Supabase Dashboard | Built-in | Performance and error tracking | Web vitals, database performance, real-time logs, no additional setup |
| Logging | Next.js Built-in + Supabase Logs | Latest | Structured logging with database audit trail | Console logging for development, Supabase logs for production debugging |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first mobile-responsive styling | Perfect match for front-end spec design system and mobile-first approach |
