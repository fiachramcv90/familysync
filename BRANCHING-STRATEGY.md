# FamilySync Branching Strategy

## Branch Types and Naming Conventions

### Feature Branches
**Format:** `feature/story-{epic}.{story}-{short-description}`
**Example:** `feature/story-2.2-task-status-management`

- Created from latest `main` branch
- Used for implementing individual user stories
- Include comprehensive testing and documentation
- Merged via Pull Request after QA approval

### Technical Debt Branches  
**Format:** `feature/technical-debt-{description}`
**Example:** `feature/technical-debt-cleanup`

- Used for addressing technical debt, refactoring, or infrastructure improvements
- Include quality improvements, test fixes, CI/CD enhancements
- Merged after comprehensive regression testing

### Hotfix Branches
**Format:** `hotfix/{issue-description}`
**Example:** `hotfix/authentication-security-patch`

- Created from `main` for urgent production fixes
- Merged directly to `main` and deployed immediately
- Changes cherry-picked back to active feature branches

## Current Branch Structure

```
main (production-ready code)
├── feature/technical-debt-cleanup (completed - ready for merge)
└── feature/story-2.2-task-status-management (active development)
```

## Workflow Process

### 1. Story Implementation Workflow
1. **Create Feature Branch:** `git checkout -b feature/story-X.Y-description`
2. **Development Phase:** Implement story tasks sequentially with testing
3. **Self-Validation:** Run full test suite and quality checks
4. **QA Validation:** Quality gates and comprehensive testing by QA team
5. **Pull Request:** Create PR with detailed description and QA report
6. **Code Review:** Team review and approval
7. **Merge:** Squash merge to `main` with clean commit history

### 2. Branch Protection Rules
- **Main Branch:** Protected, requires PR approval and passing CI/CD
- **Feature Branches:** Must pass all tests before PR creation
- **Automatic Deployment:** Vercel deploys `main` branch automatically
- **Preview Deployments:** Feature branches get preview URLs for testing

### 3. Quality Gates
- **Developer Validation:** All tests pass, coding standards followed
- **QA Validation:** Comprehensive testing, quality gate documentation
- **CI/CD Pipeline:** Automated testing, building, and deployment checks
- **Code Review:** Peer review for code quality and architecture alignment

## Story 2.2 Implementation Plan

**Branch:** `feature/story-2.2-task-status-management`
**Timeline:** 1 week (as specified in Epic 2)
**Scope:** Task status management, completion, editing, and assignment transfer

### Implementation Phases:
1. **Backend API Updates** - PATCH /api/tasks/[taskId] endpoint enhancement
2. **Frontend Components** - TaskCard enhancements, status indicators, edit modals
3. **State Management** - React Query optimistic updates, real-time sync
4. **Testing Suite** - Unit, integration, and E2E tests
5. **QA Validation** - Quality gates, performance, and accessibility testing

### Quality Validation:
- Developer self-validation with comprehensive testing
- QA team validation with quality gate documentation
- Performance testing for real-time updates
- Accessibility compliance verification
- Cross-browser and mobile responsive testing

## Git Commands Reference

```bash
# Create new feature branch
git checkout main
git pull origin main
git checkout -b feature/story-X.Y-description

# Development workflow
git add .
git commit -m "descriptive commit message"
git push origin feature/story-X.Y-description

# Merge preparation
git checkout main
git pull origin main
git checkout feature/story-X.Y-description
git rebase main  # if needed
```

## Branch Status Tracking

| Branch | Status | Story | QA Status | Ready for Merge |
|--------|--------|-------|-----------|-----------------|
| `feature/technical-debt-cleanup` | ✅ Complete | Technical Debt | ✅ Passed | ✅ Ready |
| `feature/story-2.2-task-status-management` | 🚧 Active | Story 2.2 | ⏳ Pending | ❌ In Development |

---

**Last Updated:** 2025-09-05
**Current Active Branch:** `feature/story-2.2-task-status-management`
**Next Story:** Story 2.3 (Enhanced Weekly View with Task Management)