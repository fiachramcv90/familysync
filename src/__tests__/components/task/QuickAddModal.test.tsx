// QuickAddModal Component Tests
// Story 2.1: Task Creation and Basic Management

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickAddModal } from '@/components/task/QuickAddModal';
import { useCreateTask } from '@/hooks/useCreateTask';
import { useFamilyMembers } from '@/hooks/useFamilyTasks';
import { FamilyMember } from '@/types/family';
import { Task, CreateTaskInput } from '@/types/task';

// Mock the hooks
jest.mock('@/hooks/useCreateTask');
jest.mock('@/hooks/useFamilyTasks');

const mockUseCreateTask = jest.mocked(useCreateTask);
const mockUseFamilyMembers = jest.mocked(useFamilyMembers);

type CreateTaskReturn = {
  mutateAsync: (input: CreateTaskInput) => Promise<Task>;
  mutate: (input: CreateTaskInput) => void;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
};

type FamilyMembersReturn = {
  data?: FamilyMember[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  refetch?: () => void;
  isSuccess?: boolean;
  status?: 'error' | 'success' | 'loading';
};

// Mock family members data
const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    familyId: 'family-1',
    email: 'mom@family.com',
    name: 'Mom',
    role: 'admin' as const,
    avatarColor: '#EF4444',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  },
  {
    id: '2',
    familyId: 'family-1',
    email: 'dad@family.com', 
    name: 'Dad',
    role: 'admin' as const,
    avatarColor: '#3B82F6',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  },
];

const mockCreateTask = jest.fn();

// Setup test wrapper
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

describe('QuickAddModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the hooks
    mockUseCreateTask.mockReturnValue({
      mutateAsync: mockCreateTask,
      mutate: jest.fn(),
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });

    mockUseFamilyMembers.mockReturnValue({
      data: mockFamilyMembers,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isSuccess: true,
      status: 'success' as const,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <QuickAddModal isOpen={false} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays task type selection by default', () => {
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Something to be done')).toBeInTheDocument();
    expect(screen.getByText('Something scheduled')).toBeInTheDocument();
  });

  it('allows switching between task and event types', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Initially should be task type
    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();

    // Click event button
    const eventButton = screen.getByRole('radio', { name: /Event/ });
    await user.click(eventButton);

    // Should switch to event
    expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument();
  });

  it('shows family members for assignment', () => {
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Check that family members are shown as radio options
    expect(screen.getByRole('radio', { name: /Mom admin/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Dad admin/ })).toBeInTheDocument();
    expect(screen.getByText('Choose assignee')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Submit button should be disabled when required fields are empty
    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    expect(submitButton).toBeDisabled();

    // Fill in title but not assignee - should still be disabled
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, 'Test task');
    expect(submitButton).toBeDisabled();

    // Clear title and select assignee - should still be disabled
    await user.clear(titleInput);
    const momButton = screen.getByRole('radio', { name: /Mom admin/ });
    await user.click(momButton);
    expect(submitButton).toBeDisabled();

    // Fill in both - should be enabled
    await user.type(titleInput, 'Test task');
    expect(submitButton).not.toBeDisabled();
  });

  it('creates task with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Fill in the form using fireEvent to avoid typing issues
    const titleInput = screen.getByLabelText(/Title/);
    fireEvent.change(titleInput, { target: { value: 'Test Task Title' } });

    const descriptionInput = screen.getByLabelText(/Description/);
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } });

    // Select family member
    const momButton = screen.getByRole('radio', { name: /Mom admin/ });
    await user.click(momButton);

    // Select priority
    const highPriorityButton = screen.getByRole('button', { name: /High/ });
    await user.click(highPriorityButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    await user.click(submitButton);

    // Verify task creation was called
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Test Task Title',
        description: 'Task description',
        assigneeId: '1',
        dueDate: undefined,
        category: 'task',
        priority: 'high',
      });
    });
  });

  it('closes modal on successful task creation', async () => {
    const user = userEvent.setup();
    
    // Create a task that resolves successfully
    const mockTask = { id: 'new-task-id', title: 'Test task', assigneeId: '1', category: 'task' as const, priority: 'medium' as const };
    mockCreateTask.mockResolvedValueOnce(mockTask);
    
    // Mock useCreateTask to simulate the success callback being called
    let successCallback: ((task: Task) => void) | undefined;
    mockUseCreateTask.mockReturnValue({
      mutateAsync: async (input: CreateTaskInput) => {
        const result = await mockCreateTask(input);
        if (successCallback) {
          successCallback(result);
        }
        return result;
      },
      mutate: jest.fn(),
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Capture the success callback when useCreateTask is called
    expect(mockUseCreateTask).toHaveBeenCalledWith(expect.objectContaining({
      onSuccess: expect.any(Function),
    }));
    const firstCall = mockUseCreateTask.mock.calls[0];
    if (firstCall && firstCall[0]) {
      successCallback = firstCall[0].onSuccess;
    }

    // Fill in minimal required data
    const titleInput = screen.getByLabelText(/Title/);
    fireEvent.change(titleInput, { target: { value: 'Test task' } });

    const momButton = screen.getByRole('radio', { name: /Mom admin/ });
    await user.click(momButton);

    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    await user.click(submitButton);

    // Modal should close after successful creation
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error message on creation failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to create task';
    
    // Mock useCreateTask to simulate the error callback being called
    let errorCallback: ((error: Error) => void) | undefined;
    mockCreateTask.mockRejectedValueOnce(new Error(errorMessage));
    mockUseCreateTask.mockReturnValue({
      mutateAsync: async (input: CreateTaskInput) => {
        try {
          return await mockCreateTask(input);
        } catch (error) {
          if (errorCallback) {
            errorCallback(error as Error);
          }
          throw error;
        }
      },
      mutate: jest.fn(),
      isLoading: false,
      error: null,
      reset: jest.fn(),
    });
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Capture the error callback when useCreateTask is called
    expect(mockUseCreateTask).toHaveBeenCalledWith(expect.objectContaining({
      onError: expect.any(Function),
    }));
    const firstCall = mockUseCreateTask.mock.calls[0];
    if (firstCall && firstCall[0]) {
      errorCallback = firstCall[0].onError;
    }

    // Fill in minimal required data
    const titleInput = screen.getByLabelText(/Title/);
    fireEvent.change(titleInput, { target: { value: 'Test task' } });

    const momButton = screen.getByRole('radio', { name: /Mom admin/ });
    await user.click(momButton);

    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    await user.click(submitButton);

    // Should show error message with role alert
    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(errorMessage);
    });

    // Modal should remain open
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('sets default assignee when provided', () => {
    render(
      <QuickAddModal 
        isOpen={true} 
        onClose={mockOnClose} 
        defaultAssigneeId="1"
      />,
      { wrapper: createTestWrapper() }
    );

    // Should show Mom as selected (defaultAssigneeId="1")
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    // Should show the selected radio button for Mom
    const momRadio = screen.getByRole('radio', { name: /Mom admin/ });
    expect(momRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('allows canceling modal', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents closing while submitting', async () => {
    
    // Mock a pending creation
    mockUseCreateTask.mockReturnValue({
      mutateAsync: () => new Promise(() => {}), // Never resolves
      mutate: jest.fn(),
      isLoading: true,
      error: null,
      reset: jest.fn(),
    });
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Try to click cancel while submitting
    const cancelButton = screen.getByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeDisabled();
  });
});