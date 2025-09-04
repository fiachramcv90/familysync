// Week View Component for Calendar Layout
// Story 1.4: Basic Family Dashboard

import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { DayColumn, DayCard } from './DayColumn';
import { clsx } from 'clsx';
import { useState } from 'react';

interface WeekViewProps {
  className?: string;
  showSummary?: boolean;
  isMobile?: boolean;
}

export function WeekView({ className, showSummary = true, isMobile = false }: WeekViewProps) {
  const { weekDays, weekData, isLoading } = useWeekNavigation();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={clsx('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading week...</p>
        </div>
      </div>
    );
  }

  if (!weekData) {
    return (
      <div className={clsx('flex items-center justify-center h-64', className)}>
        <div className="text-center text-gray-500">
          <p>Failed to load week data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:underline mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout - show cards that can be tapped to expand
  if (isMobile) {
    return (
      <div className={clsx('space-y-4', className)} data-testid="week-view">
        {weekDays.map((dayInfo) => {
          const dayData = weekData.days.find(d => d.date === dayInfo.key);
          if (!dayData) return null;

          return (
            <div key={dayInfo.key}>
              <DayCard
                day={dayData}
                date={dayInfo.date}
                onClick={() => setSelectedDay(selectedDay === dayInfo.key ? null : dayInfo.key)}
              />
              
              {/* Expanded day view */}
              {selectedDay === dayInfo.key && (
                <div className="mt-2 border rounded-lg bg-gray-50">
                  <DayColumn
                    day={dayData}
                    date={dayInfo.date}
                    showSummary={false}
                    className="h-auto"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop layout - full week grid
  return (
    <div 
      className={clsx(
        'grid grid-cols-7 gap-0 border rounded-lg overflow-hidden bg-white',
        'min-h-[500px] h-full',
        className
      )} 
      data-testid="week-view"
    >
      {weekDays.map((dayInfo) => {
        const dayData = weekData.days.find(d => d.date === dayInfo.key);
        if (!dayData) return null;

        return (
          <div 
            key={dayInfo.key} 
            className="border-r last:border-r-0 flex flex-col min-h-0"
          >
            <DayColumn
              day={dayData}
              date={dayInfo.date}
              showSummary={showSummary}
              className="h-full"
            />
          </div>
        );
      })}
    </div>
  );
}

// Week summary component
interface WeekSummaryProps {
  className?: string;
}

export function WeekSummary({ className }: WeekSummaryProps) {
  const { weekData, weekTitle } = useWeekNavigation();

  if (!weekData) return null;

  const { summary } = weekData;

  return (
    <div className={clsx('bg-white rounded-lg border p-4', className)}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">{weekTitle} Summary</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{summary.totalTasks}</div>
          <div className="text-xs text-gray-500">Total Tasks</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.completedTasks}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.pendingTasks}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.overdueTasks}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>
      </div>

      {/* Completion rate */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Week Progress</span>
          <span className="text-gray-900 font-medium">{summary.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Family member workload component
interface FamilyWorkloadProps {
  className?: string;
}

export function FamilyWorkload({ className }: FamilyWorkloadProps) {
  const { weekData } = useWeekNavigation();

  if (!weekData || !weekData.members) return null;

  return (
    <div className={clsx('bg-white rounded-lg border p-4', className)}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Family Workload</h3>
      
      <div className="space-y-3">
        {weekData.members.map((member) => (
          <div key={member.memberId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: member.avatarColor }}
              />
              <span className="text-sm font-medium text-gray-900">
                {member.memberName}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-600">
                {member.tasksAssigned} tasks
              </span>
              <span className={clsx(
                'px-2 py-1 rounded-full font-medium',
                member.completionRate >= 80 
                  ? 'bg-green-100 text-green-700'
                  : member.completionRate >= 50
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              )}>
                {member.completionRate}%
              </span>
              {member.overdueCount > 0 && (
                <span className="text-red-600">
                  {member.overdueCount} overdue
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}