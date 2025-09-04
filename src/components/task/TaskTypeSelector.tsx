// Task Type Selection Component
// Story 2.1: Task Creation and Basic Management

import { clsx } from 'clsx';

interface TaskTypeSelectorProps {
  value: 'task' | 'event';
  onChange: (type: 'task' | 'event') => void;
  className?: string;
}

const typeOptions = [
  {
    value: 'task' as const,
    label: 'Task',
    description: 'Something to be done',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    value: 'event' as const,
    label: 'Event',
    description: 'Something scheduled',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function TaskTypeSelector({ value, onChange, className }: TaskTypeSelectorProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        Type
      </label>
      
      <div
        role="radiogroup"
        aria-label="Task type selection"
        className="grid grid-cols-2 gap-3"
      >
        {typeOptions.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={clsx(
                'relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                // Touch-friendly minimum size
                'min-h-[44px]',
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {/* Selection indicator */}
              <div className="absolute top-2 right-2">
                <div
                  className={clsx(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              
              {/* Icon */}
              <div className={clsx(
                'mb-2',
                isSelected ? 'text-blue-600' : 'text-gray-500'
              )}>
                {option.icon}
              </div>
              
              {/* Label */}
              <div className="text-center">
                <div className="font-medium text-sm">
                  {option.label}
                </div>
                <div className={clsx(
                  'text-xs mt-1',
                  isSelected ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}