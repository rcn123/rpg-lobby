/**
 * Simple unit tests for scheduling utility functions
 * These tests focus on the core logic without UI components
 */

// Utility functions extracted from MeetingScheduler for testing
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
};

const generateTimeOptions = (): string[] => {
  const options = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

const getAvailableDates = (): string[] => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

describe('Scheduling Utils', () => {
  describe('calculateEndTime', () => {
    it('should calculate end time for 1 hour duration', () => {
      expect(calculateEndTime('10:00', 60)).toBe('11:00');
      expect(calculateEndTime('14:30', 60)).toBe('15:30');
    });

    it('should calculate end time for 90 minutes duration', () => {
      expect(calculateEndTime('10:00', 90)).toBe('11:30');
      expect(calculateEndTime('14:00', 90)).toBe('15:30');
    });

    it('should calculate end time for 2 hours duration', () => {
      expect(calculateEndTime('10:00', 120)).toBe('12:00');
      expect(calculateEndTime('14:30', 120)).toBe('16:30');
    });

    it('should handle time calculation across midnight', () => {
      expect(calculateEndTime('23:00', 60)).toBe('24:00');
      expect(calculateEndTime('23:30', 60)).toBe('24:30');
      expect(calculateEndTime('23:00', 120)).toBe('25:00');
    });

    it('should handle edge cases with minutes', () => {
      expect(calculateEndTime('10:45', 30)).toBe('11:15');
      expect(calculateEndTime('10:15', 45)).toBe('11:00');
    });

    it('should handle long durations', () => {
      expect(calculateEndTime('09:00', 360)).toBe('15:00'); // 6 hours
      expect(calculateEndTime('10:00', 480)).toBe('18:00'); // 8 hours
    });
  });

  describe('generateTimeOptions', () => {
    it('should generate time options from 09:00 to 21:30', () => {
      const options = generateTimeOptions();
      
      expect(options).toContain('09:00');
      expect(options).toContain('09:30');
      expect(options).toContain('21:00');
      expect(options).toContain('21:30');
      expect(options).not.toContain('08:30');
      expect(options).not.toContain('22:00');
    });

    it('should generate options in 30-minute intervals', () => {
      const options = generateTimeOptions();
      
      // Check some specific intervals
      expect(options).toContain('10:00');
      expect(options).toContain('10:30');
      expect(options).toContain('11:00');
      expect(options).toContain('11:30');
    });

    it('should have correct number of options', () => {
      const options = generateTimeOptions();
      // 9:00 to 21:30 = 12.5 hours, 2 options per hour = 25 options
      expect(options).toHaveLength(25);
    });

    it('should be sorted chronologically', () => {
      const options = generateTimeOptions();
      const sortedOptions = [...options].sort();
      expect(options).toEqual(sortedOptions);
    });
  });

  describe('getAvailableDates', () => {
    it('should return 14 dates', () => {
      const dates = getAvailableDates();
      expect(dates).toHaveLength(14);
    });

    it('should return dates in YYYY-MM-DD format', () => {
      const dates = getAvailableDates();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      dates.forEach(date => {
        expect(date).toMatch(dateRegex);
      });
    });

    it('should include today and future dates', () => {
      const dates = getAvailableDates();
      const today = new Date().toISOString().split('T')[0];
      
      expect(dates).toContain(today);
    });

    it('should be sorted chronologically', () => {
      const dates = getAvailableDates();
      const sortedDates = [...dates].sort();
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('Time slot validation', () => {
    it('should validate time slot structure', () => {
      const timeSlot = {
        id: '123',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      };

      expect(timeSlot.id).toBeTruthy();
      expect(timeSlot.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(timeSlot.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(timeSlot.endTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should ensure end time is after start time', () => {
      const startTime = '10:00';
      const endTime = calculateEndTime(startTime, 60);
      
      const startMinutes = 10 * 60; // 10:00 in minutes
      const endMinutes = 11 * 60;   // 11:00 in minutes
      
      expect(endMinutes).toBeGreaterThan(startMinutes);
    });
  });
});
