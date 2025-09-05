// Task Edit Modal Component
// Story 2.2: Task Status Management and Completion

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DueDatePicker } from './DueDatePicker';
import { FamilyMemberSelect } from './FamilyMemberSelect';
import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useFamilyTasks';
import { clsx } from 'clsx';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated?: (updatedTask: Task) => void;
}

interface TaskEditFormData {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: Date | null;
}

interface ValidationErrors {
  title?: string;
  assigneeId?: string;
}

export function TaskEditModal({ isOpen, onClose, task, onTaskUpdated }: TaskEditModalProps) {
  const updateTaskMutation = useUpdateTask();
  
  // Form state
  const [formData, setFormData] = useState<TaskEditFormData>({
    title: task.title,
    description: task.description || '',
    assigneeId: task.assigneeId,
    dueDate: task.dueDate || null,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assigneeId,
        dueDate: task.dueDate || null,
      });
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, task]);

  // Track if form has changes
  useEffect(() => {
    const hasFormChanges = (
      formData.title !== task.title ||
      formData.description !== (task.description || '') ||
      formData.assigneeId !== task.assigneeId ||
      (formData.dueDate?.getTime() || null) !== (task.dueDate?.getTime() || null)
    );
    setHasChanges(hasFormChanges);
  }, [formData, task]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Assignee validation
    if (!formData.assigneeId) {
      newErrors.assigneeId = 'Please select a family member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TaskEditFormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updates: Partial<Task> = {};
      
      // Only include changed fields
      if (formData.title !== task.title) {
        updates.title = formData.title.trim();
      }
      
      if (formData.description !== (task.description || '')) {
        updates.description = formData.description.trim() || undefined;
      }
      
      if (formData.assigneeId !== task.assigneeId) {
        updates.assigneeId = formData.assigneeId;
      }
      
      if ((formData.dueDate?.getTime() || null) !== (task.dueDate?.getTime() || null)) {
        updates.dueDate = formData.dueDate || undefined;
      }

      // Only make request if there are actual changes
      if (Object.keys(updates).length > 0) {
        const updatedTask = await updateTaskMutation.mutateAsync({
          taskId: task.id,
          updates,
        });

        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      // Error will be handled by React Query error boundary or toast system
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // In a production app, you might want to show a confirmation dialog
      const confirmDiscard = window.confirm('Discard changes?');
      if (!confirmDiscard) return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Task"
      size="md"
      closeOnOverlayClick={false} // Prevent accidental closes with unsaved changes
    >
      <div className="space-y-4">
        {/* Title Field */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter task title..."
          maxLength={100}
          autoFocus
          className="w-full"
        />

        {/* Description Field */}
        <Textarea
          label="Description (optional)"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Add details about this task..."
          rows={3}
          maxLength={500}
          autoResize
          className="w-full"
          helperText={`${formData.description.length}/500 characters`}
        />

        {/* Assignee Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Assigned to
          </label>
          <FamilyMemberSelect
            value={formData.assigneeId}
            onChange={(assigneeId) => handleInputChange('assigneeId', assigneeId)}
            error={errors.assigneeId}
            placeholder="Select family member..."
          />
        </div>

        {/* Due Date Picker */}
        <DueDatePicker
          value={formData.dueDate}
          onChange={(date) => handleInputChange('dueDate', date)}
          label="Due date"
        />

        {/* Task Status Info */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Current Status:</span>
            <span 
              className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium',
                task.status === 'pending' && 'bg-gray-100 text-gray-700',
                task.status === 'in_progress' && 'bg-blue-100 text-blue-700',
                task.status === 'completed' && 'bg-green-100 text-green-700'
              )}
            >
              {task.status === 'pending' && 'Pending'}
              {task.status === 'in_progress' && 'In Progress'}
              {task.status === 'completed' && 'Completed'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            To change the task status, use the status button on the task card
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={updateTaskMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateTaskMutation.isPending || !hasChanges}
          isLoading={updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Hook for using TaskEditModal easily
export function useTaskEditModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const openEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsOpen(true);
  };

  const closeEditModal = () => {
    setIsOpen(false);
    setTaskToEdit(null);
  };

  return {
    isOpen,
    taskToEdit,
    openEditModal,
    closeEditModal,
  };
}