// WeekNavigation Component Tests
// Story S1.1: Fix Dashboard Component Architecture

import { render, screen } from '@testing-library/react';
import { WeekNavigation } from '@/components/calendar/WeekNavigation';

// Mock the useWeekNavigation hook
jest.mock('@/hooks/useWeekNavigation', () => ({
  useWeekNavigation: () => ({
    weekTitle: 'March 4-10, 2024',
    isCurrentWeek: false,
    goToPreviousWeek: jest.fn(),
    goToNextWeek: jest.fn(),
    goToCurrentWeek: jest.fn(),
    isNavigating: false,
  }),
}));

describe('WeekNavigation', () => {
  it('renders without errors', () => {
    render(<WeekNavigation />);
    expect(screen.getByText('March 4-10, 2024')).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    render(<WeekNavigation />);
    expect(screen.getByLabelText('Previous week')).toBeInTheDocument();
    expect(screen.getByLabelText('Next week')).toBeInTheDocument();
  });

  it('shows current week button when not on current week', () => {
    render(<WeekNavigation />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<WeekNavigation className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});