# Technical Assumptions

## Repository Structure: Monorepo
Simple monorepo structure with shared components and straightforward build process. Frontend and backend code co-located for solo developer maintainability with clear separation between client and server directories. This supports rapid iteration and simplified deployment while keeping complexity low for bootstrap development.

## Service Architecture
**Single Backend Service (Monolith)** - Initially deploy as single Node.js/Express REST API service to minimize infrastructure complexity and operational overhead. Modular code organization allows future microservices extraction if user base grows beyond 10,000 families. No real-time features required - standard HTTP REST endpoints sufficient for async collaboration model.

## Testing Requirements
**Unit + Integration Testing** - Implement unit tests for core business logic and integration tests for API endpoints. Focus on testing offline sync logic, family data privacy, and task coordination workflows. Manual testing convenience methods for mobile PWA functionality across different devices and browsers. No complex E2E automation initially due to solo developer constraints.

## Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- React 18+ with TypeScript for type safety and maintainability
- Tailwind CSS for mobile-first responsive design system
- PWA service worker for offline-first functionality and app-like experience
- Local storage and IndexedDB for offline data persistence
- React Query for efficient server state management and sync

**Backend Technology Stack:**
- Next.js API Routes for serverless backend functions (integrated with frontend, optimal for solo developer)
- Supabase PostgreSQL database (managed, real-time capabilities, built-in auth, immediate scalability)
- Supabase Auth for JWT authentication and user management (secure, battle-tested, reduces development overhead)
- Supabase Row Level Security (RLS) for family data isolation and privacy
- Supabase Edge Functions for advanced business logic and background processing

**Database and Data Architecture:**
- Supabase PostgreSQL from day one (eliminates migration complexity, supports 10,000+ families immediately)
- Real-time subscriptions for live family coordination updates
- Row Level Security (RLS) policies ensuring family data isolation
- Relational schema: Users, Families, Tasks, Events with optimized indexes
- Optimistic UI updates with conflict resolution for offline-first experience
- Automated Supabase backups with family data export via API

**Deployment and Infrastructure:**
- Full-stack Next.js deployment on Vercel (optimal integration, global edge network, zero-config PWA support)
- Supabase hosted database and auth (managed PostgreSQL, global distribution, automatic scaling)
- SSL/HTTPS included by default (Vercel + Supabase provide enterprise-grade security)
- Environment-based configuration via Vercel environment variables
- Total infrastructure cost target: <$50/month for MVP scale (Supabase free tier + Vercel hobby plan)

**Security and Privacy Framework:**

*Authentication & Authorization:*
- **Multi-factor Authentication (MFA):** Optional but recommended for family accounts
- **JWT Security:** 15-minute access tokens, 7-day refresh tokens with rotation
- **Password Policy:** Minimum 12 characters, complexity requirements, breach database checking
- **Session Management:** Automatic logout after 30 days inactivity, concurrent session limits (3 per user)
- **Family Access Control:** Role-based permissions (Admin, Member), invitation-only family joining

*Data Protection:*
- **Encryption at Rest:** AES-256 encryption for all family data in database
- **Encryption in Transit:** TLS 1.3 minimum, HSTS headers, certificate pinning
- **Data Isolation:** Database-level family partitioning, no cross-family queries possible
- **Key Management:** Family-specific encryption keys with secure rotation policy
- **Backup Security:** Encrypted backups with separate key management system

*Application Security:*
- **Input Validation:** Comprehensive sanitization, SQL injection prevention, XSS protection
- **API Security:** Rate limiting (100 requests/minute/user), request signing, CORS restrictions
- **Content Security Policy:** Strict CSP headers preventing XSS and data injection
- **Security Headers:** HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

*Privacy & Compliance:*
- **Data Minimization:** Only collect data necessary for family coordination
- **Data Retention:** Automatic deletion of completed tasks after 1 year
- **User Rights:** Data export, account deletion, privacy controls
- **Third-Party:** No data sharing, no analytics tracking, minimal third-party services
- **Compliance:** CCPA-ready data handling, GDPR-inspired privacy controls

*Incident Response:*
- **Monitoring:** Real-time security event detection and alerting
- **Breach Protocol:** User notification within 72 hours, coordinated disclosure process
- **Audit Trail:** All data access and modification logging for security investigation
- **Recovery:** Secure backup restoration procedures, compromise containment strategies

**Performance and Scalability Targets:**

*Mobile Performance (iPhone 12 / Android equivalent, 4G LTE):*
- **Initial app load:** <3 seconds from tap to interactive weekly view
- **Task creation flow:** <1 second from tap "Add Task" to task visible in weekly view
- **Weekly view navigation:** <500ms transition between weeks
- **Offline sync completion:** <5 seconds for typical family week (20-30 tasks/events)

*Scalability & Capacity:*
- **Concurrent family members:** Up to 4 users per household without performance degradation
- **Task volume capacity:** 500+ tasks/events per family without UI slowdown
- **Offline functionality:** 7-day operation with 100% feature availability
- **Network resilience:** Full functionality on 3G networks (1.5 Mbps)
- **Device compatibility:** iOS 13+ (iPhone 8+), Android 9+ (2GB+ RAM)

*Measurement Criteria:*
- Performance tested on bottom 25% target devices under poor network conditions
- Load times measured from cold start with empty cache
- Task operations measured end-to-end including optimistic UI updates
- Offline sync tested with simulated network interruptions and restoration
