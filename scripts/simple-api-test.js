/**
 * Dead simple API test - just hit the route and see what happens
 */

async function testAPI() {
  try {
    console.log('🚀 Testing /api/sessions...');
    
    const response = await fetch('http://localhost:3000/api/sessions');
    const data = await response.json();
    
    console.log('📡 Status:', response.status);
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    console.log('🔍 Data type:', typeof data);
    console.log('🔍 Is array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log('📊 Array length:', data.length);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testAPI();
