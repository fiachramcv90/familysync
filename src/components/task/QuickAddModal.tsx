// Quick Add Modal for Task Creation
// Story 2.1: Task Creation and Basic Management

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { TaskTypeSelector } from './TaskTypeSelector';
import { FamilyMemberSelect } from './FamilyMemberSelect';
import { DueDatePicker } from './DueDatePicker';
import { useCreateTask } from '@/hooks/useCreateTask';
import { CreateTaskInput, Priority } from '@/types/task';
import { clsx } from 'clsx';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssigneeId?: string;
  defaultDueDate?: Date;
}

interface FormData {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: Date | null;
  category: 'task' | 'event';
  priority: Priority;
}

interface FormErrors {
  title?: string;
  assigneeId?: string;
  submit?: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  assigneeId: '',
  dueDate: null,
  category: 'task',
  priority: 'medium',
};

const priorityOptions: Array<{ value: Priority; label: string; color: string }> = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

export function QuickAddModal({ 
  isOpen, 
  onClose, 
  defaultAssigneeId,
  defaultDueDate 
}: QuickAddModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTaskMutation = useCreateTask({
    onSuccess: () => {
      handleClose();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
      setIsSubmitting(false);
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormData,
        assigneeId: defaultAssigneeId || '',
        dueDate: defaultDueDate || null,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, defaultAssigneeId, defaultDueDate]);

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      const titleInput = document.getElementById('task-title-input');
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 100);
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.assigneeId) {
      newErrors.assigneeId = 'Please select a family member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const taskInput: CreateTaskInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assigneeId: formData.assigneeId,
        dueDate: formData.dueDate || undefined,
        category: formData.category,
        priority: formData.priority,
      };

      await createTaskMutation.mutateAsync(taskInput);
    } catch (error) {
      // Error handling is done in the mutation onError callback
      console.error('Task creation failed:', error);
    }
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear related errors when user makes changes
    if (updates.title !== undefined && errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
    if (updates.assigneeId !== undefined && errors.assigneeId) {
      setErrors(prev => ({ ...prev, assigneeId: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Create ${formData.category === 'task' ? 'Task' : 'Event'}`}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscapeKey={!isSubmitting}
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Task Type Selection */}
        <TaskTypeSelector
          value={formData.category}
          onChange={(category) => updateFormData({ category })}
        />

        {/* Title Input */}
        <Input
          id="task-title-input"
          label="Title *"
          placeholder={`What needs to be ${formData.category === 'task' ? 'done' : 'attended'}?`}
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          error={errors.title}
          maxLength={100}
          className="w-full"
          required
          autoComplete="off"
        />

        {/* Description Input */}
        <Textarea
          label="Description (optional)"
          placeholder="Add any additional details..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
          maxLength={500}
          className="w-full"
          autoResize
        />

        {/* Priority Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFormData({ priority: option.value })}
                className={clsx(
                  'flex items-center gap-1 px-3 py-1 text-sm rounded-full border transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  'min-h-[32px]',
                  formData.priority === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    option.value === 'high' && 'bg-red-500',
                    option.value === 'medium' && 'bg-yellow-500',
                    option.value === 'low' && 'bg-gray-400'
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Family Member Assignment */}
        <FamilyMemberSelect
          value={formData.assigneeId}
          onChange={(assigneeId) => updateFormData({ assigneeId })}
          error={errors.assigneeId}
        />

        {/* Due Date Selection */}
        <DueDatePicker
          value={formData.dueDate}
          onChange={(dueDate) => updateFormData({ dueDate })}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600" role="alert">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Form Actions */}
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!formData.title.trim() || !formData.assigneeId}
          >
            {isSubmitting 
              ? `Creating ${formData.category}...` 
              : `Create ${formData.category === 'task' ? 'Task' : 'Event'}`
            }
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}