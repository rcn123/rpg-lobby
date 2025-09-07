/**
 * Environment configuration with validation
 * Centralized config management for the application
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  app: {
    url: string;
  };
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // More detailed error message
    console.error(`Missing required environment variable: ${key}`);
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getConfig(): Config {
  return {
    supabase: {
      url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      anonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      serviceRoleKey: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY', 'dummy-key-for-now'),
    },
    app: {
      url: getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    },
  };
}

export const config = getConfig();

// Validate config on import
if (typeof window === 'undefined') {
  // Server-side validation
  try {
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // Service role key is optional for now
  } catch {
    // Configuration validation failed
  }
}