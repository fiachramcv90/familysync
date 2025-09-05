// useCreateTask Hook Tests
// Story 2.1: Task Creation and Basic Management

import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateTask } from '@/hooks/useCreateTask';
import { CreateTaskInput } from '@/types/task';
import { useCreateTaskMutation } from '@/hooks/useFamilyTasks';

// Mock the useFamilyTasks module
jest.mock('@/hooks/useFamilyTasks');

const mockUseCreateTaskMutation = jest.mocked(useCreateTaskMutation);

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  TestWrapper.displayName = 'TestWrapper';
  
  return TestWrapper;
};

const mockCreateTaskMutation = jest.fn();

describe('useCreateTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseCreateTaskMutation.mockReturnValue({
      mutateAsync: mockCreateTaskMutation,
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isIdle: true,
      isSuccess: false,
      error: null,
      data: undefined,
      variables: undefined,
      status: 'idle' as const,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: 0,
    });
  });

  it('provides mutation functions and state', () => {
    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.mutate).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.reset).toBeDefined();
  });

  it('calls success callback on successful task creation', async () => {
    const mockTask = {
      id: 'test-task-1',
      title: 'Test Task',
      familyId: 'family-1',
      assigneeId: '1',
      createdById: '2',
      status: 'pending' as const,
      category: 'task' as const,
      priority: 'medium' as const,
      syncVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: null,
      completedAt: null,
      description: null,
    };

    const onSuccess = jest.fn();
    mockCreateTaskMutation.mockResolvedValueOnce(mockTask);

    const { result } = renderHook(() => useCreateTask({ onSuccess }), {
      wrapper: createTestWrapper(),
    });

    const taskInput: CreateTaskInput = {
      title: 'Test Task',
      assigneeId: '1',
      category: 'task',
      priority: 'medium',
    };

    await result.current.mutateAsync(taskInput);

    expect(mockCreateTaskMutation).toHaveBeenCalledWith(taskInput);
    expect(onSuccess).toHaveBeenCalledWith(mockTask);
  });

  it('calls error callback on failed task creation', async () => {
    const error = new Error('Failed to create task');
    const onError = jest.fn();
    mockCreateTaskMutation.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateTask({ onError }), {
      wrapper: createTestWrapper(),
    });

    const taskInput: CreateTaskInput = {
      title: 'Test Task',
      assigneeId: '1',
      category: 'task',
      priority: 'medium',
    };

    try {
      await result.current.mutateAsync(taskInput);
    } catch {
      // Expected to throw
    }

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('reflects loading state from mutation', () => {
    mockUseCreateTaskMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      isPending: true,
      isError: false,
      isIdle: false,
      isSuccess: false,
      error: null,
      data: undefined,
      variables: { title: 'test', assigneeId: 'user-1', priority: 'medium', category: 'task' },
      status: 'pending' as const,
      reset: jest.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: Date.now(),
    });

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('reflects error state from mutation', () => {
    const error = new Error('Mutation error');
    mockUseCreateTaskMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      isIdle: false,
      isSuccess: false,
      error,
      data: undefined,
      variables: { title: 'test', assigneeId: 'user-1', priority: 'medium', category: 'task' },
      status: 'error' as const,
      reset: jest.fn(),
      context: undefined,
      failureCount: 1,
      failureReason: error,
      isPaused: false,
      submittedAt: Date.now(),
    });

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.error).toBe(error);
  });

  it('provides reset function', () => {
    const mockReset = jest.fn();
    mockUseCreateTaskMutation.mockReturnValue({
      mutateAsync: jest.fn(),
      mutate: jest.fn(),
      isPending: false,
      isError: false,
      isIdle: false,
      isSuccess: true,
      error: null,
      data: { id: 'task-1', title: 'test', status: 'pending', assigneeId: 'user-1' } as any,
      variables: { title: 'test', assigneeId: 'user-1', priority: 'medium', category: 'task' },
      status: 'success' as const,
      reset: mockReset,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: Date.now(),
    });

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createTestWrapper(),
    });

    result.current.reset();
    expect(mockReset).toHaveBeenCalled();
  });
});