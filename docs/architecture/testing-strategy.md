# Testing Strategy

## Testing Pyramid

```
        E2E Tests (Playwright)
       /                    \
    Integration Tests        Integration Tests
   /    (Frontend)           (Backend API)    \
Frontend Unit Tests      Backend Unit Tests
(Jest + RTL)              (Jest + Supertest)
```

## Test Organization

### Frontend Tests

```
apps/web/tests/
├── unit/                   # Component and hook tests
│   ├── components/
│   │   ├── TaskCard.test.tsx
│   │   ├── WeekView.test.tsx
│   │   └── QuickAddModal.test.tsx
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   ├── useFamilyTasks.test.ts
│   │   └── useOfflineSync.test.ts
│   └── services/
│       ├── api-client.test.ts
│       └── sync-service.test.ts
├── integration/            # Component integration tests
│   ├── WeeklyDashboard.test.tsx
│   ├── FamilyOnboarding.test.tsx
│   └── OfflineSync.test.tsx
└── fixtures/               # Test data and mocks
    ├── tasks.json
    ├── families.json
    └── users.json
```

### Backend Tests

```
apps/api/tests/
├── unit/                   # Service and utility tests
│   ├── services/
│   │   ├── AuthService.test.ts
│   │   ├── TaskService.test.ts
│   │   └── SyncService.test.ts
│   ├── repositories/
│   │   ├── TaskRepository.test.ts
│   │   └── FamilyRepository.test.ts
│   └── utils/
│       ├── jwt.test.ts
│       └── validation.test.ts
├── integration/            # API endpoint tests
│   ├── auth.test.ts
│   ├── tasks.test.ts
│   ├── families.test.ts
│   └── sync.test.ts
└── fixtures/               # Test database and data
    ├── test-database.sql
    └── seed-data.ts
```

### E2E Tests

```
tests/e2e/
├── specs/
│   ├── onboarding.spec.ts       # Family setup flow
│   ├── task-management.spec.ts   # CRUD operations
│   ├── weekly-coordination.spec.ts # Dashboard interactions
│   ├── offline-sync.spec.ts     # Offline functionality
│   └── mobile-pwa.spec.ts       # Mobile-specific features
├── fixtures/
│   ├── families.json
│   └── tasks.json
└── utils/
    ├── test-helpers.ts
    └── database-setup.ts
```

## Test Examples

### Frontend Component Test

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskCard } from '@/components/task/TaskCard';
import { mockTask, mockFamilyMember } from '@/tests/fixtures';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('TaskCard', () => {
  const mockOnComplete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnReassign = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders task information correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onReassign={mockOnReassign}
      />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    expect(screen.getByTestId('task-card')).toBeInTheDocument();
  });
  
  it('shows complete button for assigned tasks', async () => {
    const assignedTask = { ...mockTask, assigneeId: 'current-user-id' };
    
    render(
      <TaskCard
        task={assignedTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onReassign={mockOnReassign}
      />,
      { wrapper: createWrapper() }
    );
    
    const completeButton = screen.getByTestId('complete-task');
    expect(completeButton).toBeInTheDocument();
    
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(assignedTask.id);
    });
  });
  
  it('displays offline indicator when offline', () => {
    render(
      <TaskCard
        task={mockTask}
        onComplete={mockOnComplete}
        onEdit={mockOnEdit}
        onReassign={mockOnReassign}
        isOffline={true}
      />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(/offline changes pending/i)).toBeInTheDocument();
  });
});
```

### Backend API Test

```typescript
import request from 'supertest';
import { app } from '@/server';
import { setupTestDatabase, cleanupTestDatabase, createTestFamily, createTestUser } from '@/tests/fixtures';

