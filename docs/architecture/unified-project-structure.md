# Unified Project Structure

```plaintext
familysync/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yml              # Test and lint workflow
│       └── deploy.yml          # Deploy to production
├── apps/                       # Application packages
│   ├── web/                    # React PWA frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── ui/         # Basic components (Button, Input)
│   │   │   │   ├── task/       # Task-specific components
│   │   │   │   ├── family/     # Family management components
│   │   │   │   ├── calendar/   # Weekly dashboard components
│   │   │   │   └── layout/     # Layout and navigation
│   │   │   ├── pages/          # Route components
│   │   │   │   ├── WeeklyDashboard.tsx
│   │   │   │   ├── FamilySettings.tsx
│   │   │   │   └── Auth/
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useFamilyTasks.ts
│   │   │   │   └── useOfflineSync.ts
│   │   │   ├── services/       # API client services
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── task-service.ts
│   │   │   │   └── sync-service.ts
│   │   │   ├── stores/         # Zustand state management
│   │   │   │   ├── auth-store.ts
│   │   │   │   └── app-store.ts
│   │   │   ├── styles/         # Global styles and themes
│   │   │   │   ├── globals.css
│   │   │   │   └── components.css
│   │   │   ├── utils/          # Frontend utilities
│   │   │   │   ├── date-helpers.ts
│   │   │   │   ├── offline-storage.ts
│   │   │   │   └── validation.ts
│   │   │   ├── contexts/       # React contexts
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   └── OfflineContext.tsx
│   │   │   ├── App.tsx         # Main app component
│   │   │   ├── main.tsx        # Entry point
│   │   │   └── sw.ts           # Service worker
│   │   ├── public/             # Static assets
│   │   │   ├── manifest.json   # PWA manifest
│   │   │   ├── sw.js           # Compiled service worker
│   │   │   └── icons/          # PWA icons
│   │   ├── tests/              # Frontend tests
│   │   │   ├── components/     # Component tests
│   │   │   ├── hooks/          # Hook tests
│   │   │   ├── services/       # Service tests
│   │   │   └── e2e/            # Playwright E2E tests
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── tailwind.config.js  # Tailwind CSS config
│   │   └── package.json
│   └── api/                    # Node.js Express backend
│       ├── src/
│       │   ├── routes/         # API route definitions
│       │   │   ├── auth.ts
│       │   │   ├── families.ts
│       │   │   ├── tasks.ts
│       │   │   └── sync.ts
│       │   ├── controllers/    # Route handlers
│       │   │   ├── AuthController.ts
│       │   │   ├── FamilyController.ts
│       │   │   └── TaskController.ts
│       │   ├── services/       # Business logic
│       │   │   ├── AuthService.ts
│       │   │   ├── TaskService.ts
│       │   │   └── SyncService.ts
│       │   ├── repositories/   # Data access layer
│       │   │   ├── BaseRepository.ts
│       │   │   ├── FamilyRepository.ts
│       │   │   └── TaskRepository.ts
│       │   ├── middleware/     # Express middleware
│       │   │   ├── auth.ts
│       │   │   ├── family-access.ts
│       │   │   ├── validation.ts
│       │   │   └── error-handler.ts
│       │   ├── utils/          # Backend utilities
│       │   │   ├── jwt.ts
│       │   │   ├── encryption.ts
│       │   │   └── database.ts
│       │   ├── schemas/        # Validation schemas
│       │   │   ├── auth.ts
│       │   │   ├── task.ts
│       │   │   └── family.ts
│       │   ├── database/       # Database files and migrations
│       │   │   ├── schema.sql
│       │   │   ├── migrations/
│       │   │   └── familysync.db
│       │   └── server.ts       # Express server entry
│       ├── tests/              # Backend tests
│       │   ├── unit/           # Unit tests
│       │   ├── integration/    # API integration tests
│       │   └── fixtures/       # Test data
│       └── package.json
├── packages/                   # Shared packages
│   ├── shared/                 # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   │   ├── auth.ts
│   │   │   │   ├── family.ts
│   │   │   │   ├── task.ts
│   │   │   │   └── api.ts
│   │   │   ├── constants/      # Shared constants
│   │   │   │   ├── app.ts
│   │   │   │   └── validation.ts
│   │   │   ├── utils/          # Shared utilities
│   │   │   │   ├── date.ts
│   │   │   │   └── validation.ts
│   │   │   └── index.ts        # Package exports
│   │   └── package.json
│   ├── ui/                     # Shared UI components (future)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── tsconfig.json
│       └── jest/
│           └── jest.config.js
├── infrastructure/             # Deployment configuration
│   ├── railway/                # Railway deployment config
│   │   └── railway.toml
│   ├── vercel/                 # Vercel deployment config
│   │   └── vercel.json
│   └── docker/                 # Docker files (future scaling)
│       ├── Dockerfile.api
│       └── Dockerfile.web
├── scripts/                    # Build and deploy scripts
│   ├── build.sh                # Full project build
│   ├── dev.sh                  # Start development environment
│   ├── test.sh                 # Run all tests
│   └── deploy.sh               # Deploy to production
├── docs/                       # Documentation
│   ├── prd.md                  # Product Requirements Document
│   ├── front-end-spec.md       # UI/UX Specification
│   ├── architecture.md         # This document
│   ├── api-docs.md             # API documentation
│   └── deployment.md           # Deployment guide
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Root package.json with workspaces
├── turbo.json                  # Turbo monorepo configuration
├── README.md                   # Project overview and setup
└── CHANGELOG.md                # Version history
```
