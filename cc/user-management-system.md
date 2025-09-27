# User Management System Documentation

## Overview

The RPG Lobby application implements a unified user management system with persistent user switching capabilities for development purposes. The system follows a single source of truth principle with the database as the authoritative source for all user data.

## Architecture

### Core Principle: Database as Single Source of Truth

All user data flows through API endpoints that query the database. No client-side storage or direct Supabase session metadata usage for user information.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   API Layer     │    │   Database      │
│                 │    │                 │    │                 │
│ AuthContext     │───▶│ /api/user/me    │───▶│ users table     │
│ UserSwitcher    │    │ /api/user/switch│    │ (with act_as)   │
│ Components      │    │ /api/users/all  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## User Switching Feature

### Purpose
Allows developers to impersonate different users for testing without logging out/in repeatedly.

### Implementation
- **Database Column**: `act_as` (UUID, nullable, references users.id)
- **Persistence**: User switching survives page reloads and browser sessions
- **UI Component**: UserSwitcher dropdown next to user avatar

### How It Works

1. **User Switch Process**:
   ```typescript
   // User selects different user from dropdown
   POST /api/user/switch { targetUserId: "user-uuid" }

   // API updates database
   UPDATE users SET act_as = 'user-uuid' WHERE id = 'current-user-id'

   // Client refreshes user data
   GET /api/user/me → returns impersonated user
   ```

2. **Effective User Resolution**:
   ```typescript
   // Server-side logic in UsersService.getEffectiveUser()
   const user = getUserById(originalUserId)
   if (user.act_as) {
     return getUserById(user.act_as)  // Return impersonated user
   }
   return user  // Return original user
   ```

## Components

### 1. AuthContext (`lib/auth-context.tsx`)
**Role**: Primary user state management on client-side

**Key Features**:
- Fetches user data from `/api/user/me` endpoint
- Handles user switching via `switchUser()` method
- Provides `refreshUser()` for manual state refresh
- Includes proper loading and error states

**Important**: Never builds user objects from Supabase session metadata directly.

### 2. AuthWrapper (`lib/auth-wrapper.ts`)
**Role**: Abstraction layer over Supabase authentication

**Purpose**:
- Centralizes all Supabase auth calls
- Enables easy replacement of auth provider in the future
- Simple interface for common auth operations

**Methods**:
```typescript
authWrapper.getSession()
authWrapper.signOut()
authWrapper.onAuthStateChange()
authWrapper.signInWithOAuth()
```

### 3. UserSwitcher (`components/UserSwitcher.tsx`)
**Role**: UI component for user impersonation

**Features**:
- Dropdown showing all available users
- Highlights current effective user
- Secure API calls with proper authentication

### 4. SafeHTML (`components/SafeHTML.tsx`)
**Role**: Secure HTML rendering for user-generated content

**Security Features**:
- DOMPurify sanitization
- Allowlist of safe HTML tags
- Protection against XSS attacks
- SSR-compatible

## API Endpoints

### GET /api/user/me
**Purpose**: Get current effective user (respects act_as column)

**Process**:
1. Validate JWT token with Supabase
2. Get database user by JWT ID (`getUserByJwtId()`)
3. If user doesn't exist, create them automatically
4. Get effective user (`getEffectiveUser()`)
5. Return effective user data

**Auto-Creation**: New users are automatically created in database on first login.

### POST /api/user/switch
**Purpose**: Switch to impersonate another user

**Body**: `{ targetUserId: string }`

**Process**:
1. Validate JWT token
2. Update `act_as` column in database
3. Return new effective user

### DELETE /api/user/switch
**Purpose**: Clear user impersonation (return to original user)

**Process**:
1. Validate JWT token
2. Set `act_as` to null
3. Return original user

### GET /api/users/all
**Purpose**: Get all users for UserSwitcher dropdown

**Security**: Requires valid JWT token

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jwt_id TEXT UNIQUE NOT NULL,        -- Supabase auth user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('GM', 'Player')),
  bio TEXT,
  avatar TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'Europe/Stockholm',
  auth_provider TEXT NOT NULL,
  auth_provider_id TEXT,
  act_as UUID REFERENCES users(id),   -- For user impersonation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_users_act_as ON users(act_as);
