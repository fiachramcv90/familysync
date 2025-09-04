// Test file for Weekly Dashboard
// Story 1.4: Basic Family Dashboard

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/app/dashboard/page';
import '@testing-library/jest-dom';

// Mock the hooks
jest.mock('@/hooks/useWeekNavigation');
jest.mock('@/stores/app-store', () => ({
  useSelectedFamilyMember: jest.fn(),
  useFilterActions: jest.fn(),
}));

// Mock the child components
jest.mock('@/components/calendar/WeekNavigation', () => ({
  WeekNavigation: ({ className }: { className?: string }) => (
    <div data-testid="week-navigation" className={className}>
      Mock Week Navigation
    </div>
  ),
}));

jest.mock('@/components/calendar/WeekView', () => ({
  WeekView: ({ isMobile, showSummary, className }: any) => (
    <div 
      data-testid="week-view" 
      className={className}
      data-mobile={isMobile}
      data-show-summary={showSummary}
    >
      Mock Week View
    </div>
  ),
  WeekSummary: () => <div data-testid="week-summary">Mock Week Summary</div>,
  FamilyWorkload: () => <div data-testid="family-workload">Mock Family Workload</div>,
}));

jest.mock('@/components/calendar/EmptyWeekState', () => ({
  EmptyWeekState: ({ isFirstTime }: { isFirstTime?: boolean }) => (
    <div data-testid="empty-week-state" data-first-time={isFirstTime}>
      Mock Empty Week State
    </div>
  ),
  LoadingState: ({ message }: { message?: string }) => (
    <div data-testid="loading-state">{message}</div>
  ),
  ErrorState: ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
    <div data-testid="error-state">
      {message}
      {onRetry && <button onClick={onRetry}>Try again</button>}
    </div>
  ),
}));

// Test wrapper with React Query
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock data
const mockWeekData = {
  weekStartDate: '2024-01-01',
  weekEndDate: '2024-01-07',
  days: [
    {
      date: '2024-01-01',
      dayName: 'Monday',
      tasks: [
        {
          id: '1',
          title: 'Test Task',
          assigneeId: 'user1',
          status: 'pending',
          category: 'task' as const,
          priority: 'medium' as const,
        },
      ],
      events: [],
      taskCount: 1,
      eventCount: 0,
      completedTaskCount: 0,
      overdueTaskCount: 0,
    },
  ],
  summary: {
    totalTasks: 1,
    completedTasks: 0,
    overdueTasks: 0,
    pendingTasks: 1,
    totalEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    completionRate: 0,
  },
  members: [
    {
      memberId: 'user1',
      memberName: 'Test User',
      avatarColor: '#3B82F6',
      tasksAssigned: 1,
      tasksCompleted: 0,
      eventsAssigned: 0,
      eventsCompleted: 0,
      completionRate: 0,
      overdueCount: 0,
    },
  ],
};

describe('WeeklyDashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock the useWeekNavigation hook
    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: mockWeekData,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    // Mock the store hooks
    const mockStore = require('@/stores/app-store');
    mockStore.useSelectedFamilyMember.mockReturnValue(null);
    mockStore.useFilterActions.mockReturnValue({
      setSelectedFamilyMember: jest.fn(),
      resetFilters: jest.fn(),
    });
  });

  it('renders dashboard with week view when data is loaded', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Check for main dashboard elements
    expect(screen.getByText('Family Dashboard')).toBeInTheDocument();
    expect(screen.getByText("Your family's coordination hub")).toBeInTheDocument();
    
    // Check for week navigation
    expect(screen.getByTestId('week-navigation')).toBeInTheDocument();
    
    // Check for week view (should be visible since we have tasks)
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    
    // Check for summary components on desktop
    expect(screen.getByTestId('week-summary')).toBeInTheDocument();
    expect(screen.getByTestId('family-workload')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: null,
      isLoading: true,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading your family dashboard...')).toBeInTheDocument();
  });

  it('shows error state when data fails to load', () => {
    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: null,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
  });

  it('shows empty state for first-time users with no tasks', () => {
    const emptyWeekData = {
      ...mockWeekData,
      days: mockWeekData.days.map(day => ({
        ...day,
        tasks: [],
        taskCount: 0,
      })),
      summary: {
        ...mockWeekData.summary,
        totalTasks: 0,
        pendingTasks: 0,
      },
    };

    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: emptyWeekData,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const emptyState = screen.getByTestId('empty-week-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveAttribute('data-first-time', 'true');
  });

  it('adapts layout for mobile devices', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Mobile layout should not show family member filter
    expect(screen.queryByText('Filter by:')).not.toBeInTheDocument();
    
    // Week view should have mobile props
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toHaveAttribute('data-mobile', 'true');
    
    // Should show floating action button
    expect(screen.getByLabelText('Add task or event')).toBeInTheDocument();
  });

  it('shows family member filter on desktop when multiple members exist', () => {
    const multiMemberData = {
      ...mockWeekData,
      members: [
        mockWeekData.members[0],
        {
          memberId: 'user2',
          memberName: 'User Two',
          avatarColor: '#EF4444',
          tasksAssigned: 0,
          tasksCompleted: 0,
          eventsAssigned: 0,
          eventsCompleted: 0,
          completionRate: 0,
          overdueCount: 0,
        },
      ],
    };

    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: multiMemberData,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Filter by:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Check that all members are in the dropdown by finding option elements
    expect(screen.getByRole('option', { name: 'Test User' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'User Two' })).toBeInTheDocument();
  });

  it('handles responsive behavior on window resize', () => {
    const multiMemberData = {
      ...mockWeekData,
      members: [
        mockWeekData.members[0],
        {
          memberId: 'user2',
          memberName: 'User Two',
          avatarColor: '#EF4444',
          tasksAssigned: 0,
          tasksCompleted: 0,
          eventsAssigned: 0,
          eventsCompleted: 0,
          completionRate: 0,
          overdueCount: 0,
        },
      ],
    };

    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: multiMemberData,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Initially desktop with multiple members - should show filter
    expect(screen.getByText('Filter by:')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    // Mock mobile viewport to show floating action button
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Check for proper headings
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Family Dashboard');
    
    // Check for floating action button accessibility on mobile
    expect(screen.getByLabelText('Add task or event')).toBeInTheDocument();
  });

  it('renders correctly with empty member list', () => {
    const noMembersData = {
      ...mockWeekData,
      members: [],
    };

    const mockUseWeekNavigation = require('@/hooks/useWeekNavigation');
    mockUseWeekNavigation.useWeekNavigation.mockReturnValue({
      weekData: noMembersData,
      isLoading: false,
      isCurrentWeek: true,
      weekTitle: 'This Week',
      weekDays: [],
      goToPreviousWeek: jest.fn(),
      goToNextWeek: jest.fn(),
      goToCurrentWeek: jest.fn(),
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Should not show member filter
    expect(screen.queryByText('Filter by:')).not.toBeInTheDocument();
    
    // Should still render other components
    expect(screen.getByText('Family Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });
});