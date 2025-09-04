// Due Date Picker Component
// Story 2.1: Task Creation and Basic Management

import { useState } from 'react';
import { format, addDays, addWeeks, isToday, isTomorrow, isThisWeek, startOfDay } from 'date-fns';
import { clsx } from 'clsx';
import { Input } from '@/components/ui/Input';

interface DueDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  className?: string;
  label?: string;
}

// Quick date options
const quickOptions = [
  {
    label: 'Today',
    getValue: () => new Date(),
    isActive: (date: Date) => isToday(date),
  },
  {
    label: 'Tomorrow',
    getValue: () => addDays(new Date(), 1),
    isActive: (date: Date) => isTomorrow(date),
  },
  {
    label: 'This Weekend',
    getValue: () => {
      const today = new Date();
      const daysUntilSaturday = 6 - today.getDay(); // 0 = Sunday, 6 = Saturday
      return addDays(today, daysUntilSaturday);
    },
    isActive: (date: Date) => {
      const today = new Date();
      const daysUntilSaturday = 6 - today.getDay();
      const saturday = addDays(today, daysUntilSaturday);
      return format(date, 'yyyy-MM-dd') === format(saturday, 'yyyy-MM-dd');
    },
  },
  {
    label: 'Next Week',
    getValue: () => addWeeks(new Date(), 1),
    isActive: (date: Date) => {
      const nextWeek = addWeeks(new Date(), 1);
      return format(date, 'yyyy-MM-dd') === format(nextWeek, 'yyyy-MM-dd');
    },
  },
];

export function DueDatePicker({
  value,
  onChange,
  error,
  className,
  label = "Due date (optional)",
}: DueDatePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  
  const handleQuickSelect = (date: Date) => {
    onChange(startOfDay(date));
    setShowCustom(false);
  };

  const handleCustomDateChange = (dateString: string) => {
    if (!dateString) {
      onChange(null);
      return;
    }
    
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        onChange(startOfDay(date));
      }
    } catch (err) {
      console.error('Invalid date:', dateString, err);
    }
  };

  const handleClearDate = () => {
    onChange(null);
    setShowCustom(false);
  };

  const formatSelectedDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Selected date display */}
      {value && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              Due {formatSelectedDate(value)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearDate}
            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition-colors"
            aria-label="Clear due date"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Quick options */}
      {!showCustom && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Quick options
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {quickOptions.map((option) => {
              const isActive = value && option.isActive(value);
              
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickSelect(option.getValue())}
                  className={clsx(
                    'flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    // Touch-friendly minimum size
                    'min-h-[44px]',
                    isActive
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Custom date toggle */}
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 bg-white rounded-lg hover:bg-blue-50 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Choose specific date
          </button>
          
          {/* No due date option */}
          <button
            type="button"
            onClick={handleClearDate}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            No due date
          </button>
        </div>
      )}

      {/* Custom date input */}
      {showCustom && (
        <div className="space-y-3">
          <Input
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            label="Select date"
            className="w-full"
          />
          
          <button
            type="button"
            onClick={() => setShowCustom(false)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            ← Back to quick options
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}