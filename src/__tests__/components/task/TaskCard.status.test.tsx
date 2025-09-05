import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/components/task/TaskCard';
import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useFamilyTasks';

// Mock the hooks
jest.mock('@/hooks/useFamilyTasks');
const mockUseUpdateTask = useUpdateTask as jest.MockedFunction<typeof useUpdateTask>;

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'Dec 25'),
  isToday: jest.fn(() => false),
  isPast: jest.fn(() => false),
  differenceInDays: jest.fn(() => 5),
}));

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

describe('TaskCard Status Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Display', () => {
    it('displays correct status indicator for pending task', () => {
      const task = createMockTask({ status: 'pending' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('Pending');
      expect(statusIndicator).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('displays correct status indicator for in_progress task', () => {
      const task = createMockTask({ status: 'in_progress' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('In Progress');
      expect(statusIndicator).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('displays correct status indicator for completed task', () => {
      const task = createMockTask({ status: 'completed' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveTextContent('Complete');
      expect(statusIndicator).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('shows completed task title with line-through styling', () => {
      const task = createMockTask({ status: 'completed' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const title = screen.getByText('Test Task');
      expect(title).toHaveClass('line-through', 'text-gray-500');
    });
  });

  describe('Status Button', () => {
    it('has 44px minimum touch target for accessibility', () => {
      const task = createMockTask({ status: 'pending' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Start task');
      expect(statusButton).toHaveClass('w-11', 'h-11'); // 44px = 11 * 4px (Tailwind)
    });

    it('shows correct aria-label and title for each status', () => {
      createTestWrapper();
      const { rerender } = render(<TaskCard task={createMockTask({ status: 'pending' })} />);
      
      let statusButton = screen.getByLabelText('Start task');
      expect(statusButton).toHaveAttribute('title', 'Click to start task');

      rerender(<TaskCard task={createMockTask({ status: 'in_progress' })} />);
      statusButton = screen.getByLabelText('Complete task');
      expect(statusButton).toHaveAttribute('title', 'Click to complete task');

      rerender(<TaskCard task={createMockTask({ status: 'completed' })} />);
      statusButton = screen.getByLabelText('Reset task');
      expect(statusButton).toHaveAttribute('title', 'Click to reset to pending');
    });
  });

  describe('Status Updates', () => {
    it('cycles through statuses correctly: pending -> in_progress', async () => {
      const task = createMockTask({ status: 'pending' });
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Start task');
      await user.click(statusButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          taskId: 'task-1',
          updates: { status: 'in_progress' },
        });
      });
    });

    it('cycles through statuses correctly: in_progress -> completed', async () => {
      const task = createMockTask({ status: 'in_progress' });
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Complete task');
      await user.click(statusButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          taskId: 'task-1',
          updates: { 
            status: 'completed',
            completedAt: expect.any(String),
          },
        });
      });
    });

    it('cycles through statuses correctly: completed -> pending', async () => {
      const task = createMockTask({ status: 'completed' });
      const { mutateAsync } = createTestWrapper();
      const user = userEvent.setup();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Reset task');
      await user.click(statusButton);

      await waitFor(() => {
        expect(mutateAsync).toHaveBeenCalledWith({
          taskId: 'task-1',
          updates: { 
            status: 'pending',
            completedAt: null,
          },
        });
      });
    });

    it('prevents multiple status updates when already updating', async () => {
      const task = createMockTask({ status: 'pending' });
      const { mutateAsync } = createTestWrapper();
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      mutateAsync.mockReturnValue(updatePromise);
      
      const user = userEvent.setup();
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Start task');
      
      // Click multiple times rapidly
      await user.click(statusButton);
      await user.click(statusButton);
      await user.click(statusButton);

      // Should only call once
      expect(mutateAsync).toHaveBeenCalledTimes(1);

      resolveUpdate!();
    });

    it('handles status update errors gracefully', async () => {
      const task = createMockTask({ status: 'pending' });
      const { mutateAsync } = createTestWrapper();
      mutateAsync.mockRejectedValue(new Error('Update failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const user = userEvent.setup();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Start task');
      await user.click(statusButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update task status:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Visual States', () => {
    it('shows visual feedback on status button hover and active states', () => {
      const task = createMockTask({ status: 'pending' });
      createTestWrapper();
      
      render(<TaskCard task={task} />);
      
      const statusButton = screen.getByLabelText('Start task');
      expect(statusButton).toHaveClass('hover:scale-105', 'active:scale-95');
    });
  });
});