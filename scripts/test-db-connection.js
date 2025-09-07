/**
 * Simple script to test database connection
 * Run with: node scripts/test-db-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('game_systems')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful!');
    console.log('📊 Game systems table accessible');
    
    // Test users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');
    
    // Test sessions table
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Sessions table error:', sessionsError.message);
      return false;
    }

    console.log('✅ Sessions table accessible');
    
    // Test session_participants table
    const { data: participantsData, error: participantsError } = await supabase
      .from('session_participants')
      .select('id')
      .limit(1);

    if (participantsError) {
      console.error('❌ Session participants table error:', participantsError.message);
      return false;
    }

    console.log('✅ Session participants table accessible');
    
    console.log('\n🎉 All database tables are accessible!');
    console.log('Your Supabase setup is working correctly.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
