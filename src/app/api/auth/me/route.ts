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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Call backend API
    const backendResponse = await fetch('https://writer-home-backend.vercel.app/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
      mode: 'cors',
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json();
      return NextResponse.json(
        { error: error.error || 'Backend request failed' },
        { status: backendResponse.status, headers: corsHeaders() }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result, { headers: corsHeaders() });

  } catch (error) {
    console.error('Get guest info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
