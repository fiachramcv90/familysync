# FamilySync - Family Coordination Made Simple

A modern Progressive Web App (PWA) built with Next.js 14+ and Supabase for coordinating family tasks, events, and activities.

## 🚀 Project Status

**Current Version:** Story 1.1 - Infrastructure Foundation ✅  
**Next:** Story 1.2 - Family Setup & Authentication

## 🛠 Tech Stack

- **Frontend:** Next.js 14.2+ with TypeScript
- **Styling:** Tailwind CSS 4.0+
- **Database:** Supabase PostgreSQL with real-time capabilities
- **Authentication:** Supabase Auth (planned)
- **PWA:** Service Worker with offline support
- **Build Tool:** Next.js with Turbopack
- **Testing:** Jest + React Testing Library + Playwright

## 📋 Features Implemented

### ✅ Story 1.1: Project Infrastructure Foundation

- [x] Next.js 14+ PWA with TypeScript and Tailwind CSS
- [x] Supabase integration and database type definitions
- [x] Development environment with hot reload and testing
- [x] Basic routing structure with App Router
- [x] PWA manifest and service worker
- [x] Responsive design with mobile-first approach
- [x] ESLint and TypeScript configuration

### 🔄 Coming Next

- **Story 1.2:** Family setup and Supabase authentication
- **Story 1.3:** Basic family member management
- **Epic 2:** Core task coordination features
- **Epic 3:** Offline-first experience
- **Epic 4:** Production polish and launch preparation

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project (for database features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd simple-todo-app-bmad
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:coverage` - Run tests with coverage

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── tasks/             # Task management
│   ├── events/            # Event calendar
│   ├── family/            # Family management
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── task/             # Task-specific components (planned)
│   ├── family/           # Family management components (planned)
│   └── calendar/         # Calendar components (planned)
├── lib/                  # Utilities and configuration
│   ├── supabase.ts       # Supabase client setup
│   ├── database.types.ts # Database type definitions
│   └── utils.ts          # General utilities
└── __tests__/            # Test files
    ├── components/       # Component tests
    └── lib/             # Library tests
```

## 🔧 Development Workflow

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run E2E tests (requires dev server running)
npm run test:e2e

# Generate test coverage report
npm run test:coverage
```

### Type Checking

```bash
# Check TypeScript types
npm run type-check
```

### Building for Production

```bash
# Build the application
npm run build

# Test the production build locally
npm start
```

## 📱 PWA Features

- **Installable:** Can be installed on mobile devices and desktops
- **Offline Support:** Basic caching with service worker
- **Responsive Design:** Mobile-first responsive layout
- **App-like Experience:** Standalone display mode

## 🗄 Database Schema

The app uses Supabase PostgreSQL with the following planned tables:

- `families` - Core family coordination units
- `family_members` - User accounts within family context
- `tasks` - Task management and assignment
- `events` - Time-specific family events

*Note: Database setup will be implemented in Story 1.2*

## 🤝 Contributing

1. Each story is developed in a separate branch
2. Follow the existing code style and conventions
3. Write tests for new features
4. Ensure all tests pass before submitting
5. Update documentation as needed

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For questions or issues:
1. Check the GitHub Issues
2. Review the documentation in `docs/`
3. Contact the development team

---

*Built with ❤️ using the BMad development methodology*