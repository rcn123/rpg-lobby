
CREATE TABLE game_systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jwt_id TEXT UNIQUE NOT NULL, -- Supabase auth user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('GM', 'Player')),
  bio TEXT,
  avatar TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'Europe/Stockholm',
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('facebook', 'google', 'email', 'github', 'discord')),
  auth_provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  game_system_id TEXT REFERENCES game_systems(id),
  date DATE,
  start_time TIME,
  end_time TIME,
  max_players INTEGER NOT NULL,
  gm_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  location JSONB,
  session_type TEXT NOT NULL CHECK (session_type IN ('single', 'recurring', 'campaign')),
  planned_sessions INTEGER DEFAULT 1,
  character_creation TEXT CHECK (character_creation IN ('pregenerated', 'create_in_session', 'create_before_session')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT null,
  queue_nr INTEGER DEFAULT 0,
  UNIQUE(session_id, user_id)
);