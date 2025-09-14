'use client';

import { GAME_SYSTEMS, CHARACTER_CREATION_TYPES, type CreateSessionData } from '@/lib/types';
import { ImagePicker } from './ImagePicker';
import { RichTextEditor } from './RichTextEditor';

interface MainInformationProps {
  formData: CreateSessionData;
  onInputChange: (field: keyof CreateSessionData, value: string | number | boolean) => void;
}

export function MainInformation({ formData, onInputChange }: MainInformationProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600 pb-2">
        Main Information
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          placeholder="e.g., The Lost Mine of Phandelver"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Game System *
        </label>
        <select
          required
          value={formData.gameSystem?.id || ''}
          onChange={(e) => {
            const selectedSystem = GAME_SYSTEMS.find(s => s.id === e.target.value);
            onInputChange('gameSystem', selectedSystem || GAME_SYSTEMS[0]);
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        >
          <option value="">Select a system</option>
          {GAME_SYSTEMS.map((system) => (
            <option key={system.id} value={system.id}>
              {system.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(content) => onInputChange('description', content)}
          placeholder="Describe your adventure, what players can expect, and any special requirements..."
          height={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Image (Optional)
        </label>
        <ImagePicker
          value={formData.image}
          onChange={(imageUrl) => onInputChange('image', imageUrl)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Add an image to make your session more attractive. Drag & drop or click to select an image (max 5MB).
        </p>
      </div>
    </div>
  );
}

interface LocationSectionProps {
  formData: CreateSessionData;
  onInputChange: (field: keyof CreateSessionData, value: string | number | boolean) => void;
  onLocationChange: (field: string, value: string) => void;
}

export function LocationSection({ formData, onInputChange, onLocationChange }: LocationSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600 pb-2">
        Location
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Type *
        </label>
        <select
          required
          value={formData.isOnline ? 'online' : 'inperson'}
          onChange={(e) => onInputChange('isOnline', e.target.value === 'online')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        >
          <option value="inperson">In-Person</option>
          <option value="online">Online</option>
        </select>
      </div>

      {formData.isOnline ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform/Server Name
            </label>
            <input
              type="text"
              value={(formData.location as any)?.serverName || ''}
              onChange={(e) => onLocationChange('serverName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Discord, Roll20, Fantasy Grounds"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Channel/Room Name
            </label>
            <input
              type="text"
              value={(formData.location as any)?.channelName || ''}
              onChange={(e) => onLocationChange('channelName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="e.g., #dnd-sessions, Room 1"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Venue Name
            </label>
            <input
              type="text"
              value={(formData.location as any)?.name || ''}
              onChange={(e) => onLocationChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="e.g., The Game Store, Community Center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              required
              value={(formData.location as any)?.city || ''}
              onChange={(e) => onLocationChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Stockholm, New York"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CharacterCreationSectionProps {
  formData: CreateSessionData;
  onInputChange: (field: keyof CreateSessionData, value: string | number | boolean) => void;
}

export function CharacterCreationSection({ formData, onInputChange }: CharacterCreationSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600 pb-2">
        Character Creation
      </h3>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
          <strong>How will characters be handled?</strong>
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
          Let participants know what to expect regarding character creation.
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300">
          <strong>Tip:</strong> For "Create before session", you can mention tools like Roll20, D&D Beyond, or other character builders in your session description.
        </p>
      </div>

      <div className="space-y-3">
        {CHARACTER_CREATION_TYPES.map((type) => (
          <div key={type} className="flex items-start">
            <input
              type="radio"
              id={type}
              name="characterCreation"
              value={type}
              checked={formData.characterCreation === type}
              onChange={(e) => onInputChange('characterCreation', e.target.value as any)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
            />
            <label htmlFor={type} className="ml-3 text-sm">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {type === 'pregenerated' && 'Pregenerated'}
                {type === 'create-in-beginning' && 'Create in the beginning of session'}
                {type === 'create-before-session' && 'Create before session'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'pregenerated' && 'Characters will be provided by the GM'}
                {type === 'create-in-beginning' && 'Players will create characters together at the start of the session'}
                {type === 'create-before-session' && 'Players should create their characters before the session begins'}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlayersSectionProps {
  formData: CreateSessionData;
  onInputChange: (field: keyof CreateSessionData, value: string | number | boolean) => void;
}

export function PlayersSection({ formData, onInputChange }: PlayersSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600 pb-2">
        Players
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Players *
        </label>
        <input
          type="number"
          required
          min="2"
          max="8"
          value={formData.maxPlayers}
          onChange={(e) => onInputChange('maxPlayers', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          How many players can join this session?
        </p>
      </div>
    </div>
  );
}

interface SchedulingSectionProps {
  formData: CreateSessionData;
  onInputChange: (field: keyof CreateSessionData, value: string | number | boolean) => void;
}

export function SchedulingSection({ formData, onInputChange }: SchedulingSectionProps) {
  // Generate time options with 30-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Calculate end time when start time changes
  const handleStartTimeChange = (startTime: string) => {
    onInputChange('time', startTime);
    
    // Auto-calculate end time (start time + 3 hours)
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      onInputChange('endTime', endTime);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-600 pb-2">
        Scheduling
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => onInputChange('date', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Time *
          </label>
          <select
            required
            value={formData.time}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Time *
          </label>
          <select
            required
            value={formData.endTime || ''}
            onChange={(e) => onInputChange('endTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
