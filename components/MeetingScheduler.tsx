'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';

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
      {/* Default Duration Setting */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Default Duration
        </h3>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Duration for New Time Slots
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
      </div>

      {/* Add Time Slot */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Add Time Slot
        </h3>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
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
            <div className="flex items-end">
              <button
                onClick={addTimeSlot}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Time Slot
              </button>
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
          
          <div className="overflow-x-auto">
            <table className="border-collapse bg-white dark:bg-gray-800 rounded-lg shadow table-fixed" style={{ width: 'auto' }}>
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left p-3 font-semibold text-gray-900 dark:text-white w-24">
                    Date
                  </th>
                  {sortedTimeSlots.map((slot) => {
                    const dateObj = new Date(slot.date);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNumber = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                    
                    return (
                      <th key={slot.id} className="text-left p-3 font-semibold text-gray-900 dark:text-white w-32">
                        <div>
                          <div className="text-sm">{dayName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
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
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    Time Slots
                  </td>
                  {sortedTimeSlots.map((slot) => (
                    <td key={slot.id} className="p-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-xs">
                        <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {slot.startTime}-{slot.endTime}
                        </span>
                        <button
                          onClick={() => removeTimeSlot(slot.id)}
                          className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                          title="Remove time slot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
                
                {/* Placeholder for future participant rows */}
                <tr>
                  <td className="p-3 text-sm text-gray-500 dark:text-gray-400 italic">
                    Participants
                  </td>
                  {sortedTimeSlots.map((slot) => (
                    <td key={slot.id} className="p-3 text-left text-sm text-gray-400 dark:text-gray-500 italic">
                      (Coming soon)
                    </td>
                  ))}
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
