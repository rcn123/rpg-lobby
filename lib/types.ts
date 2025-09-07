/**
 * Shared TypeScript types for the application
 * Centralized type definitions for better maintainability
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string; // Optional user bio/description
  avatar?: string; // Optional profile picture URL
  location?: string; // Optional location (city, country)
  timezone?: Timezone; // User's preferred timezone
  authProvider: 'facebook' | 'google' | 'email' | 'github' | 'discord'; // How they signed up
  authProviderId?: string; // Provider-specific ID (e.g., Facebook user ID)
  createdAt: string;
  updatedAt: string;
}

// User preferred systems junction table
export interface UserPreferredSystem {
  userId: string;
  gameSystemId: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced';
  order: number; // 1 = most preferred, 2 = second most, etc.
  createdAt: string;
}

// User with populated preferred systems (for display)
export interface UserWithPreferredSystems extends User {
  preferredSystems: GameSystem[];
}

// Location types
export interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
}

export interface OnlineLocation {
  serverName?: string;
  channelName?: string;
  joinLink?: string;
  roomId?: string;
  password?: string;
}

export type LocationType = Location | OnlineLocation;

// Session types
export interface Session {
  id: string;
  title: string;
  description: string;
  gameSystem: GameSystem;
  date: string; // For published sessions, actual date. For suggested sessions, can be empty or TBD
  time: string; // For published sessions, actual time. For suggested sessions, can be empty or TBD
  duration: number; // in minutes
  endTime: string; // calculated end time
  timezone: string; // e.g., "Europe/Stockholm", "America/New_York"
  state: SessionState; // 'Published' or 'Suggested'
  sessionType: SessionType; // 'one-time' or 'recurring'
  plannedSessions?: number; // Number of planned sessions (only for recurring)
  timeSuggestions?: TimeSuggestion[]; // Only for suggested sessions
  decisionDate?: string; // When the final date/time will be decided (for suggested sessions)
  maxPlayers: number;
  currentPlayers: number;
  gmId: string;
  gm?: User; // Populated when fetching with joins
  isOnline: boolean;
  location?: LocationType;
  image?: string; // URL to session image
  characterCreation: CharacterCreation; // How characters will be handled
  players?: User[]; // Populated when fetching with joins
  waitingList?: User[]; // Users waiting to join when spots open up
  waitingListCount?: number; // Count of people in waiting list
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface CreateSessionData {
  title: string;
  description: string;
  gameSystem: GameSystem;
  date: string;
  time: string;
  duration: number; // in hours
  timezone: string;
  state: SessionState;
  sessionType: SessionType;
  plannedSessions?: number;
  timeSuggestions?: TimeSuggestion[];
  decisionDate?: string;
  maxPlayers: number;
  isOnline: boolean;
  location?: LocationType;
  image?: string;
  characterCreation: CharacterCreation;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Filter types for session browsing
export interface SessionFilters {
  gameSystem?: string;
  isOnline?: boolean;
  city?: string;
  state?: string;
}

// Game system interface
export interface GameSystem {
  id: string;
  name: string;
  description?: string;
}

// Common game systems
export const GAME_SYSTEMS: GameSystem[] = [
  { id: 'dnd-5e', name: 'D&D 5e', description: 'Dungeons & Dragons 5th Edition' },
  { id: 'pathfinder-2e', name: 'Pathfinder 2e', description: 'Pathfinder Second Edition' },
  { id: 'call-of-cthulhu', name: 'Call of Cthulhu', description: 'Horror investigation RPG' },
  { id: 'vampire-masquerade', name: 'Vampire: The Masquerade', description: 'Gothic punk vampire RPG' },
  { id: 'cyberpunk-red', name: 'Cyberpunk Red', description: 'Cyberpunk dystopian RPG' },
  { id: 'blades-in-dark', name: 'Blades in the Dark', description: 'Heist-focused fantasy RPG' },
  { id: 'monster-of-week', name: 'Monster of the Week', description: 'Supernatural investigation RPG' },
  { id: 'fate-core', name: 'FATE Core', description: 'Narrative-focused universal RPG' },
  { id: 'savage-worlds', name: 'Savage Worlds', description: 'Fast, furious, fun universal RPG' },
  { id: 'other', name: 'Other', description: 'Custom or other game system' },
];

// Common timezones
export const TIMEZONES = [
  'Europe/Stockholm',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'UTC',
] as const;

export type Timezone = typeof TIMEZONES[number];


// User roles
export const USER_ROLES = ['GM', 'Player'] as const;
export type UserRole = typeof USER_ROLES[number];

// Session states
export const SESSION_STATES = ['Published', 'Suggested'] as const;
export type SessionState = typeof SESSION_STATES[number];

// Session types
export const SESSION_TYPES = ['one-time', 'recurring'] as const;
export type SessionType = typeof SESSION_TYPES[number];

// Character creation types
export const CHARACTER_CREATION_TYPES = ['pregenerated', 'create-in-beginning', 'create-before-session'] as const;
export type CharacterCreation = typeof CHARACTER_CREATION_TYPES[number];

// Time suggestion interface
export interface TimeSuggestion {
  id: string;
  date: string;
  time: string;
  votes?: number; // For future voting feature
}



