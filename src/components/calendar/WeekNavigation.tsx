// Week Navigation Component
// Story 1.4: Basic Family Dashboard

import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { clsx } from 'clsx';

interface WeekNavigationProps {
  className?: string;
  showCurrentWeekButton?: boolean;
}

export function WeekNavigation({ 
  className, 
  showCurrentWeekButton = true 
}: WeekNavigationProps) {
  const {
    weekTitle,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isNavigating,
  } = useWeekNavigation();

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {/* Previous week button */}
      <button
        onClick={goToPreviousWeek}
        disabled={isNavigating}
        className={clsx(
          'p-2 rounded-lg border transition-all duration-200',
          'hover:bg-gray-50 active:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-w-[44px] min-h-[44px] flex items-center justify-center'
        )}
        aria-label="Previous week"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>

      {/* Week title and current week indicator */}
      <div className="flex items-center gap-3">
        <h2 className={clsx(
          'text-lg font-semibold text-gray-900 text-center',
          isNavigating && 'opacity-50'
        )}>
          {weekTitle}
        </h2>

        {/* Current week button */}
        {showCurrentWeekButton && !isCurrentWeek && (
          <button
            onClick={goToCurrentWeek}
            className={clsx(
              'text-sm text-blue-600 hover:text-blue-700 font-medium',
              'hover:underline transition-colors',
              'focus:outline-none focus:underline'
            )}
          >
            Today
          </button>
        )}
      </div>

      {/* Next week button */}
      <button
        onClick={goToNextWeek}
        disabled={isNavigating}
        className={clsx(
          'p-2 rounded-lg border transition-all duration-200',
          'hover:bg-gray-50 active:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-w-[44px] min-h-[44px] flex items-center justify-center'
        )}
        aria-label="Next week"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>

      {/* Loading indicator */}
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// Compact navigation for mobile
interface CompactWeekNavigationProps {
  className?: string;
}

export function CompactWeekNavigation({ className }: CompactWeekNavigationProps) {
  const {
    weekTitle,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isNavigating,
    weekDays,
  } = useWeekNavigation();

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          disabled={isNavigating}
          className={clsx(
            'p-2 rounded-full hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Previous week"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <h3 className={clsx(
            'font-semibold text-gray-900',
            isNavigating && 'opacity-50'
          )}>
            {weekTitle}
          </h3>
          {!isCurrentWeek && (
            <button
              onClick={goToCurrentWeek}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              Go to today
            </button>
          )}
        </div>

        <button
          onClick={goToNextWeek}
          disabled={isNavigating}
          className={clsx(
            'p-2 rounded-full hover:bg-gray-100 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Next week"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week overview dots */}
      <div className="flex justify-center space-x-2">
        {weekDays.map((day) => (
          <div
            key={day.key}
            className={clsx(
              'w-2 h-2 rounded-full',
              day.isToday 
                ? 'bg-blue-500' 
                : 'bg-gray-300'
            )}
            title={day.dayName}
          />
        ))}
      </div>
    </div>
  );
}

// Week picker dropdown component
interface WeekPickerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function WeekPicker({ isOpen, onClose, className }: WeekPickerProps) {
  const {
    currentWeek,
    goToSpecificWeek,
    formatDate,
  } = useWeekNavigation();

  if (!isOpen) return null;

  // Generate weeks around current week
  const weeks = [];
  for (let i = -4; i <= 4; i++) {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    weeks.push(weekStart);
  }

  return (
    <div className={clsx('absolute z-50 mt-2 bg-white rounded-lg shadow-lg border', className)}>
      <div className="p-2 max-h-64 overflow-y-auto">
        <div className="text-sm font-medium text-gray-700 p-2 border-b">
          Select Week
        </div>
        <div className="py-2">
          {weeks.map((week) => {
            const isSelected = formatDate(week, 'yyyy-MM-dd') === formatDate(currentWeek, 'yyyy-MM-dd');
            return (
              <button
                key={formatDate(week, 'yyyy-MM-dd')}
                onClick={() => {
                  goToSpecificWeek(week);
                  onClose();
                }}
                className={clsx(
                  'w-full text-left px-3 py-2 text-sm rounded transition-colors',
                  isSelected 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                {formatDate(week, 'MMM d, yyyy')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}