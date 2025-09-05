// Day Column Component for Weekly Calendar
// Story 1.4: Basic Family Dashboard

import { WeeklyTaskView, Task, Event } from '@/types/task';
import { TaskCard, TaskSummary } from '@/components/task/TaskCard';
import { format, isToday } from 'date-fns';
import { clsx } from 'clsx';

interface DayColumnProps {
  day: WeeklyTaskView;
  date: Date;
  isCompact?: boolean;
  showSummary?: boolean;
  className?: string;
}

export function DayColumn({ 
  day, 
  date, 
  isCompact = false, 
  showSummary = true,
  className 
}: DayColumnProps) {
  const todayClass = isToday(date);
  const hasItems = day.tasks.length > 0 || day.events.length > 0;
  // Sort tasks by priority and due date
  const sortedTasks = day.tasks.sort((a, b) => {
    // Sort by priority first: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (a.dueDate && !b.dueDate) {
      return -1;
    } else if (!a.dueDate && b.dueDate) {
      return 1;
    }
    return 0;
  });

  // Sort events by start time
  const sortedEvents = day.events.sort((a, b) => {
    return a.startDateTime.getTime() - b.startDateTime.getTime();
  });

  return (
    <div 
      className={clsx(
        'flex flex-col h-full min-h-0',
        className
      )}
      data-testid="day-column"
    >
      {/* Day header */}
      <div className={clsx(
        'flex-shrink-0 p-3 border-b bg-gray-50',
        todayClass && 'bg-blue-50 border-blue-200'
      )}>
        <div className="text-center">
          <div className={clsx(
            'text-xs font-medium text-gray-600 uppercase tracking-wide mb-1',
            todayClass && 'text-blue-600'
          )}>
            {format(date, 'EEE')}
          </div>
          <div className={clsx(
            'text-lg font-semibold',
            todayClass 
              ? 'text-blue-900 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
              : 'text-gray-900'
          )}>
            {format(date, 'd')}
          </div>
          {!isCompact && (
            <div className="text-xs text-gray-500 mt-1">
              {format(date, 'MMM')}
            </div>
          )}
        </div>

        {/* Day summary */}
        {showSummary && hasItems && (
          <div className="mt-2">
            <TaskSummary
              totalTasks={day.taskCount}
              completedTasks={day.completedTaskCount}
              overdueTasks={day.overdueTaskCount}
            />
          </div>
        )}
      </div>

      {/* Tasks and events list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {/* Render tasks */}
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              compact={isCompact}
              showDate={false} // Don't show date since it's implied by the column
              className="w-full"
            />
          ))}
          
          {/* Render events - for now, just show a simple card */}
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="w-full border border-blue-200 bg-blue-50 rounded-lg p-3"
            >
              <div className="font-medium text-blue-900">{event.title}</div>
              <div className="text-sm text-blue-700 mt-1">
                {format(event.startDateTime, 'HH:mm')} - {format(event.endDateTime, 'HH:mm')}
              </div>
              {event.location && (
                <div className="text-xs text-blue-600 mt-1">{event.location}</div>
              )}
            </div>
          ))}
          
          {/* Show empty state if no items */}
          {!hasItems && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-sm">No tasks or events</div>
              {!isCompact && (
                <div className="text-xs mt-1">for today</div>
              )}
            </div>
          )}
        </div>

        {/* Quick add button placeholder */}
        {!isCompact && (
          <div className="mt-4 pt-2 border-t border-gray-100">
            <button className="w-full text-xs text-gray-500 hover:text-gray-700 py-2 px-3 border border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors">
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized day card for small screens
interface DayCardProps {
  day: WeeklyTaskView;
  date: Date;
  onClick?: () => void;
  className?: string;
}

export function DayCard({ day, date, onClick, className }: DayCardProps) {
  const todayClass = isToday(date);
  const hasItems = day.tasks.length > 0 || day.events.length > 0;
  const urgentTasks = day.tasks.filter(t => 
    t.priority === 'high' || 
    (t.dueDate && isToday(t.dueDate)) ||
    day.overdueTaskCount > 0
  );

  return (
    <div 
      className={clsx(
        'relative p-4 border rounded-lg transition-all duration-200',
        'hover:shadow-md cursor-pointer',
        todayClass 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-gray-200 hover:border-gray-300',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'text-sm font-medium',
            todayClass ? 'text-blue-900' : 'text-gray-900'
          )}>
            {format(date, 'EEE')}
          </div>
          <div className={clsx(
            'text-lg font-semibold',
            todayClass 
              ? 'text-blue-900 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'
              : 'text-gray-900'
          )}>
            {format(date, 'd')}
          </div>
        </div>

        {/* Quick status indicators */}
        <div className="flex items-center gap-1">
          {urgentTasks.length > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Urgent tasks" />
          )}
          {day.overdueTaskCount > 0 && (
            <div className="text-xs text-red-600 font-medium">
              {day.overdueTaskCount}!
            </div>
          )}
        </div>
      </div>

      {/* Content preview */}
      {hasItems ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{day.taskCount} tasks</span>
            {day.eventCount > 0 && <span>{day.eventCount} events</span>}
          </div>
          
          {/* Show first few task titles */}
          <div className="space-y-1">
            {day.tasks.slice(0, 2).map((task) => (
              <div 
                key={task.id} 
                className={clsx(
                  'text-xs truncate',
                  task.status === 'completed' 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-700'
                )}
              >
                {task.title}
              </div>
            ))}
            {day.taskCount > 2 && (
              <div className="text-xs text-gray-500">
                +{day.taskCount - 2} more
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400">
          No tasks
        </div>
      )}

      {/* Completion indicator */}
      {day.taskCount > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: `${day.taskCount > 0 ? (day.completedTaskCount / day.taskCount) * 100 : 0}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}