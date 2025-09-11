/**
 * Script to check database status and tables
 * Run with: node scripts/check-db-status.js
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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file has:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 Checking database status...');
console.log('🌐 Supabase URL:', supabaseUrl);
console.log('🔑 Anon key available:', !!supabaseAnonKey);
console.log('🔑 Service role key available:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function checkTables() {
  const tables = ['game_systems', 'users', 'sessions', 'session_participants'];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Checking table: ${table}`);
      
      // Try with anon key first
      const { data: anonData, error: anonError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (anonError) {
        console.log(`❌ Anon key access failed: ${anonError.message}`);
        
        // Try with admin key if available
        if (supabaseServiceKey) {
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);
          
          if (adminError) {
            console.log(`❌ Admin key access failed: ${adminError.message}`);
          } else {
            console.log(`✅ Admin key access successful: ${adminData?.length || 0} rows`);
          }
        }
      } else {
        console.log(`✅ Anon key access successful: ${anonData?.length || 0} rows`);
      }
    } catch (error) {
      console.log(`💥 Error checking table ${table}:`, error.message);
    }
  }
}

checkTables().then(() => {
  console.log('\n🎉 Database check complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Database check failed:', error);
  process.exit(1);
});
