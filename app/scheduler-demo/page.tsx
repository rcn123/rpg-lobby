'use client';

import { MeetingScheduler } from '@/components/MeetingScheduler';

export default function SchedulerDemoPage() {
  const handleSchedule = (timeSlots: any[]) => {
    console.log('Time slots created:', timeSlots);
    alert(`Created ${timeSlots.length} time slots!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Meeting Scheduler Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This is a free, reusable meeting scheduler component that can be dropped into any page. 
            Create time slots by date and time, then let participants sign up later.
          </p>
        </div>
        
        <MeetingScheduler
          defaultDuration={60}
          onSchedule={handleSchedule}
        />
      </div>
    </div>
  );
}
