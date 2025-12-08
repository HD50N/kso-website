import { NextResponse } from 'next/server';

// This endpoint simulates a long-loading request (>10 seconds) for testing
export async function GET() {
  // Wait for 12 seconds to ensure it exceeds the 10-second threshold
  await new Promise(resolve => setTimeout(resolve, 12000));
  
  return NextResponse.json(
    { 
      message: 'This is a test long-loading request for HumanBehavior tracking',
      duration: '12 seconds',
      note: 'This request should be marked as long-loading (>10 seconds)'
    },
    { status: 200 }
  );
}

export async function POST() {
  // Wait for 12 seconds to ensure it exceeds the 10-second threshold
  await new Promise(resolve => setTimeout(resolve, 12000));
  
  return NextResponse.json(
    { 
      message: 'This is a test long-loading request for HumanBehavior tracking',
      duration: '12 seconds',
      note: 'This request should be marked as long-loading (>10 seconds)'
    },
    { status: 200 }
  );
}