```

### Key Fields
- **jwt_id**: Links to Supabase auth user
- **act_as**: Points to user being impersonated (nullable)
- **role**: Required field, defaults to 'Player'

## Data Flow

### 1. User Login Flow
```
User logs in with Facebook
       ↓
Supabase generates JWT token
       ↓
AuthContext calls /api/user/me
       ↓
API validates JWT and gets/creates user
       ↓
API returns effective user data
       ↓
Client displays logged-in state
```

### 2. User Switch Flow
```
User selects from UserSwitcher dropdown
       ↓
Call /api/user/switch with target user ID
       ↓
API updates act_as column in database
       ↓
AuthContext refreshes user data
       ↓
UI updates to show switched user
```

### 3. Page Reload Flow
```
App initializes
       ↓
AuthContext calls /api/user/me
       ↓
API checks JWT and act_as column
       ↓
Returns effective user (persisted state)
       ↓
UI shows correct switched user
```

## Security Considerations

### 1. Authentication
- All API endpoints require valid JWT tokens
- Server validates tokens with Supabase admin client
- No client-side user ID manipulation

### 2. Authorization
- User switching only available to authenticated users
- Could be restricted by role in the future

### 3. HTML Sanitization
- All user-generated HTML content sanitized with DOMPurify
- Prevents XSS attacks while preserving formatting
- SSR-safe implementation

### 4. Data Validation
- Database constraints enforce data integrity
- Required fields validated on user creation
- Type safety with TypeScript interfaces

## Error Handling

### 1. AuthContext
- Graceful degradation when API calls fail
- Fallback to session metadata if needed
- Proper loading and error states

### 2. API Endpoints
- Structured error responses
- Appropriate HTTP status codes
- Detailed logging for debugging

### 3. User Creation
- Automatic retry on failures
- Default values for optional fields
- Handles edge cases (missing metadata)

## Development Features

### 1. Console Logging
Extensive logging for debugging:
- Auth state changes
- API call results
- User switching events
- Database operations

### 2. Type Safety
- Full TypeScript coverage
- Strict database schema types
- Runtime validation where needed

### 3. Testability
- Modular component design
- Clear separation of concerns
- Mockable dependencies

## Migration Path

The current system is designed to be easily replaceable:

1. **Auth Provider**: Change `authWrapper` implementation
2. **Database**: Update `UsersService` methods
3. **API Structure**: Modify endpoints while keeping interfaces

## Best Practices

### 1. Always Use API Endpoints
- Never read user data directly from Supabase on client
- Always go through `/api/user/me` for user information
- Maintain consistency between client and server

### 2. Handle Loading States
- Show loading indicators during user operations
- Graceful error handling with user feedback
- Prevent multiple simultaneous operations

### 3. Security First
- Sanitize all user-generated content
- Validate all inputs server-side
- Use proper authentication for all operations

## Future Enhancements

### 1. Role-Based Permissions
- Restrict user switching to admin roles
- Audit logging for user switches
- Time-limited impersonation sessions

### 2. Enhanced UI
- Visual indicator when impersonating
- Quick switch between recent users
- Impersonation history

### 3. Advanced Features
- Multiple simultaneous impersonations
- Organization-based user switching
- Integration with external identity providers

## Troubleshooting

### Common Issues

1. **"Sign In" button still shows after login**
   - Check if user exists in database
   - Verify `/api/user/me` endpoint is working
   - Check browser console for API errors

2. **User switching doesn't persist**
   - Verify `act_as` column exists in database
   - Check if `getEffectiveUser()` is implemented
   - Ensure AuthContext uses API instead of session metadata

3. **UserSwitcher dropdown empty**
   - Check `/api/users/all` endpoint
   - Verify authentication headers are sent
   - Ensure users exist in database

### Debug Steps

1. Check browser console for auth logs
2. Verify API endpoints return expected data
3. Check database for `act_as` values
4. Validate JWT tokens are being sent correctly

This system provides a robust, secure, and maintainable approach to user management with development-friendly features while maintaining production security standards.