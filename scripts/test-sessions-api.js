/**
 * Unit test to query sessions from the API route
 * Run with: node scripts/test-sessions-api.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('⚠️ Could not load .env.local file');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSessionsAPI() {
  console.log('🧪 Testing Sessions API Route Logic...\n');

  try {
    // Test 1: Check if sessions table exists and has data
    console.log('📋 Test 1: Check sessions table');
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*');
    
    if (sessionsError) {
      console.error('❌ Sessions table error:', sessionsError.message);
      return;
    }
    
    console.log(`✅ Sessions table accessible: ${sessionsData?.length || 0} sessions found`);
    if (sessionsData && sessionsData.length > 0) {
      console.log('📄 First session:', JSON.stringify(sessionsData[0], null, 2));
    }

    // Test 2: Check if game_systems table exists and has data
    console.log('\n📋 Test 2: Check game_systems table');
    const { data: gameSystemsData, error: gameSystemsError } = await supabase
      .from('game_systems')
      .select('*');
    
    if (gameSystemsError) {
      console.error('❌ Game systems table error:', gameSystemsError.message);
      return;
    }
    
    console.log(`✅ Game systems table accessible: ${gameSystemsData?.length || 0} game systems found`);
    if (gameSystemsData && gameSystemsData.length > 0) {
      console.log('🎮 Available game systems:', gameSystemsData.map(gs => gs.id).join(', '));
    }

    // Test 3: Simulate the sessions service logic
    console.log('\n📋 Test 3: Simulate sessions service getSessions()');
    
    if (!sessionsData || sessionsData.length === 0) {
      console.log('⚠️ No sessions to process');
      return;
    }

    // Transform the data like the service does
    const GAME_SYSTEMS = [
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

    const transformedSessions = sessionsData.map(row => {
      // Find game system
      const gameSystem = GAME_SYSTEMS.find(gs => gs.id === row.game_system_id) || 
                        { id: row.game_system_id, name: 'Unknown System' };
      
      // Create minimal GM object
      const gm = {
        id: row.gm_user_id,
        email: 'unknown@example.com',
        name: 'Unknown GM',
        avatar: null,
        location: null,
        timezone: 'Europe/Stockholm',
        authProvider: 'email',
        authProviderId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Transform to Session format
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        gameSystem,
        date: row.date || 'TBD',
        time: row.start_time || 'TBD',
        duration: row.start_time && row.end_time ? 
          Math.round((new Date(`2000-01-01T${row.end_time}`).getTime() - new Date(`2000-01-01T${row.start_time}`).getTime()) / (1000 * 60)) : 0,
        endTime: row.end_time || 'TBD',
        timezone: 'Europe/Stockholm',
        state: row.date ? 'Published' : 'Suggested',
        sessionType: row.session_type === 'single' ? 'one-time' : 'recurring',
        plannedSessions: row.planned_sessions || 1,
        maxPlayers: row.max_players,
        currentPlayers: 0, // Simplified
        gmId: row.gm_user_id,
        gm,
        isOnline: row.is_online,
        location: row.location,
        image: row.image_url,
        players: [], // Simplified
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    console.log(`✅ Successfully transformed ${transformedSessions.length} sessions`);
    console.log('📄 First transformed session:', JSON.stringify(transformedSessions[0], null, 2));

    // Test 4: Test what the API route would return
    console.log('\n📋 Test 4: API Route Response Simulation');
    const apiResponse = {
      success: true,
      data: transformedSessions,
      error: null
    };
    
    console.log('🔗 What API route returns:', JSON.stringify(apiResponse, null, 2));
    console.log('📊 Response data type:', typeof apiResponse.data);
    console.log('📊 Is array:', Array.isArray(apiResponse.data));
    console.log('📊 Array length:', apiResponse.data.length);

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testSessionsAPI().then(() => {
  console.log('\n🎉 Sessions API test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
