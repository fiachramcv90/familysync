// Completion Confirmation Modal Component
// Story 2.2: Task Status Management and Completion

import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useFamilyTasks';
import { FamilyMemberAvatar } from '@/components/family/FamilyMemberAvatar';
import { clsx } from 'clsx';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export function CompletionModal({ 
  isOpen, 
  onClose, 
  task, 
  onTaskUpdated 
}: CompletionModalProps) {
  const updateTaskMutation = useUpdateTask();
  const [completionNotes, setCompletionNotes] = useState('');
  const [skipNotes, setSkipNotes] = useState(false);

  const handleComplete = async () => {
    try {
      const updates: any = {
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      // Add completion notes if provided
      if (completionNotes.trim()) {
        // Store completion notes in description if task doesn't have one,
        // or append to existing description
        const notesSection = `\n\n--- Completion Notes ---\n${completionNotes.trim()}`;
        updates.description = task.description 
          ? `${task.description}${notesSection}`
          : `Completed${notesSection}`;
      }

      const updatedTask = await updateTaskMutation.mutateAsync({
        taskId: task.id,
        updates,
      });

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }

      onClose();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleCancel = () => {
    setCompletionNotes('');
    setSkipNotes(false);
    onClose();
  };

  const handleSkipAndComplete = async () => {
    setSkipNotes(true);
    await handleComplete();
  };

  // Determine if this is a complex task that might benefit from completion notes
  const isComplexTask = task.description && task.description.length > 50;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Complete Task"
      size="md"
    >
      <div className="space-y-4">
        {/* Task Info */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium text-green-900 mb-1">
                {task.title}
              </div>
              {task.description && (
                <div className="text-sm text-green-700 line-clamp-3">
                  {task.description}
                </div>
              )}
              
              <div className="flex items-center gap-4 mt-3">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Assigned to:</span>
                    <FamilyMemberAvatar 
                      member={task.assignee} 
                      size="sm" 
                      showName={true}
                    />
                  </div>
                )}
                
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">Due:</span>
                    <span className="text-sm font-medium text-green-800">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Completion Notes (optional)
            </label>
            {isComplexTask && (
              <span className="text-xs text-blue-600 font-medium">
                Recommended for this task
              </span>
            )}
          </div>
          
          <Textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes about how this task was completed, issues encountered, or follow-up needed..."
            rows={4}
            maxLength={500}
            className="w-full"
            helperText={`${completionNotes.length}/500 characters`}
          />
          
          <div className="text-xs text-gray-500">
            These notes will be added to the task description and visible to all family members.
          </div>
        </div>

        {/* Quick completion options for simple tasks */}
        {!isComplexTask && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Quick Complete
            </div>
            <button
              onClick={handleSkipAndComplete}
              disabled={updateTaskMutation.isPending}
              className={clsx(
                'w-full text-left px-3 py-2 text-sm rounded border transition-colors',
                'hover:bg-white hover:border-gray-300',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                updateTaskMutation.isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="font-medium text-gray-900">Complete without notes</div>
              <div className="text-gray-600">Mark as done with no additional information</div>
            </button>
          </div>
        )}
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
          onClick={handleComplete}
          disabled={updateTaskMutation.isPending}
          isLoading={updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? 'Completing...' : 'Complete Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Hook for using CompletionModal easily
export function useCompletionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const openCompletionModal = (task: Task) => {
    setTaskToComplete(task);
    setIsOpen(true);
  };

  const closeCompletionModal = () => {
    setIsOpen(false);
    setTaskToComplete(null);
  };

  return {
    isOpen,
    taskToComplete,
    openCompletionModal,
    closeCompletionModal,
  };
}