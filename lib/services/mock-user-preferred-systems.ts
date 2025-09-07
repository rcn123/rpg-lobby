/**
 * Mock service for user preferred systems (junction table)
 * Simulates a relational database with user_preferred_systems table
 */

import type { UserPreferredSystem, GameSystem } from '@/lib/types';
import { GAME_SYSTEMS } from '@/lib/types';

// Mock data for user preferred systems
const mockUserPreferredSystems: UserPreferredSystem[] = [
  // Sarah the Storyteller (GM1)
  { userId: 'gm1', gameSystemId: 'dnd-5e', proficiency: 'advanced', order: 1, createdAt: '2024-08-01T10:00:00Z' },
  { userId: 'gm1', gameSystemId: 'pathfinder-2e', proficiency: 'intermediate', order: 2, createdAt: '2024-08-01T10:00:00Z' },
  
  // Alex (Player 1)
  { userId: 'p1', gameSystemId: 'dnd-5e', proficiency: 'intermediate', order: 1, createdAt: '2024-08-15T10:00:00Z' },
  
  // Jordan (Player 2)
  { userId: 'p2', gameSystemId: 'dnd-5e', proficiency: 'beginner', order: 1, createdAt: '2024-08-20T10:00:00Z' },
  { userId: 'p2', gameSystemId: 'call-of-cthulhu', proficiency: 'intermediate', order: 2, createdAt: '2024-08-20T10:00:00Z' },
  
  // Sam (Player 3)
  { userId: 'p3', gameSystemId: 'dnd-5e', proficiency: 'advanced', order: 1, createdAt: '2024-08-25T10:00:00Z' },
  { userId: 'p3', gameSystemId: 'pathfinder-2e', proficiency: 'intermediate', order: 2, createdAt: '2024-08-25T10:00:00Z' },
  
  // Mike the Cyberpunk GM (GM2)
  { userId: 'gm2', gameSystemId: 'cyberpunk-red', proficiency: 'advanced', order: 1, createdAt: '2024-08-03T10:00:00Z' },
  { userId: 'gm2', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', order: 2, createdAt: '2024-08-03T10:00:00Z' },
  
  // Riley (Player 4)
  { userId: 'p4', gameSystemId: 'cyberpunk-red', proficiency: 'intermediate', createdAt: '2024-08-10T10:00:00Z' },
  { userId: 'p4', gameSystemId: 'dnd-5e', proficiency: 'beginner', createdAt: '2024-08-10T10:00:00Z' },
  
  // Taylor (Player 5)
  { userId: 'p5', gameSystemId: 'cyberpunk-red', proficiency: 'advanced', createdAt: '2024-08-12T10:00:00Z' },
  { userId: 'p5', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-08-12T10:00:00Z' },
  
  // Emma the Horror GM (GM3)
  { userId: 'gm3', gameSystemId: 'call-of-cthulhu', proficiency: 'advanced', createdAt: '2024-08-05T10:00:00Z' },
  { userId: 'gm3', gameSystemId: 'vampire-masquerade', proficiency: 'advanced', createdAt: '2024-08-05T10:00:00Z' },
  
  // Chris (Player 6)
  { userId: 'p6', gameSystemId: 'call-of-cthulhu', proficiency: 'intermediate', createdAt: '2024-08-18T10:00:00Z' },
  
  // Morgan (Player 7)
  { userId: 'p7', gameSystemId: 'call-of-cthulhu', proficiency: 'beginner', createdAt: '2024-08-22T10:00:00Z' },
  { userId: 'p7', gameSystemId: 'dnd-5e', proficiency: 'intermediate', createdAt: '2024-08-22T10:00:00Z' },
  
  // Casey (Player 8)
  { userId: 'p8', gameSystemId: 'call-of-cthulhu', proficiency: 'advanced', createdAt: '2024-08-28T10:00:00Z' },
  { userId: 'p8', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-08-28T10:00:00Z' },
  
  // Jamie (Player 9)
  { userId: 'p9', gameSystemId: 'call-of-cthulhu', proficiency: 'intermediate', createdAt: '2024-09-01T10:00:00Z' },
  { userId: 'p9', gameSystemId: 'blades-in-dark', proficiency: 'beginner', createdAt: '2024-09-01T10:00:00Z' },
  
  // Alex the Pathfinder GM (GM4)
  { userId: 'gm4', gameSystemId: 'pathfinder-2e', proficiency: 'advanced', createdAt: '2024-08-08T10:00:00Z' },
  { userId: 'gm4', gameSystemId: 'dnd-5e', proficiency: 'advanced', createdAt: '2024-08-08T10:00:00Z' },
  
  // Quinn (Player 10)
  { userId: 'p10', gameSystemId: 'pathfinder-2e', proficiency: 'intermediate', createdAt: '2024-08-30T10:00:00Z' },
  
  // Robin the Vampire GM (GM5)
  { userId: 'gm5', gameSystemId: 'vampire-masquerade', proficiency: 'advanced', createdAt: '2024-08-12T10:00:00Z' },
  { userId: 'gm5', gameSystemId: 'call-of-cthulhu', proficiency: 'advanced', createdAt: '2024-08-12T10:00:00Z' },
  
  // Sage (Player 11)
  { userId: 'p11', gameSystemId: 'vampire-masquerade', proficiency: 'beginner', createdAt: '2024-09-02T10:00:00Z' },
  { userId: 'p11', gameSystemId: 'dnd-5e', proficiency: 'intermediate', createdAt: '2024-09-02T10:00:00Z' },
  
  // River (Player 12)
  { userId: 'p12', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-09-03T10:00:00Z' },
  { userId: 'p12', gameSystemId: 'call-of-cthulhu', proficiency: 'advanced', createdAt: '2024-09-03T10:00:00Z' },
  
  // Phoenix (Player 13)
  { userId: 'p13', gameSystemId: 'vampire-masquerade', proficiency: 'advanced', createdAt: '2024-09-04T10:00:00Z' },
  { userId: 'p13', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', createdAt: '2024-09-04T10:00:00Z' },
  
  // Skyler (Player 14)
  { userId: 'p14', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-09-05T10:00:00Z' },
  { userId: 'p14', gameSystemId: 'call-of-cthulhu', proficiency: 'beginner', createdAt: '2024-09-05T10:00:00Z' },
  
  // Avery (Player 15)
  { userId: 'p15', gameSystemId: 'vampire-masquerade', proficiency: 'advanced', createdAt: '2024-09-06T10:00:00Z' },
  { userId: 'p15', gameSystemId: 'pathfinder-2e', proficiency: 'intermediate', createdAt: '2024-09-06T10:00:00Z' },
  
  // Cameron (Player 16)
  { userId: 'p16', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-09-07T10:00:00Z' },
  { userId: 'p16', gameSystemId: 'cyberpunk-red', proficiency: 'beginner', createdAt: '2024-09-07T10:00:00Z' },
  
  // Drew the Blades GM (GM6)
  { userId: 'gm6', gameSystemId: 'blades-in-dark', proficiency: 'advanced', createdAt: '2024-08-15T10:00:00Z' },
  { userId: 'gm6', gameSystemId: 'cyberpunk-red', proficiency: 'advanced', createdAt: '2024-08-15T10:00:00Z' },
  
  // And more players for Blades in the Dark...
  { userId: 'p17', gameSystemId: 'blades-in-dark', proficiency: 'beginner', createdAt: '2024-09-08T10:00:00Z' },
  { userId: 'p17', gameSystemId: 'dnd-5e', proficiency: 'intermediate', createdAt: '2024-09-08T10:00:00Z' },
  
  { userId: 'p18', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', createdAt: '2024-09-09T10:00:00Z' },
  { userId: 'p18', gameSystemId: 'cyberpunk-red', proficiency: 'advanced', createdAt: '2024-09-09T10:00:00Z' },
  
  { userId: 'p19', gameSystemId: 'blades-in-dark', proficiency: 'advanced', createdAt: '2024-09-10T10:00:00Z' },
  { userId: 'p19', gameSystemId: 'vampire-masquerade', proficiency: 'intermediate', createdAt: '2024-09-10T10:00:00Z' },
  
  { userId: 'p20', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', createdAt: '2024-09-11T10:00:00Z' },
  { userId: 'p20', gameSystemId: 'call-of-cthulhu', proficiency: 'beginner', createdAt: '2024-09-11T10:00:00Z' },
  
  { userId: 'p21', gameSystemId: 'blades-in-dark', proficiency: 'advanced', createdAt: '2024-09-12T10:00:00Z' },
  { userId: 'p21', gameSystemId: 'pathfinder-2e', proficiency: 'intermediate', createdAt: '2024-09-12T10:00:00Z' },
  
  { userId: 'p22', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', createdAt: '2024-09-13T10:00:00Z' },
  { userId: 'p22', gameSystemId: 'cyberpunk-red', proficiency: 'beginner', createdAt: '2024-09-13T10:00:00Z' },
  
  // Pat the Monster GM (GM7)
  { userId: 'gm7', gameSystemId: 'monster-of-week', proficiency: 'advanced', createdAt: '2024-08-20T10:00:00Z' },
  { userId: 'gm7', gameSystemId: 'call-of-cthulhu', proficiency: 'advanced', createdAt: '2024-08-20T10:00:00Z' },
  
  // And more players for Monster of the Week...
  { userId: 'p23', gameSystemId: 'monster-of-week', proficiency: 'beginner', createdAt: '2024-09-14T10:00:00Z' },
  
  { userId: 'p24', gameSystemId: 'monster-of-week', proficiency: 'intermediate', createdAt: '2024-09-15T10:00:00Z' },
  { userId: 'p24', gameSystemId: 'dnd-5e', proficiency: 'advanced', createdAt: '2024-09-15T10:00:00Z' },
  
  // Terry the FATE GM (GM8)
  { userId: 'gm8', gameSystemId: 'fate-core', proficiency: 'advanced', createdAt: '2024-08-25T10:00:00Z' },
  { userId: 'gm8', gameSystemId: 'savage-worlds', proficiency: 'advanced', createdAt: '2024-08-25T10:00:00Z' },
  
  // And more players for FATE Core...
  { userId: 'p25', gameSystemId: 'fate-core', proficiency: 'beginner', createdAt: '2024-09-16T10:00:00Z' },
  { userId: 'p25', gameSystemId: 'dnd-5e', proficiency: 'intermediate', createdAt: '2024-09-16T10:00:00Z' },
  
  { userId: 'p26', gameSystemId: 'fate-core', proficiency: 'intermediate', createdAt: '2024-09-17T10:00:00Z' },
  { userId: 'p26', gameSystemId: 'cyberpunk-red', proficiency: 'advanced', createdAt: '2024-09-17T10:00:00Z' },
  
  { userId: 'p27', gameSystemId: 'fate-core', proficiency: 'advanced', createdAt: '2024-09-18T10:00:00Z' },
  { userId: 'p27', gameSystemId: 'blades-in-dark', proficiency: 'intermediate', createdAt: '2024-09-18T10:00:00Z' },
];

class MockUserPreferredSystemsService {
  // Get preferred systems for a user (ordered by preference)
  async getUserPreferredSystems(userId: string): Promise<GameSystem[]> {
    const userSystems = mockUserPreferredSystems
      .filter(ups => ups.userId === userId)
      .sort((a, b) => a.order - b.order) // Sort by order (1 = most preferred)
      .map(ups => {
        const gameSystem = GAME_SYSTEMS.find(gs => gs.id === ups.gameSystemId);
        return gameSystem;
      })
      .filter(Boolean) as GameSystem[];
    
    return userSystems;
  }

  // Add a preferred system for a user
  async addUserPreferredSystem(userId: string, gameSystemId: string, proficiency: 'beginner' | 'intermediate' | 'advanced' = 'intermediate', order?: number): Promise<boolean> {
    // Check if already exists
    const exists = mockUserPreferredSystems.some(ups => ups.userId === userId && ups.gameSystemId === gameSystemId);
    if (exists) {
      return false;
    }

    // If no order specified, find the next available order
    if (!order) {
      const userSystems = mockUserPreferredSystems.filter(ups => ups.userId === userId);
      order = userSystems.length > 0 ? Math.max(...userSystems.map(ups => ups.order)) + 1 : 1;
    }

    // Add new preference
    mockUserPreferredSystems.push({
      userId,
      gameSystemId,
      proficiency,
      order,
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  // Remove a preferred system for a user
  async removeUserPreferredSystem(userId: string, gameSystemId: string): Promise<boolean> {
    const index = mockUserPreferredSystems.findIndex(ups => ups.userId === userId && ups.gameSystemId === gameSystemId);
    if (index === -1) {
      return false;
    }

    mockUserPreferredSystems.splice(index, 1);
    return true;
  }

  // Get all users who prefer a specific game system
  async getUsersByPreferredSystem(gameSystemId: string): Promise<string[]> {
    return mockUserPreferredSystems
      .filter(ups => ups.gameSystemId === gameSystemId)
      .map(ups => ups.userId);
  }

  // Get user preferred system with proficiency
  async getUserPreferredSystemWithProficiency(userId: string, gameSystemId: string): Promise<UserPreferredSystem | null> {
    return mockUserPreferredSystems.find(ups => ups.userId === userId && ups.gameSystemId === gameSystemId) || null;
  }
}

export const mockUserPreferredSystemsService = new MockUserPreferredSystemsService();
