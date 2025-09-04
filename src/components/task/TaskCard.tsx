// Task Card Component
// Story 1.4: Basic Family Dashboard

import { Task } from '@/types/task';
import { FamilyMemberAvatar } from '@/components/family/FamilyMemberAvatar';
import { useUpdateTask } from '@/hooks/useFamilyTasks';
import { format, isToday, isPast, differenceInDays } from 'date-fns';
import { clsx } from 'clsx';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  className?: string;
  showDate?: boolean;
  compact?: boolean;
}

const priorityStyles = {
  low: 'border-l-gray-300 bg-gray-50',
  medium: 'border-l-yellow-400 bg-yellow-50',
  high: 'border-l-red-400 bg-red-50',
};

const statusStyles = {
  pending: 'bg-white border-gray-200',
  in_progress: 'bg-blue-50 border-blue-200',
  completed: 'bg-green-50 border-green-200 opacity-75',
};

const categoryIcons = {
  task: (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4" />
    </svg>
  ),
  event: (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

export function TaskCard({ task, className, showDate = true, compact = false }: TaskCardProps) {
  const updateTaskMutation = useUpdateTask();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDueDateInfo = () => {
    if (!task.dueDate) return null;

    const now = new Date();
    const dueDate = task.dueDate;
    const daysDiff = differenceInDays(dueDate, now);
    
    let label = '';
    let className = 'text-gray-600';

    if (isToday(dueDate)) {
      label = 'Due today';
      className = 'text-orange-600 font-medium';
    } else if (isPast(dueDate) && task.status !== 'completed') {
      label = `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}`;
      className = 'text-red-600 font-medium';
    } else if (daysDiff === 1) {
      label = 'Due tomorrow';
      className = 'text-yellow-600';
    } else if (daysDiff > 1 && daysDiff <= 3) {
      label = `Due in ${daysDiff} days`;
      className = 'text-gray-600';
    } else if (showDate) {
      label = format(dueDate, 'MMM d');
      className = 'text-gray-500';
    }

    return { label, className };
  };

  const dueDateInfo = getDueDateInfo();
  const isOverdue = task.dueDate && isPast(task.dueDate) && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={clsx(
        'group relative border-l-4 border rounded-lg p-3 shadow-sm transition-all duration-200',
        priorityStyles[task.priority],
        statusStyles[task.status],
        'hover:shadow-md',
        isOverdue && 'ring-1 ring-red-200',
        compact && 'p-2',
        className
      )}
    >
      {/* Status checkbox */}
      <div className="absolute top-2 right-2">
        <button
          onClick={handleStatusToggle}
          disabled={isUpdating}
          className={clsx(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            isCompleted 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-gray-400',
            isUpdating && 'opacity-50 cursor-not-allowed',
            'hover:bg-green-50'
          )}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* Task content */}
      <div className={clsx('pr-8', compact && 'pr-6')}>
        {/* Header row */}
        <div className="flex items-start gap-2 mb-1">
          <div className="flex items-center gap-1 flex-shrink-0">
            {categoryIcons[task.category]}
            {task.priority === 'high' && (
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={clsx(
              'font-medium text-gray-900 truncate',
              compact ? 'text-sm' : 'text-base',
              isCompleted && 'line-through text-gray-500'
            )}>
              {task.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {task.description && !compact && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {task.assignee && (
              <FamilyMemberAvatar 
                member={task.assignee} 
                size="sm" 
                showName={!compact}
              />
            )}
          </div>

          {/* Due date info */}
          {dueDateInfo && (
            <div className={clsx(
              'text-xs',
              dueDateInfo.className,
              compact && 'text-xs'
            )}>
              {dueDateInfo.label}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// Component for displaying task count summaries
interface TaskSummaryProps {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  className?: string;
}

export function TaskSummary({ 
  totalTasks, 
  completedTasks, 
  overdueTasks, 
  className 
}: TaskSummaryProps) {
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={clsx('text-xs text-gray-600 space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span>Total: {totalTasks}</span>
        <span>{completionRate}% complete</span>
      </div>
      
      {pendingTasks > 0 && (
        <div className="text-gray-500">
          {pendingTasks} pending
          {overdueTasks > 0 && (
            <span className="text-red-600 ml-1">• {overdueTasks} overdue</span>
          )}
        </div>
      )}
      
      {totalTasks > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      )}
    </div>
  );
}