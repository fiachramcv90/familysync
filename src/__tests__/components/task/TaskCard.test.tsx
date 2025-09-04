// Test file for TaskCard Component
// Story 1.4: Basic Family Dashboard

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskCard } from '@/components/task/TaskCard';
import { Task } from '@/types/task';
import '@testing-library/jest-dom';

// Mock the useUpdateTask hook
const mockMutateAsync = jest.fn().mockResolvedValue({});
jest.mock('@/hooks/useFamilyTasks', () => ({
  useUpdateTask: jest.fn(() => ({
    mutateAsync: mockMutateAsync,
  })),
}));

// Test wrapper with React Query
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock task data
const mockTask: Task = {
  id: '1',
  familyId: 'family-1',
  title: 'Test Task',
  description: 'A test task description',
  assigneeId: 'user-1',
  createdById: 'user-2',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  completedAt: null,
  status: 'pending',
  category: 'task',
  priority: 'medium',
  syncVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  assignee: {
    id: 'user-1',
    familyId: 'family-1',
    email: 'user@test.com',
    name: 'Test User',
    role: 'member',
    avatarColor: '#3B82F6',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  },
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMutateAsync.mockClear();
  });

  it('renders task information correctly', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('A test task description')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows correct status checkbox for pending task', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mark as complete');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toHaveClass('bg-green-500');
  });

  it('shows correct status checkbox for completed task', () => {
    const completedTask: Task = {
      ...mockTask,
      status: 'completed',
      completedAt: new Date(),
    };

    render(
      <TestWrapper>
        <TaskCard task={completedTask} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mark as incomplete');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('bg-green-500');
  });

  it('toggles task status when checkbox is clicked', async () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mark as complete');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        taskId: '1',
        updates: { status: 'completed' },
      });
    });
  });

  it('displays correct priority indicators', () => {
    const highPriorityTask: Task = {
      ...mockTask,
      priority: 'high',
    };

    render(
      <TestWrapper>
        <TaskCard task={highPriorityTask} />
      </TestWrapper>
    );

    // High priority tasks should have a red warning icon
    expect(document.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('shows due date information correctly', () => {
    const todayTask: Task = {
      ...mockTask,
      dueDate: new Date(), // Today
    };

    render(
      <TestWrapper>
        <TaskCard task={todayTask} />
      </TestWrapper>
    );

    expect(screen.getByText('Due today')).toBeInTheDocument();
  });

  it('shows overdue tasks with proper styling', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    };

    render(
      <TestWrapper>
        <TaskCard task={overdueTask} />
      </TestWrapper>
    );

    const overdueText = screen.getByText(/Overdue by/);
    expect(overdueText).toBeInTheDocument();
    expect(overdueText).toHaveClass('text-red-600');
  });

  it('renders compact mode correctly', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} compact={true} />
      </TestWrapper>
    );

    // In compact mode, description should not be shown
    expect(screen.queryByText('A test task description')).not.toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('handles tasks without assignee', () => {
    const noAssigneeTask: Task = {
      ...mockTask,
      assignee: undefined,
    };

    render(
      <TestWrapper>
        <TaskCard task={noAssigneeTask} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    // Should not crash and should still render the task
  });

  it('handles tasks without due date', () => {
    const noDueDateTask: Task = {
      ...mockTask,
      dueDate: null,
    };

    render(
      <TestWrapper>
        <TaskCard task={noDueDateTask} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    // Should not show any due date information
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
  });

  it('shows event icon for event category', () => {
    const eventTask: Task = {
      ...mockTask,
      category: 'event',
    };

    render(
      <TestWrapper>
        <TaskCard task={eventTask} />
      </TestWrapper>
    );

    // Event should have calendar icon (check for SVG path)
    const calendarIcon = document.querySelector('path[d*="M8 7V3m8 4V3m-9 8h10"]');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('shows task icon for task category', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    // Task should have checkmark icon
    const taskIcon = document.querySelector('path[d*="m9 12 2 2 4-4"]');
    expect(taskIcon).toBeInTheDocument();
  });

  it('prevents multiple simultaneous status updates', async () => {
    const slowMockMutateAsync = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    const mockUseUpdateTask = require('@/hooks/useFamilyTasks');
    mockUseUpdateTask.useUpdateTask.mockImplementation(() => ({
      mutateAsync: slowMockMutateAsync,
    }));

    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mark as complete');
    
    // Click multiple times quickly
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);

    // Should only be called once
    await waitFor(() => {
      expect(slowMockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  it('shows different styling for different statuses', () => {
    const inProgressTask: Task = {
      ...mockTask,
      status: 'in_progress',
    };

    render(
      <TestWrapper>
        <TaskCard task={inProgressTask} />
      </TestWrapper>
    );

    // Find the actual card container with the correct status styling
    const cardContainer = document.querySelector('.bg-blue-50');
    expect(cardContainer).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <TaskCard task={mockTask} />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mark as complete');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark as complete');
  });
});