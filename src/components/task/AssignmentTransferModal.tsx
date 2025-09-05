// Assignment Transfer Modal Component  
// Story 2.2: Task Status Management and Completion

import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FamilyMemberSelect } from './FamilyMemberSelect';
import { Task } from '@/types/task';
import { useUpdateTask } from '@/hooks/useFamilyTasks';
import { FamilyMemberAvatar } from '@/components/family/FamilyMemberAvatar';

interface AssignmentTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export function AssignmentTransferModal({ 
  isOpen, 
  onClose, 
  task, 
  onTaskUpdated 
}: AssignmentTransferModalProps) {
  const updateTaskMutation = useUpdateTask();
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(task.assigneeId);
  const [error, setError] = useState<string>('');

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssigneeId(assigneeId);
    if (error) setError(''); // Clear error when selection changes
  };

  const handleTransfer = async () => {
    if (!selectedAssigneeId) {
      setError('Please select a family member');
      return;
    }

    if (selectedAssigneeId === task.assigneeId) {
      setError('Please select a different family member');
      return;
    }

    try {
      const updatedTask = await updateTaskMutation.mutateAsync({
        taskId: task.id,
        updates: {
          assigneeId: selectedAssigneeId,
        },
      });

      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }

      onClose();
    } catch (error) {
      console.error('Failed to transfer task:', error);
      setError('Failed to transfer task. Please try again.');
    }
  };

  const handleCancel = () => {
    setSelectedAssigneeId(task.assigneeId); // Reset selection
    setError('');
    onClose();
  };

  const hasChanges = selectedAssigneeId !== task.assigneeId;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Reassign Task"
      size="sm"
    >
      <div className="space-y-4">
        {/* Current Assignment */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Current Assignment
          </div>
          <div className="flex items-center gap-3">
            {task.assignee && (
              <FamilyMemberAvatar 
                member={task.assignee} 
                size="md" 
                showName={true}
              />
            )}
          </div>
        </div>

        {/* Task Info */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900 mb-1">
            Task: {task.title}
          </div>
          {task.description && (
            <div className="text-sm text-blue-700">
              {task.description}
            </div>
          )}
        </div>

        {/* New Assignment Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Reassign to
          </label>
          <FamilyMemberSelect
            value={selectedAssigneeId}
            onChange={handleAssigneeChange}
            error={error}
            placeholder="Select family member..."
          />
        </div>

        {/* Transfer Confirmation */}
        {hasChanges && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="text-sm font-medium text-yellow-800">
                  Confirm Task Reassignment
                </div>
                <div className="text-sm text-yellow-700">
                  This task will be transferred to the selected family member. They will receive any notifications about this task.
                </div>
              </div>
            </div>
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
          onClick={handleTransfer}
          disabled={updateTaskMutation.isPending || !hasChanges}
          isLoading={updateTaskMutation.isPending}
        >
          {updateTaskMutation.isPending ? 'Reassigning...' : 'Reassign Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Hook for using AssignmentTransferModal easily
export function useAssignmentTransferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState<Task | null>(null);

  const openTransferModal = (task: Task) => {
    setTaskToReassign(task);
    setIsOpen(true);
  };

  const closeTransferModal = () => {
    setIsOpen(false);
    setTaskToReassign(null);
  };

  return {
    isOpen,
    taskToReassign,
    openTransferModal,
    closeTransferModal,
  };
}