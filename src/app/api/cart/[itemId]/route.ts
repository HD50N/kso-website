import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to get authenticated user
async function getAuthenticatedUser(request?: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // If we can't get user from session, try to get from header (fallback)
  if (!user && request) {
    const userId = request.headers.get('X-User-ID');
    if (userId) {
      console.log('Cart API: Using user ID from header as fallback:', userId);
      return { user: { id: userId }, error: null };
    }
  }
  
  return { user, error };
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    const params = await context.params;
    
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    console.log('Cart API DELETE item: Auth check - user:', user?.id, 'error:', authError);
    
    if (authError) {
      console.error('Cart API DELETE item: Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    
    if (!user) {
      console.log('Cart API DELETE item: No user found');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const itemId = params.itemId;
    console.log('Cart API DELETE item: Deleting item:', itemId, 'for user:', user.id);

    // Create supabase client for database operations
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) });

    // Parse the item ID to get product_id and variant_id
    const parts = itemId.split('-');
    const productId = parts[0];
    const variantId = parts.length > 1 ? parts.slice(1).join('-') : null;

    // Delete the specific cart item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('variant_id', variantId);

    if (error) {
      console.error('Cart API DELETE item: Error deleting cart item:', error);
      return NextResponse.json({ 
        error: 'Failed to delete cart item',
        details: error 
      }, { status: 500 });
    }

    console.log('Cart API DELETE item: Successfully deleted item:', itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart API DELETE item: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
} 