describe('Tasks API', () => {
  let testFamily: any;
  let testUser: any;
  let authToken: string;
  
  beforeAll(async () => {
    await setupTestDatabase();
    testFamily = await createTestFamily();
    testUser = await createTestUser(testFamily.id);
    
    // Get auth token
    const authResponse = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'testPassword123!' });
    
    authToken = authResponse.body.token;
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /tasks', () => {
    it('creates a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test task description',
        assigneeId: testUser.id,
        dueDate: new Date().toISOString(),
        category: 'task',
        priority: 'medium'
      };
      
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        assigneeId: taskData.assigneeId,
        familyId: testFamily.id,
        status: 'pending',
        syncVersion: 1
      });
      
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
    });
    
    it('prevents creating tasks for other families', async () => {
      const otherFamily = await createTestFamily();
      const otherUser = await createTestUser(otherFamily.id);
      
      const taskData = {
        title: 'Malicious Task',
        assigneeId: otherUser.id,
      };
      
      await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);
    });
    
    it('validates required fields', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
      
      expect(response.body.error).toContain('Validation error');
    });
  });
  
  describe('PATCH /tasks/:id', () => {
    it('handles sync conflicts correctly', async () => {
      // Create task
      const createResponse = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Conflict Test', assigneeId: testUser.id });
      
      const taskId = createResponse.body.id;
      
      // Simulate outdated sync version
      const conflictResponse = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Updated Title', 
          syncVersion: 0 // Outdated version
        })
        .expect(409);
      
      expect(conflictResponse.body.error).toContain('Sync conflict');
      expect(conflictResponse.body.latestVersion).toBeDefined();
    });
  });
});
```

### E2E Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Family Task Coordination', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test family and login
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to weekly dashboard
    await page.waitForURL('/');
  });
  
  test('creates and completes a task workflow', async ({ page }) => {
    // Open quick add modal
    await page.click('[data-testid="quick-add-button"]');
    await expect(page.locator('[data-testid="quick-add-modal"]')).toBeVisible();
    
    // Fill task details
    await page.fill('[data-testid="task-title-input"]', 'Buy groceries');
    await page.fill('[data-testid="task-description-input"]', 'Milk, bread, and eggs');
    await page.selectOption('[data-testid="assignee-select"]', 'current-user-id');
    await page.click('[data-testid="due-date-picker"]');
    await page.click('[data-testid="tomorrow-option"]');
    
    // Create task
    await page.click('[data-testid="create-task-button"]');
    
    // Verify task appears in weekly view
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Buy groceries');
    
    // Complete the task
    await page.click('[data-testid="complete-task-button"]');
    
    // Verify completion animation and updated status
    await expect(page.locator('[data-testid="task-card"]')).toHaveClass(/opacity-60/);
    await expect(page.locator('[data-testid="completion-checkmark"]')).toBeVisible();
  });
  
  test('works offline and syncs when back online', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);
    
    // Create task while offline
    await page.click('[data-testid="quick-add-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Offline Task');
    await page.click('[data-testid="create-task-button"]');
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Offline Task');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Wait for sync to complete
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
    
    // Verify task persisted after sync
    await page.reload();
    await expect(page.locator('[data-testid="task-card"]')).toContainText('Offline Task');
  });
  
  test('handles family member coordination', async ({ page, context }) => {
    // Create task assigned to family member
    await page.click('[data-testid="quick-add-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Family Task');
    await page.selectOption('[data-testid="assignee-select"]', 'other-family-member-id');
    await page.click('[data-testid="create-task-button"]');
    
    // Open second browser context as different family member
    const page2 = await context.newPage();
    await page2.goto('/auth/login');
    await page2.fill('[data-testid="email-input"]', 'partner@example.com');
    await page2.fill('[data-testid="password-input"]', 'partnerPassword123!');
    await page2.click('[data-testid="login-button"]');
    await page2.waitForURL('/');
    
    // Verify second family member sees the task
    await expect(page2.locator('[data-testid="task-card"]')).toContainText('Family Task');
    
    // Complete task as second family member
    await page2.click('[data-testid="complete-task-button"]');
    
    // Verify first family member sees the update
    await page.waitForTimeout(1000); // Wait for real-time update
    await expect(page.locator('[data-testid="task-card"]')).toHaveClass(/opacity-60/);
  });
});
```
