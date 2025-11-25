import { NextRequest, NextResponse } from 'next/server';

// Proxy API route to handle Globalping API calls (avoids CORS issues)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.target || !body.locations) {
      return NextResponse.json(
        { error: 'Missing required fields: target and locations' },
        { status: 400 }
      );
    }

    // Call Globalping API
    const response = await fetch('https://api.globalping.io/v1/measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'ping',
        target: body.target,
        locations: Array.isArray(body.locations) ? body.locations : [body.locations],
        measurementOptions: {
          packets: 3,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Globalping API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch latency data', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Latency API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to poll for measurement results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const measurementId = searchParams.get('id');
    
    if (!measurementId) {
      return NextResponse.json(
        { error: 'Missing measurement ID' },
        { status: 400 }
      );
    }

    // Call Globalping API to get measurement results
    const response = await fetch(`https://api.globalping.io/v1/measurements/${measurementId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Globalping API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch measurement results', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Latency API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

