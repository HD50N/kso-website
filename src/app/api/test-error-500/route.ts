import { NextResponse } from 'next/server';

// This endpoint always returns a 500 error for testing
export async function GET() {
  return NextResponse.json(
    { error: 'This is a test 500 error for HumanBehavior tracking' },
    { status: 500 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'This is a test 500 error for HumanBehavior tracking' },
    { status: 500 }
  );
}

