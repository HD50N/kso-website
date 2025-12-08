import { NextResponse } from 'next/server';

// This endpoint simulates a stuck request that never completes (hangs indefinitely)
// This tests the long-loading tracking for requests that are truly stuck
export async function GET() {
  // This promise never resolves - simulating a stuck/hanging request
  await new Promise(() => {
    // Intentionally never resolves - this request will hang forever
    // The timeout in the tracker will fire after 10 seconds and mark it as long-loading
  });
  
  // This code will never be reached
  return NextResponse.json({ message: 'This will never be sent' }, { status: 200 });
}

export async function POST() {
  // This promise never resolves - simulating a stuck/hanging request
  await new Promise(() => {
    // Intentionally never resolves
  });
  
  return NextResponse.json({ message: 'This will never be sent' }, { status: 200 });
}

