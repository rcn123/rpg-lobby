import { NextRequest, NextResponse } from 'next/server';
import { mockSessionsService } from '@/lib/services/mock-sessions';
import { mockAuth } from '@/lib/services/mock-auth';
import type { CreateSessionData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'gameSystem', 'duration', 'timezone', 'state', 'sessionType', 'maxPlayers', 'isOnline', 'characterCreation'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate session type specific fields
    if (body.sessionType === 'recurring') {
      if (!body.plannedSessions || body.plannedSessions < 2) {
        return NextResponse.json(
          { error: 'Planned sessions must be at least 2 for recurring sessions' },
          { status: 400 }
        );
      }
    }

    // Validate session state specific fields
    if (body.state === 'Published') {
      if (!body.date || !body.time) {
        return NextResponse.json(
          { error: 'Date and time are required for published sessions' },
          { status: 400 }
        );
      }
    } else if (body.state === 'Suggested') {
      if (!body.timeSuggestions || body.timeSuggestions.length === 0) {
        return NextResponse.json(
          { error: 'At least one time suggestion is required for suggested sessions' },
          { status: 400 }
        );
      }
      if (!body.decisionDate) {
        return NextResponse.json(
          { error: 'Decision date is required for suggested sessions' },
          { status: 400 }
        );
      }
    }

    // Get current user (in real app, this would be from auth token)
    const currentUserResponse = await mockAuth.getCurrentUser();
    if (!currentUserResponse.data) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData: CreateSessionData = {
      title: body.title,
      description: body.description,
      gameSystem: body.gameSystem, // This should now be a GameSystem object
      date: body.date || 'TBD', // For suggested sessions, use TBD
      time: body.time || 'TBD', // For suggested sessions, use TBD
      duration: parseInt(body.duration),
      timezone: body.timezone,
      state: body.state,
      sessionType: body.sessionType,
      plannedSessions: body.plannedSessions,
      timeSuggestions: body.timeSuggestions,
      decisionDate: body.decisionDate,
      maxPlayers: parseInt(body.maxPlayers),
      isOnline: body.isOnline,
      location: body.location,
      image: body.image,
      characterCreation: body.characterCreation,
    };

    // Create the session
    const result = await mockSessionsService.createSession(sessionData, currentUserResponse.data.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: result.data, message: 'Session created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for filtering
    const filters = {
      gameSystem: searchParams.get('gameSystem') || undefined,
      isOnline: searchParams.get('isOnline') ? searchParams.get('isOnline') === 'true' : undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
    };

    const result = await mockSessionsService.getSessions(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
