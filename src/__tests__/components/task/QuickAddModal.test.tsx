// QuickAddModal Component Tests
// Story 2.1: Task Creation and Basic Management

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickAddModal } from '@/components/task/QuickAddModal';

// Mock the hooks
jest.mock('@/hooks/useCreateTask');
jest.mock('@/hooks/useFamilyTasks');

// Mock family members data
const mockFamilyMembers = [
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('QuickAddModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the hooks
    const mockUseCreateTask = require('@/hooks/useCreateTask').useCreateTask as jest.MockedFunction<any>;
    const mockUseFamilyMembers = require('@/hooks/useFamilyTasks').useFamilyMembers as jest.MockedFunction<any>;
    
    mockUseCreateTask.mockReturnValue({
      mutateAsync: mockCreateTask,
      isLoading: false,
      error: null,
    });

    mockUseFamilyMembers.mockReturnValue({
      data: mockFamilyMembers,
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('Create Task')).toBeInTheDocument();
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
    expect(screen.getByText('Create Task')).toBeInTheDocument();

    // Click event button
    const eventButton = screen.getByRole('radio', { name: /Event/ });
    await user.click(eventButton);

    // Should switch to event
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('shows family members for assignment', () => {
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    expect(screen.getByText('Mom')).toBeInTheDocument();
    expect(screen.getByText('Dad')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a family member')).toBeInTheDocument();
    });
  });

  it('creates task with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Fill in the form
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, 'Buy groceries');

    const descriptionInput = screen.getByLabelText(/Description/);
    await user.type(descriptionInput, 'Get milk and bread');

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
        title: 'Buy groceries',
        description: 'Get milk and bread',
        assigneeId: '1',
        dueDate: undefined,
        category: 'task',
        priority: 'high',
      });
    });
  });

  it('closes modal on successful task creation', async () => {
    const user = userEvent.setup();
    mockCreateTask.mockResolvedValueOnce({ id: 'new-task-id' });
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Fill in minimal required data
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, 'Test task');

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
    mockCreateTask.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <QuickAddModal isOpen={true} onClose={mockOnClose} />,
      { wrapper: createTestWrapper() }
    );

    // Fill in minimal required data
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, 'Test task');

    const momButton = screen.getByRole('radio', { name: /Mom admin/ });
    await user.click(momButton);

    const submitButton = screen.getByRole('button', { name: /Create Task/ });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
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
    expect(screen.getByText('Mom')).toBeInTheDocument();
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
    const user = userEvent.setup();
    
    // Mock a pending creation
    const mockUseCreateTask = require('@/hooks/useCreateTask').useCreateTask as jest.MockedFunction<any>;
    mockUseCreateTask.mockReturnValue({
      mutateAsync: () => new Promise(() => {}), // Never resolves
      isLoading: true,
      error: null,
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