import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskEditModal } from '@/components/task/TaskEditModal';
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

jest.mock('@/components/task/DueDatePicker', () => ({
  DueDatePicker: ({ value, onChange, label }: any) => (
    <div data-testid="due-date-picker">
      <label>{label}</label>
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        aria-label="Select due date"
      />
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
  dueDate: new Date('2023-12-25'),
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

describe('TaskEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnTaskUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Initialization', () => {
    it('initializes form with task data when opened', () => {
      const task = createMockTask();
      createTestWrapper();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('user-1')).toBeInTheDocument();
    });

    it('resets form when task changes', () => {
      const task = createMockTask();
      createTestWrapper();
      
      const { rerender } = render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const newTask = createMockTask({ title: 'New Task Title' });
      rerender(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={newTask}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      expect(screen.getByDisplayValue('New Task Title')).toBeInTheDocument();
    });

    it('shows current task status info', () => {
      const task = createMockTask({ status: 'in_progress' });
      createTestWrapper();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Current Status:')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required title field', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      // Clear the title
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      
      // Try to submit
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('validates title length constraints', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      
      // Test too short
      await user.clear(titleInput);
      await user.type(titleInput, 'Hi');
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
      
      // Test too long
      await user.clear(titleInput);
      await user.type(titleInput, 'A'.repeat(101));
      await user.click(updateButton);
      
      expect(screen.getByText('Title must be less than 100 characters')).toBeInTheDocument();
    });

    it('validates assignee selection', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      // Clear assignee selection
      const assigneeSelect = screen.getByDisplayValue('user-1');
      await user.selectOptions(assigneeSelect, ['']);
      
      // Try to submit
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      expect(screen.getByText('Please select a family member')).toBeInTheDocument();
    });

    it('clears field errors when user starts typing', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      
      // Create error
      await user.clear(titleInput);
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      
      // Start typing should clear error
      await user.type(titleInput, 'New');
      
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('only submits changed fields', async () => {
      const task = createMockTask();
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      // Only change the title
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task Title');
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          taskId: 'task-1',
          updates: {
            title: 'Updated Task Title',
          },
        });
      });
    });

    it('handles multiple field changes', async () => {
      const task = createMockTask();
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      // Change multiple fields
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');
      
      const descriptionInput = screen.getByDisplayValue('Test task description');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'New description');
      
      const assigneeSelect = screen.getByDisplayValue('user-1');
      await user.selectOptions(assigneeSelect, ['user-2']);
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          taskId: 'task-1',
          updates: {
            title: 'New Title',
            description: 'New description',
            assigneeId: 'user-2',
          },
        });
      });
    });

    it('closes modal on successful update', async () => {
      const task = createMockTask();
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('calls onTaskUpdated when provided', async () => {
      const task = createMockTask();
      const updatedTask = { ...task, title: 'Updated Task' };
      const { mutateAsync } = createTestWrapper();
      mutateAsync.mockResolvedValue(updatedTask);
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      await waitFor(() => {
        expect(mockOnTaskUpdated).toHaveBeenCalledWith(updatedTask);
      });
    });
  });

  describe('Change Tracking', () => {
    it('disables update button when no changes', () => {
      const task = createMockTask();
      createTestWrapper();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const updateButton = screen.getByText('Update Task');
      expect(updateButton).toBeDisabled();
    });

    it('enables update button when changes are made', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.type(titleInput, ' Updated');
      
      const updateButton = screen.getByText('Update Task');
      expect(updateButton).not.toBeDisabled();
    });

    it('shows confirmation when closing with unsaved changes', async () => {
      const task = createMockTask();
      createTestWrapper();
      const user = userEvent.setup();
      
      // Mock window.confirm
      const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.type(titleInput, ' Updated');
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('Discard changes?');
      expect(mockOnClose).not.toHaveBeenCalled();
      
      mockConfirm.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during submission', async () => {
      const task = createMockTask();
      const { mutateAsync } = createTestWrapper();
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      mutateAsync.mockReturnValue(updatePromise);
      const user = userEvent.setup();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.type(titleInput, ' Updated');
      
      const updateButton = screen.getByText('Update Task');
      await user.click(updateButton);
      
      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeDisabled();
      
      resolveUpdate!();
    });
  });

  describe('Character Limits', () => {
    it('shows character count for description', () => {
      const task = createMockTask();
      createTestWrapper();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      expect(screen.getByText(/\/500 characters/)).toBeInTheDocument();
    });

    it('enforces maximum length constraints', () => {
      const task = createMockTask();
      createTestWrapper();
      
      render(
        <TaskEditModal
          isOpen={true}
          onClose={mockOnClose}
          task={task}
          onTaskUpdated={mockOnTaskUpdated}
        />
      );
      
      const titleInput = screen.getByDisplayValue('Test Task');
      expect(titleInput).toHaveAttribute('maxLength', '100');
      
      const descriptionInput = screen.getByDisplayValue('Test task description');
      expect(descriptionInput).toHaveAttribute('maxLength', '500');
    });
  });
});