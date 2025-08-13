import { NextRequest, NextResponse } from 'next/server';

const allowedOrigin = 'http://localhost:3000';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Frontend API: Processing Google OAuth request');
    
    const { idToken } = await request.json();

    if (!idToken) {
      console.log('Frontend API: No ID token provided');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log('Frontend API: Calling backend API...');
    
    // Call backend API
    const backendResponse = await fetch('http://localhost:8111/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    console.log('Frontend API: Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      console.log('Frontend API: Backend error:', error);
      return NextResponse.json(
        { error: error.error || 'Backend authentication failed' },
        { status: backendResponse.status, headers: corsHeaders() }
      );
    }

    const result = await backendResponse.json();
    console.log('Frontend API: Backend success, returning result');
    return NextResponse.json(result, { headers: corsHeaders() });

  } catch (error) {
    console.error('Frontend API: Google OAuth error:', error);
    console.error('Frontend API: Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
