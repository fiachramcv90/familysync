import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentTransferModal } from '@/components/task/AssignmentTransferModal';
import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useFamilyTasks';

// Mock the hooks and components
jest.mock('@/hooks/useFamilyTasks');
jest.mock('@/components/task/FamilyMemberSelect', () => ({
  FamilyMemberSelect: ({ value, onChange, error, placeholder }: any) => (
    <div data-testid="family-member-select">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select family member"
      >
        <option value="">{placeholder}</option>
        <option value="user-1">John Doe</option>
        <option value="user-2">Jane Doe</option>
      </select>
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

jest.mock('@/components/family/FamilyMemberAvatar', () => ({
  FamilyMemberAvatar: ({ member, size, showName }: any) => (
    <div data-testid="family-member-avatar">
      {member.name} ({size})
    </div>
  ),
}));

const mockUseUpdateTask = useUpdateTask as jest.MockedFunction<typeof useUpdateTask>;

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  familyId: 'family-1',
  title: 'Test Task',
  description: 'Test task description',
  assigneeId: 'user-1',
  createdById: 'user-1',
  status: 'pending',
  category: 'task',
  priority: 'medium',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  syncVersion: 1,
  assignee: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarColor: '#3B82F6',
    familyId: 'family-1',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    lastSeenAt: new Date('2023-01-01'),
  },
  ...overrides,
});

const createTestWrapper = () => {
  const mutateAsync = jest.fn().mockResolvedValue({});
  const mockMutation = {
    mutateAsync,
    mutate: jest.fn(),
    isPending: false,
    isError: false as const,
    isIdle: true as const,
    isSuccess: false as const,
    error: null,
    data: undefined,
    variables: undefined,
    status: 'idle' as const,
    reset: jest.fn(),
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isLoadingError: false,
    isPaused: false,
    submittedAt: 0,
  };
  
  mockUseUpdateTask.mockReturnValue(mockMutation as any);
  
  return { mutateAsync };
};

describe('AssignmentTransferModal', () => {
  const mockOnClose = jest.fn();
  const mockOnTaskUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays current assignment information', () => {
    const task = createMockTask();
    createTestWrapper();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    expect(screen.getByText('Current Assignment')).toBeInTheDocument();
    expect(screen.getByText('John Doe (md)')).toBeInTheDocument();
  });

  it('displays task information', () => {
    const task = createMockTask();
    createTestWrapper();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    expect(screen.getByText('Task: Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test task description')).toBeInTheDocument();
  });

  it('shows confirmation message when assignment changes', async () => {
    const task = createMockTask();
    createTestWrapper();
    const user = userEvent.setup();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    // Change assignment to Jane Doe
    const assigneeSelect = screen.getByLabelText('Select family member');
    await user.selectOptions(assigneeSelect, ['user-2']);
    
    expect(screen.getByText('Confirm Task Reassignment')).toBeInTheDocument();
    expect(screen.getByText(/This task will be transferred/)).toBeInTheDocument();
  });

  it('validates that a different assignee is selected', async () => {
    const task = createMockTask();
    createTestWrapper();
    const user = userEvent.setup();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    // Button should be disabled initially since no valid different assignee is selected  
    const reassignButton = screen.getByRole('button', { name: 'Reassign Task' });
    expect(reassignButton).toBeDisabled();
    
    // Select the same assignee explicitly
    const assigneeSelect = screen.getByLabelText('Select family member');
    await user.selectOptions(assigneeSelect, ['user-1']);
    
    // Try to submit - button should still be disabled or show validation error
    await user.click(reassignButton);
    expect(reassignButton).toBeDisabled();
  });

  it('shows current assignee as initially selected', async () => {
    const task = createMockTask();
    createTestWrapper();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    // The current assignee (John Doe) should be initially selected
    const assigneeSelect = screen.getByLabelText('Select family member') as HTMLSelectElement;
    expect(assigneeSelect.value).toBe('user-1');
  });

  it('successfully reassigns task', async () => {
    const task = createMockTask();
    const { mutateAsync } = createTestWrapper();
    const user = userEvent.setup();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    // Change assignment to Jane Doe
    const assigneeSelect = screen.getByLabelText('Select family member');
    await user.selectOptions(assigneeSelect, ['user-2']);
    
    // Submit reassignment
    const reassignButton = screen.getByRole('button', { name: 'Reassign Task' });
    await user.click(reassignButton);
    
    expect(mutateAsync).toHaveBeenCalledWith({
      taskId: 'task-1',
      updates: {
        assigneeId: 'user-2',
      },
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables reassign button when no changes made', () => {
    const task = createMockTask();
    createTestWrapper();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    const reassignButton = screen.getByRole('button', { name: 'Reassign Task' });
    expect(reassignButton).toBeDisabled();
  });

  it('resets form on cancel', async () => {
    const task = createMockTask();
    createTestWrapper();
    const user = userEvent.setup();
    
    render(
      <AssignmentTransferModal
        isOpen={true}
        onClose={mockOnClose}
        task={task}
        onTaskUpdated={mockOnTaskUpdated}
      />
    );
    
    // Change assignment to Jane Doe
    const assigneeSelect = screen.getByLabelText('Select family member');
    await user.selectOptions(assigneeSelect, ['user-2']);
    
    // Cancel
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});