// Empty Week State Component for Onboarding
// Story 1.4: Basic Family Dashboard

import { useUIActions } from '@/stores/app-store';
import { clsx } from 'clsx';

interface EmptyWeekStateProps {
  className?: string;
  isFirstTime?: boolean;
}

export function EmptyWeekState({ className, isFirstTime = false }: EmptyWeekStateProps) {
  const { setShowQuickAdd } = useUIActions();

  const handleAddFirstTask = () => {
    setShowQuickAdd(true);
  };

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center p-8 text-center',
      'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100',
      'min-h-[400px]',
      className
    )}>
      {/* Illustration */}
      <div className="mb-6">
        <svg 
          className="w-24 h-24 text-blue-300 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M16 11h-1m-2 0h-1m-2 0H9m6 4h-1m-2 0h-1m-2 0H9" 
          />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {isFirstTime ? 'Welcome to Your Family Dashboard!' : 'No Tasks This Week'}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {isFirstTime ? (
            <>
              Start coordinating your family&apos;s schedule by adding your first task. 
              FamilySync helps everyone stay on the same page with shared responsibilities, 
              events, and daily coordination.
            </>
          ) : (
            <>
              Looks like a quiet week! Add tasks and events to keep your family 
              organized and make sure nothing important gets missed.
            </>
          )}
        </p>

        {/* Benefits list for first-time users */}
        {isFirstTime && (
          <div className="mb-6 text-left bg-white rounded-lg p-4 shadow-sm border">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              What you can do with FamilySync:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Assign tasks and chores to family members
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Schedule family events and appointments
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Track progress and completion rates
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                See everyone&apos;s workload at a glance
              </li>
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleAddFirstTask}
            className={clsx(
              'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
              'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'transition-all duration-200 min-w-[140px] justify-center'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isFirstTime ? 'Add Your First Task' : 'Add Task'}
          </button>

          {!isFirstTime && (
            <button
              onClick={() => {/* TODO: Open templates or suggestions */}}
              className={clsx(
                'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
                'bg-white text-gray-700 border border-gray-300',
                'hover:bg-gray-50 hover:border-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                'transition-all duration-200 min-w-[140px] justify-center'
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Browse Ideas
            </button>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 text-xs text-gray-500">
          Need help getting started?{' '}
          <button className="text-blue-600 hover:underline">
            View quick start guide
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple empty state for individual days
interface EmptyDayStateProps {
  dayName?: string;
  className?: string;
}

export function EmptyDayState({ dayName, className }: EmptyDayStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center p-6 text-center',
      'text-gray-400',
      className
    )}>
      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
      <p className="text-sm">
        No tasks {dayName ? `for ${dayName}` : 'scheduled'}
      </p>
    </div>
  );
}

// Loading state component
interface LoadingStateProps {
  className?: string;
  message?: string;
}

export function LoadingState({ className, message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center p-8',
      'min-h-[200px]',
      className
    )}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  className?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ className, message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center p-8 text-center',
      'min-h-[200px]',
      className
    )}>
      <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
        >
          Try again
        </button>
      )}
    </div>
  );
}