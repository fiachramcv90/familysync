// WeekView Component Tests
// Story S1.1: Fix Dashboard Component Architecture

import { render, screen } from '@testing-library/react';
import { WeekView } from '@/components/calendar/WeekView';

// Mock the useWeekNavigation hook
jest.mock('@/hooks/useWeekNavigation', () => ({
  useWeekNavigation: () => ({
    weekDays: [
      { key: '2024-03-04', date: new Date('2024-03-04'), dayName: 'Monday', isToday: false },
      { key: '2024-03-05', date: new Date('2024-03-05'), dayName: 'Tuesday', isToday: true },
    ],
    weekData: {
      days: [
        { date: '2024-03-04', tasks: [], events: [] },
        { date: '2024-03-05', tasks: [], events: [] },
      ],
      summary: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0, completionRate: 0 },
      members: [],
    },
    isLoading: false,
  }),
}));

// Mock DayColumn component
jest.mock('@/components/calendar/DayColumn', () => ({
  DayColumn: ({ day, date, className }: any) => (
    <div data-testid="day-column" className={className}>
      Day Column for {date.toISOString()}
    </div>
  ),
  DayCard: ({ day, date, onClick }: any) => (
    <div data-testid="day-card" onClick={onClick}>
      Day Card for {date.toISOString()}
    </div>
  ),
}));

describe('WeekView', () => {
  it('renders without errors in desktop mode', () => {
    render(<WeekView isMobile={false} />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('renders without errors in mobile mode', () => {
    render(<WeekView isMobile={true} />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    render(<WeekView className="custom-class" />);
    expect(screen.getByTestId('week-view')).toHaveClass('custom-class');
  });

  it('shows loading state when isLoading is true', () => {
    // Override the mock for this test
    jest.doMock('@/hooks/useWeekNavigation', () => ({
      useWeekNavigation: () => ({
        weekDays: [],
        weekData: null,
        isLoading: true,
      }),
    }));
    
    const { WeekView: LoadingWeekView } = require('@/components/calendar/WeekView');
    render(<LoadingWeekView />);
    expect(screen.getByText('Loading week...')).toBeInTheDocument();
  });
});