'use client';

import { useState, useEffect } from 'react';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { useSelectedFamilyMember, useFilterActions, useShowQuickAdd, useUIActions } from '@/stores/app-store';
import { WeekNavigation } from '@/components/calendar/WeekNavigation';
import { WeekView } from '@/components/calendar/WeekView';
import { EmptyWeekState, LoadingState, ErrorState } from '@/components/calendar/EmptyWeekState';
import { FamilyMemberAvatar } from '@/components/family/FamilyMemberAvatar';
import { QuickAddModal } from '@/components/task/QuickAddModal';
import { FloatingActionButton } from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const { weekData, isLoading, weekTitle } = useWeekNavigation();
  const selectedMemberId = useSelectedFamilyMember();
  const showQuickAdd = useShowQuickAdd();
  const { setSelectedFamilyMember } = useFilterActions();
  const { setShowQuickAdd } = useUIActions();

  // Detect mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Check if we have tasks to determine empty state
  const hasAnyTasks = weekData?.summary.totalTasks > 0;
  const isFirstTime = !hasAnyTasks && weekData?.summary.totalEvents === 0;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Dashboard</h1>
            <p className="text-gray-600">Your family&apos;s coordination hub</p>
          </div>
        </div>

        {/* Week Navigation */}
        <WeekNavigation 
          data-testid="week-navigation" 
          className="mb-6 flex items-center justify-center gap-4" 
        />

        {/* Family Member Filter - Desktop only, when multiple members */}
        {!isMobile && weekData && weekData.members.length > 1 && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <select
              value={selectedMemberId || ''}
              onChange={(e) => setSelectedFamilyMember(e.target.value || undefined)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All members</option>
              {weekData.members.map((member) => (
                <option key={member.memberId} value={member.memberId}>
                  {member.memberName}
                </option>
              ))}
            </select>
            
            {/* Member avatars for quick filtering */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setSelectedFamilyMember(undefined)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  !selectedMemberId 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {weekData.members.map((member) => (
                <button
                  key={member.memberId}
                  onClick={() => setSelectedFamilyMember(member.memberId)}
                  className={`${
                    selectedMemberId === member.memberId ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                >
                  <FamilyMemberAvatar
                    member={{
                      id: member.memberId,
                      name: member.memberName,
                      avatarColor: member.avatarColor,
                      role: 'member', // We don't have role info in the member summary
                    }}
                    size="sm"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <LoadingState message="Loading your family dashboard..." />
      ) : !weekData ? (
        <ErrorState 
          message="Failed to load dashboard data" 
          onRetry={() => window.location.reload()} 
        />
      ) : !hasAnyTasks ? (
        <EmptyWeekState isFirstTime={isFirstTime} />
      ) : (
        <div className="space-y-8">
          {/* Weekly View */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <WeekView 
              isMobile={isMobile}
              showSummary={!isMobile}
              className="p-6"
            />
          </div>

          {/* Summary Components - Desktop Only */}
          {!isMobile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Week Summary */}
              <div data-testid="week-summary" className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{weekData.summary.totalTasks}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{weekData.summary.completedTasks}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{weekData.summary.pendingTasks}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{weekData.summary.overdueTasks}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{weekData.summary.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${weekData.summary.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Family Workload */}
              <div data-testid="family-workload" className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Workload</h3>
                <div className="space-y-3">
                  {weekData.members.map((member) => (
                    <div key={member.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FamilyMemberAvatar
                          member={{
                            id: member.memberId,
                            name: member.memberName,
                            avatarColor: member.avatarColor,
                            role: 'member',
                          }}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{member.memberName}</div>
                          <div className="text-sm text-gray-500">
                            {member.tasksAssigned} tasks • {member.completionRate}% complete
                          </div>
                        </div>
                      </div>
                      
                      {member.overdueCount > 0 && (
                        <div className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                          {member.overdueCount} overdue
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button - Mobile and Desktop */}
      <FloatingActionButton
        onClick={() => setShowQuickAdd(true)}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Add task or event"
        size="lg"
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        defaultAssigneeId={selectedMemberId}
      />
      </div>
    </ProtectedRoute>
  );
}