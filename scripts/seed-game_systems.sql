-- Database Seeding Script for RPG Lobby
-- Simple seed data to get started

-- Clear existing data (in correct order due to foreign key constraints)
 
DELETE FROM game_systems;

-- Insert Game Systems
INSERT INTO game_systems (id, name, description, created_at) VALUES
('dnd-5e', 'D&D 5e', 'Dungeons & Dragons 5th Edition', NOW()),
('pathfinder-2e', 'Pathfinder 2e', 'Pathfinder Second Edition', NOW()),
('call-of-cthulhu', 'Call of Cthulhu', 'Horror investigation RPG', NOW()),
('vampire-masquerade', 'Vampire: The Masquerade', 'Gothic punk vampire RPG', NOW()),
('cyberpunk-red', 'Cyberpunk Red', 'Cyberpunk dystopian RPG', NOW()),
('blades-in-dark', 'Blades in the Dark', 'Heist-focused fantasy RPG', NOW()),
('monster-of-week', 'Monster of the Week', 'Supernatural investigation RPG', NOW()),
('fate-core', 'FATE Core', 'Narrative-focused universal RPG', NOW()),
('savage-worlds', 'Savage Worlds', 'Fast, furious, fun universal RPG', NOW()),
('other', 'Other', 'Custom or other game system', NOW());
 