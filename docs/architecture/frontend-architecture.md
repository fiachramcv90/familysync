# Frontend Architecture

## Component Architecture

### Component Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── task/            # Task-specific components
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── QuickAddModal.tsx
│   ├── family/          # Family-specific components
│   │   ├── FamilyMemberAvatar.tsx
│   │   ├── FamilyMemberFilter.tsx
│   │   └── FamilyInvite.tsx
│   ├── calendar/        # Weekly dashboard components
│   │   ├── WeekView.tsx
│   │   ├── WeekNavigation.tsx
│   │   └── DayColumn.tsx
│   └── layout/          # Layout components
│       ├── AppShell.tsx
│       ├── Navigation.tsx
│       └── OfflineIndicator.tsx
├── pages/               # Page-level components
│   ├── WeeklyDashboard.tsx
│   ├── FamilySettings.tsx
│   ├── TaskDetails.tsx
│   └── Auth/
│       ├── Login.tsx
│       ├── Register.tsx
│       └── FamilySetup.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useFamilyTasks.ts
│   ├── useOfflineSync.ts
│   └── useWeekNavigation.ts
└── contexts/            # React contexts
    ├── AuthContext.tsx
    ├── FamilyContext.tsx
    └── OfflineContext.tsx
```

### Component Template

```typescript
import React, { memo } from 'react';
import { cn } from '@/utils/cn';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onReassign: (taskId: string, newAssigneeId: string) => void;
  isOffline?: boolean;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  onComplete,
  onEdit,
  onReassign,
  isOffline = false,
  className
}) => {
  const { user } = useAuth();
  const isAssignedToMe = task.assigneeId === user?.id;
  
  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow-sm border p-4',
        'transition-all duration-200 hover:shadow-md',
        isOffline && 'border-orange-200 bg-orange-50',
        task.status === 'completed' && 'opacity-60',
        className
      )}
      data-testid="task-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="ml-3 flex items-center space-x-2">
          <FamilyMemberAvatar 
            memberId={task.assigneeId}
            size="sm"
          />
          {isAssignedToMe && task.status !== 'completed' && (
            <button
              onClick={() => onComplete(task.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full"
              data-testid="complete-task"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {isOffline && (
        <div className="mt-2 flex items-center text-xs text-orange-600">
          <CloudOffIcon className="w-3 h-3 mr-1" />
          Offline changes pending sync
        </div>
      )}
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export { TaskCard, type TaskCardProps };
```

## State Management Architecture

### State Structure

```typescript
// Zustand store for client-side UI state
interface AppStore {
  // UI state
  currentWeek: Date;
  selectedFamilyMemberId?: string;
  isOffline: boolean;
  syncInProgress: boolean;
  
  // Modal/overlay state
  showQuickAdd: boolean;
  showTaskDetails?: string;
  
  // Actions
  setCurrentWeek: (date: Date) => void;
  setSelectedFamilyMember: (id?: string) => void;
  setOfflineStatus: (offline: boolean) => void;
  setSyncStatus: (syncing: boolean) => void;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;
  openTaskDetails: (taskId: string) => void;
  closeTaskDetails: () => void;
}

// React Query keys for server state
export const queryKeys = {
  family: ['family'] as const,
  familyMembers: ['family', 'members'] as const,
  tasks: (week?: string) => ['tasks', week] as const,
  events: (week?: string) => ['events', week] as const,
  sync: ['sync'] as const,
};

// Type-safe query hooks
export const useFamilyTasks = (weekStart: Date) => {
  const weekString = format(weekStart, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: queryKeys.tasks(weekString),
    queryFn: () => taskService.getTasksForWeek(weekStart),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
```

### State Management Patterns

- **Server State:** React Query for API data, caching, and optimistic updates
- **Client State:** Zustand for UI state that doesn't need persistence
- **Offline State:** IndexedDB managed by custom offline sync engine
- **Authentication State:** React Context for user session and family membership
- **Form State:** React Hook Form for task/event creation and editing

## Routing Architecture

### Route Organization

```
routes/
├── / (WeeklyDashboard)
├── /week/:date (WeeklyDashboard with specific week)
├── /tasks/:id (TaskDetails)
├── /family (FamilySettings)
├── /auth/
│   ├── login (Login)
│   ├── register (Register)
│   └── setup (FamilySetup)
└── /invite/:code (JoinFamily)
```

### Protected Route Pattern

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireFamily?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireFamily = true 
}) => {
  const { user, family, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  if (requireFamily && !family) {
    return <Navigate to="/auth/setup" replace />;
  }
  
  return <>{children}</>;
};

// Route configuration with React Router v6
const AppRoutes = () => (
  <Routes>
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/invite/:code" element={<JoinFamily />} />
    
    <Route path="/auth/setup" element={
      <ProtectedRoute requireFamily={false}>
        <FamilySetup />
      </ProtectedRoute>
    } />
    
    <Route path="/" element={
      <ProtectedRoute>
        <WeeklyDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/week/:date" element={
      <ProtectedRoute>
        <WeeklyDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/tasks/:id" element={
      <ProtectedRoute>
        <TaskDetails />
      </ProtectedRoute>
    } />
    
    <Route path="/family" element={
      <ProtectedRoute>
        <FamilySettings />
      </ProtectedRoute>
    } />
    
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
```

## Frontend Services Layer

### API Client Setup

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { queryClient } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().clearAuth();
          queryClient.clear();
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }
  
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### Service Example

```typescript
import { apiClient } from '@/lib/api-client';
import { Task, CreateTaskInput, UpdateTaskInput } from '@shared/types';
import { startOfWeek, endOfWeek } from 'date-fns';

class TaskService {
  async getTasksForWeek(weekStart: Date): Promise<Task[]> {
    const weekStartStr = weekStart.toISOString().split('T')[0];
    return apiClient.get<Task[]>(`/tasks?week=${weekStartStr}`);
  }
  
  async createTask(input: CreateTaskInput): Promise<Task> {
    return apiClient.post<Task>('/tasks', input);
  }
  
  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, input);
  }
  
  async completeTask(taskId: string, syncVersion: number): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${taskId}`, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      syncVersion
    });
  }
  
  async deleteTask(taskId: string): Promise<void> {
    return apiClient.delete(`/tasks/${taskId}`);
  }
  
  // Optimistic mutation with React Query
  useCreateTaskMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: this.createTask,
      onMutate: async (newTask) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: queryKeys.tasks() });
        
        // Snapshot previous value
        const previousTasks = queryClient.getQueryData(queryKeys.tasks());
        
        // Optimistically update cache
        queryClient.setQueryData(queryKeys.tasks(), (old: Task[] = []) => [
          ...old,
          { ...newTask, id: `temp-${Date.now()}`, createdAt: new Date() }
        ]);
        
        return { previousTasks };
      },
      onError: (err, newTask, context) => {
        // Rollback on error
        queryClient.setQueryData(queryKeys.tasks(), context?.previousTasks);
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      },
    });
  }
}

export const taskService = new TaskService();
```
