import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingScheduler } from '../MeetingScheduler';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return {
    ...originalDayjs,
    default: jest.fn(() => ({
      format: jest.fn(() => '2024-01-15'),
      toDate: jest.fn(() => new Date('2024-01-15')),
    })),
  };
});

describe('MeetingScheduler', () => {
  const mockOnSchedule = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MeetingScheduler />);
    expect(screen.getByText('Default Duration')).toBeInTheDocument();
    expect(screen.getByText('Add Time Slot')).toBeInTheDocument();
  });

  it('renders with default duration of 60 minutes', () => {
    render(<MeetingScheduler />);
    const durationSelect = screen.getByDisplayValue('1 hour');
    expect(durationSelect).toBeInTheDocument();
  });

  it('renders with custom default duration', () => {
    render(<MeetingScheduler defaultDuration={120} />);
    const durationSelect = screen.getByDisplayValue('2 hours');
    expect(durationSelect).toBeInTheDocument();
  });

  it('generates time options correctly', () => {
    render(<MeetingScheduler />);
    
    // Check that time options are generated (9:00 to 21:00 in 30-minute intervals)
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    expect(startTimeSelect).toBeInTheDocument();
    
    // Check for some expected time options
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('09:30')).toBeInTheDocument();
    expect(screen.getByText('21:00')).toBeInTheDocument();
  });

  it('calculates end time correctly for 60-minute duration', () => {
    render(<MeetingScheduler defaultDuration={60} />);
    
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    fireEvent.change(startTimeSelect, { target: { value: '10:00' } });
    
    // The end time should be automatically calculated as 11:00
    const endTimeSelect = screen.getByDisplayValue('11:00');
    expect(endTimeSelect).toBeInTheDocument();
  });

  it('calculates end time correctly for 90-minute duration', () => {
    render(<MeetingScheduler defaultDuration={90} />);
    
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    fireEvent.change(startTimeSelect, { target: { value: '14:00' } });
    
    // The end time should be automatically calculated as 15:30
    const endTimeSelect = screen.getByDisplayValue('15:30');
    expect(endTimeSelect).toBeInTheDocument();
  });

  it('handles time calculation across midnight', () => {
    render(<MeetingScheduler defaultDuration={120} />);
    
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    fireEvent.change(startTimeSelect, { target: { value: '23:00' } });
    
    // The end time should be calculated as 01:00 (next day)
    const endTimeSelect = screen.getByDisplayValue('01:00');
    expect(endTimeSelect).toBeInTheDocument();
  });

  it('calls onSchedule callback when schedule button is clicked', () => {
    render(<MeetingScheduler onSchedule={mockOnSchedule} />);
    
    const scheduleButton = screen.getByText('Schedule Meeting');
    expect(scheduleButton).toBeDisabled(); // Should be disabled when no time slots
    
    // Add a time slot first
    const dateInput = screen.getByLabelText('Date');
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    const addButton = screen.getByText('Add Time Slot');
    
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(startTimeSelect, { target: { value: '10:00' } });
    fireEvent.click(addButton);
    
    // Now the schedule button should be enabled
    expect(scheduleButton).not.toBeDisabled();
    
    // Click schedule button
    fireEvent.click(scheduleButton);
    
    // Verify onSchedule was called with the time slots
    expect(mockOnSchedule).toHaveBeenCalledTimes(1);
    expect(mockOnSchedule).toHaveBeenCalledWith([
      expect.objectContaining({
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00', // 60 minutes default duration
      })
    ]);
  });

  it('does not call onSchedule when no time slots are added', () => {
    render(<MeetingScheduler onSchedule={mockOnSchedule} />);
    
    const scheduleButton = screen.getByText('Schedule Meeting');
    expect(scheduleButton).toBeDisabled();
    
    fireEvent.click(scheduleButton);
    
    expect(mockOnSchedule).not.toHaveBeenCalled();
  });

  it('allows changing default duration', () => {
    render(<MeetingScheduler />);
    
    const durationSelect = screen.getByDisplayValue('1 hour');
    fireEvent.change(durationSelect, { target: { value: '180' } });
    
    expect(screen.getByDisplayValue('3 hours')).toBeInTheDocument();
  });

  it('updates end time when start time changes with new duration', () => {
    render(<MeetingScheduler defaultDuration={60} />);
    
    // Change duration to 2 hours
    const durationSelect = screen.getByDisplayValue('1 hour');
    fireEvent.change(durationSelect, { target: { value: '120' } });
    
    // Change start time
    const startTimeSelect = screen.getByDisplayValue('Select start time');
    fireEvent.change(startTimeSelect, { target: { value: '14:00' } });
    
    // End time should be calculated with new duration (2 hours)
    const endTimeSelect = screen.getByDisplayValue('16:00');
    expect(endTimeSelect).toBeInTheDocument();
  });
});

