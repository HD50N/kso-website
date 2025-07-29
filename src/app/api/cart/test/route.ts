import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test if cart_items table exists
    const { data, error } = await supabase
      .from('cart_items')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Cart test API: Database error:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error,
        code: error.code,
        message: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cart table exists and is accessible',
      data 
    });
  } catch (error) {
    console.error('Cart test API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error 
    }, { status: 500 });
  }
} 