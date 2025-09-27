'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfDay, isBefore, isToday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface MeetingSchedulerProps {
  defaultDuration?: number; // in minutes
  onSchedule?: (timeSlots: TimeSlot[]) => void;
}

export function MeetingScheduler({
  defaultDuration = 60,
  onSchedule
}: MeetingSchedulerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [currentDefaultDuration, setCurrentDefaultDuration] = useState(defaultDuration);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate time options from 09:00 to 21:00 in 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  // Sort time slots chronologically (by date, then by start time)
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  // Group time slots by date and assign alternating colors
  const getColumnColors = () => {
    const uniqueDates = [...new Set(sortedTimeSlots.map(slot => slot.date))].sort();
    const dateColorMap = new Map();
    
    uniqueDates.forEach((date, index) => {
      // First time slot column should be light, then alternate
      const isLight = index % 2 === 0;
      dateColorMap.set(date, isLight ? 'light' : 'dark');
    });
    
    return dateColorMap;
  };

  const dateColorMap = getColumnColors();

  // Calendar helper functions using date-fns
  const getDaysInMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const days = [];
    const startingDayOfWeek = getDay(monthStart);
    
    // Adjust for Monday as first day of week (Sunday = 0, Monday = 1, etc.)
    // If Sunday (0), we need 6 empty cells. If Monday (1), we need 0 empty cells, etc.
    const emptyCells = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < emptyCells; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    days.push(...daysInMonth);
    
    return days;
  };

  const formatDateForInput = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const isDateSelected = (date: Date) => {
    return newSlot.date === formatDateForInput(date);
  };

  const isDateInPast = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const hasTimeSlotsOnDate = (date: Date) => {
    const dateString = formatDateForInput(date);
    return timeSlots.some(slot => slot.date === dateString);
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateInPast(date)) {
      setNewSlot(prev => ({ ...prev, date: formatDateForInput(date) }));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
    });
  };

  const addTimeSlot = () => {
    if (newSlot.date && newSlot.startTime) {
      const slot: TimeSlot = {
        id: Date.now().toString(),
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime || calculateEndTime(newSlot.startTime, currentDefaultDuration)
      };
      
      setTimeSlots(prev => [...prev, slot]);
      setNewSlot({ date: '', startTime: '', endTime: '' });
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const removeTimeSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule(timeSlots);
    }
  };


  // Generate next 7 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Add Time Slot */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Add Time Slot
        </h3>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {/* Calendar Header with Select Date label */}
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Date
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      disabled={!date}
                      className={`
                        p-2 text-sm rounded transition-colors
                        ${!date ? 'cursor-default' : 'cursor-pointer'}
                        ${date && isDateSelected(date) 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : date && isDateInPast(date)
                            ? 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : date
                              ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                              : ''
                        }
                      `}
                    >
                      <div className="relative">
                        {date ? date.getDate() : ''}
                        {date && hasTimeSlotsOnDate(date) && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Has time slots</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time Selection Section */}
            <div className="space-y-4">
              <div>
                <div className="px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                  {newSlot.date ? format(parseISO(newSlot.date), 'EEEE, MMMM d, yyyy') : '👈Select a date'}
                </div>
              </div>
              <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Duration
          </label>
          <select
            value={currentDefaultDuration}
            onChange={(e) => setCurrentDefaultDuration(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={150}>2.5 hours</option>
            <option value={180}>3 hours</option>
            <option value={240}>4 hours</option>
            <option value={300}>5 hours</option>
            <option value={360}>6 hours</option>
          </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <select
                value={newSlot.startTime}
                onChange={(e) => setNewSlot(prev => ({ 
                  ...prev, 
                  startTime: e.target.value,
                  endTime: e.target.value ? calculateEndTime(e.target.value, currentDefaultDuration) : ''
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select start time</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time (optional)
              </label>
              <select
                value={newSlot.endTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!newSlot.startTime}
              >
                <option value="">{newSlot.startTime ? "-" : "Select start time first"}</option>
                {generateTimeOptions().map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
              <div>
              <button
                onClick={addTimeSlot}
                disabled={!newSlot.date || !newSlot.startTime}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Time Slot
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Table */}
      {sortedTimeSlots.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Available Time Slots
          </h3>
          
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <table className="bg-white dark:bg-gray-800" style={{ width: 'auto' }}>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">
                    Date
                  </th>
                  {sortedTimeSlots.map((slot) => {
                    const dateObj = parseISO(slot.date);
                    const dayName = format(dateObj, 'EEE');
                    const dayNumber = format(dateObj, 'd');
                    const monthName = format(dateObj, 'MMM');
                    const columnColor = dateColorMap.get(slot.date);
                    const bgColor = columnColor === 'light' 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'bg-gray-200 dark:bg-gray-600';
                    
                    return (
                      <th key={slot.id} className={`text-center px-3 py-4 font-semibold text-gray-900 dark:text-white w-32 ${bgColor}`}>
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium">{dayName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {monthName} {dayNumber}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Time slots row */}
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-sm">
                    Time Slots
                  </td>
                  {sortedTimeSlots.map((slot) => {
                    const columnColor = dateColorMap.get(slot.date);
                    const bgColor = columnColor === 'light' 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'bg-gray-200 dark:bg-gray-600';
                    
                    return (
                      <td key={slot.id} className={`px-3 py-4 ${bgColor}`}>
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {slot.startTime}-{slot.endTime}
                        </span>
                        <button
                          onClick={() => removeTimeSlot(slot.id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition-all duration-200 group"
                          title="Remove time slot"
                        >
                              <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        </button>
                          </div>
                      </div>
                    </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSchedule}
          disabled={timeSlots.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Schedule Meeting
        </button>
      </div>
    </div>
  );
}
