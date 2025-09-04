// TaskTypeSelector Component Tests
// Story 2.1: Task Creation and Basic Management

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskTypeSelector } from '@/components/task/TaskTypeSelector';

describe('TaskTypeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both task and event options', () => {
    render(
      <TaskTypeSelector value="task" onChange={mockOnChange} />
    );

    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Something to be done')).toBeInTheDocument();
    expect(screen.getByText('Something scheduled')).toBeInTheDocument();
  });

  it('shows task as selected by default', () => {
    render(
      <TaskTypeSelector value="task" onChange={mockOnChange} />
    );

    const taskButton = screen.getByRole('radio', { name: /Task/ });
    expect(taskButton).toHaveAttribute('aria-checked', 'true');

    const eventButton = screen.getByRole('radio', { name: /Event/ });
    expect(eventButton).toHaveAttribute('aria-checked', 'false');
  });

  it('shows event as selected when value is event', () => {
    render(
      <TaskTypeSelector value="event" onChange={mockOnChange} />
    );

    const taskButton = screen.getByRole('radio', { name: /Task/ });
    expect(taskButton).toHaveAttribute('aria-checked', 'false');

    const eventButton = screen.getByRole('radio', { name: /Event/ });
    expect(eventButton).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when task is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskTypeSelector value="event" onChange={mockOnChange} />
    );

    const taskButton = screen.getByRole('radio', { name: /Task/ });
    await user.click(taskButton);

    expect(mockOnChange).toHaveBeenCalledWith('task');
  });

  it('calls onChange when event is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskTypeSelector value="task" onChange={mockOnChange} />
    );

    const eventButton = screen.getByRole('radio', { name: /Event/ });
    await user.click(eventButton);

    expect(mockOnChange).toHaveBeenCalledWith('event');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TaskTypeSelector value="task" onChange={mockOnChange} />
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', 'Task type selection');

    const taskButton = screen.getByRole('radio', { name: /Task/ });
    const eventButton = screen.getByRole('radio', { name: /Event/ });

    expect(taskButton).toHaveAttribute('aria-checked', 'true');
    expect(eventButton).toHaveAttribute('aria-checked', 'false');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <TaskTypeSelector value="task" onChange={mockOnChange} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has touch-friendly minimum size', () => {
    render(
      <TaskTypeSelector value="task" onChange={mockOnChange} />
    );

    const taskButton = screen.getByRole('radio', { name: /Task/ });
    const eventButton = screen.getByRole('radio', { name: /Event/ });

    // Check for minimum height class (min-h-[44px])
    expect(taskButton).toHaveClass('min-h-[44px]');
    expect(eventButton).toHaveClass('min-h-[44px]');
  });
});