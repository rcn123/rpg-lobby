/**
 * Session validation schemas and utilities
 * Centralized validation logic for session-related operations
 */

import { z } from 'zod';
import type { CreateSessionData, SessionFilters } from '@/lib/types';

// Base session validation schema
const baseSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  gameSystem: z.object({
    id: z.string().min(1, 'Game system ID is required'),
    name: z.string().min(1, 'Game system name is required'),
  }),
  duration: z.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration cannot exceed 8 hours'),
  timezone: z.string().min(1, 'Timezone is required'),
  state: z.enum(['Published', 'Suggested']),
  sessionType: z.enum(['one-time', 'recurring']),
  maxPlayers: z.number().min(1, 'Must allow at least 1 player').max(20, 'Cannot exceed 20 players'),
  isOnline: z.boolean(),
  characterCreation: z.enum(['pregenerated', 'create-in-beginning', 'create-before-session']),
  location: z.any().optional(),
  image: z.string().url().optional().or(z.literal('')),
});

// Published session schema (requires date/time)
const publishedSessionSchema = baseSessionSchema.extend({
  state: z.literal('Published'),
  date: z.string().min(1, 'Date is required for published sessions'),
  time: z.string().min(1, 'Time is required for published sessions'),
});

// Suggested session schema (requires time suggestions)
const suggestedSessionSchema = baseSessionSchema.extend({
  state: z.literal('Suggested'),
  date: z.literal('TBD').optional(),
  time: z.literal('TBD').optional(),
  timeSuggestions: z.array(z.object({
    id: z.string(),
    date: z.string(),
    time: z.string(),
  })).min(1, 'At least one time suggestion is required'),
  decisionDate: z.string().min(1, 'Decision date is required'),
});

// Recurring session schema
const recurringSessionSchema = baseSessionSchema.extend({
  sessionType: z.literal('recurring'),
  plannedSessions: z.number().min(2, 'Recurring sessions must have at least 2 planned sessions').max(52, 'Cannot exceed 52 sessions'),
});

// Combined session creation schema
export const createSessionSchema = z.discriminatedUnion('state', [
  publishedSessionSchema,
  suggestedSessionSchema,
]).and(
  z.discriminatedUnion('sessionType', [
    z.object({ sessionType: z.literal('one-time') }),
    recurringSessionSchema,
  ])
);

// Session filters validation
export const sessionFiltersSchema = z.object({
  gameSystem: z.string().optional(),
  isOnline: z.boolean().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Session update schema (all fields optional except id)
export const updateSessionSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(2000).optional(),
  gameSystem: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  duration: z.number().min(30).max(480).optional(),
  timezone: z.string().optional(),
  state: z.enum(['Published', 'Suggested']).optional(),
  sessionType: z.enum(['one-time', 'recurring']).optional(),
  plannedSessions: z.number().min(2).max(52).optional(),
  maxPlayers: z.number().min(1).max(20).optional(),
  isOnline: z.boolean().optional(),
  characterCreation: z.enum(['pregenerated', 'create-in-beginning', 'create-before-session']).optional(),
  location: z.any().optional(),
  image: z.string().url().optional().or(z.literal('')),
});

// Validation helper functions
export function validateCreateSession(data: unknown): { success: true; data: CreateSessionData } | { success: false; error: string } {
  try {
    const validatedData = createSessionSchema.parse(data);
    return { success: true, data: validatedData as CreateSessionData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid session data' };
  }
}

export function validateSessionFilters(data: unknown): { success: true; data: SessionFilters } | { success: false; error: string } {
  try {
    const validatedData = sessionFiltersSchema.parse(data);
    return { success: true, data: validatedData as SessionFilters };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid filter data' };
  }
}

export function validateUpdateSession(data: unknown): { success: true; data: any } | { success: false; error: string } {
  try {
    const validatedData = updateSessionSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid update data' };
  }
}
