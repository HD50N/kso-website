import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CartItem } from '@/types/shop';

// Helper function to get authenticated user
async function getAuthenticatedUser(request?: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
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



export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    console.log('Cart API: Auth check - user:', user?.id, 'error:', authError);
    
    if (authError) {
      console.error('Cart API: Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    
    if (!user) {
      console.log('Cart API: No user found');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Create supabase client for database operations
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch cart items for the user
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching cart items:', error);
      // Check if the table doesn't exist
      if (error.code === '42P01') {
        console.error('Cart items table does not exist. Please run the cart-schema.sql file.');
        return NextResponse.json({ error: 'Cart table not found. Please contact administrator.' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    // Transform database items to CartItem format
    const transformedItems: CartItem[] = cartItems.map((item: any) => ({
      id: item.product_id + (item.variant_id ? `-${item.variant_id}` : ''),
      name: item.product_name,
      price: item.price,
      image: item.product_image || '',
      quantity: item.quantity,
      stripe_price_id: item.stripe_price_id,
    }));

    return NextResponse.json(transformedItems);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    console.log('Cart API POST: Auth check - user:', user?.id, 'error:', authError);
    
    if (authError) {
      console.error('Cart API POST: Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    
    if (!user) {
      console.log('Cart API POST: No user found');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Create supabase client for database operations
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const { items }: { items: CartItem[] } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
    }

    // Use upsert operation instead of delete + insert to avoid race conditions
    console.log('Cart API POST: Using upsert operation for cart items');

    // Insert new cart items
    const cartItemsToInsert = items.map(item => {
      // Parse product_id and variant_id from the combined id
      const parts = item.id.split('-');
      const productId = parts[0];
      const variantId = parts.length > 1 ? parts.slice(1).join('-') : null;

      return {
        user_id: user.id,
        product_id: productId,
        product_name: item.name,
        product_image: item.image,
        price: item.price,
        quantity: item.quantity,
        stripe_price_id: item.stripe_price_id,
        variant_id: variantId,
      };
    });

    console.log('Cart API POST: Attempting to insert cart items:', cartItemsToInsert);
    console.log('Cart API POST: User ID for insert:', user.id);

    if (cartItemsToInsert.length > 0) {
      // Use upsert to handle duplicates gracefully
      const { data: insertData, error: insertError } = await supabase
        .from('cart_items')
        .upsert(cartItemsToInsert, { 
          onConflict: 'user_id,product_id,variant_id',
          ignoreDuplicates: false 
        })
        .select();

      if (insertError) {
        console.error('Cart API POST: Error inserting cart items:', insertError);
        console.error('Cart API POST: Error code:', insertError.code);
        console.error('Cart API POST: Error message:', insertError.message);
        console.error('Cart API POST: Error details:', insertError.details);
        
        // Check if the table doesn't exist
        if (insertError.code === '42P01') {
          console.error('Cart API POST: Cart items table does not exist. Please run the cart-schema.sql file.');
          return NextResponse.json({ 
            error: 'Cart table not found. Please contact administrator.',
            details: insertError 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          error: 'Failed to save cart',
          details: insertError 
        }, { status: 500 });
      }
      
      console.log('Cart API POST: Successfully inserted cart items:', insertData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser(request);
    
    console.log('Cart API DELETE: Auth check - user:', user?.id, 'error:', authError);
    
    if (authError) {
      console.error('Cart API DELETE: Auth error:', authError);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    
    if (!user) {
      console.log('Cart API DELETE: No user found');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Create supabase client for database operations
    const supabase = createRouteHandlerClient({ cookies });

    // Clear all cart items for the user
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Cart API DELETE: Error clearing cart:', error);
      // Check if the table doesn't exist
      if (error.code === '42P01') {
        console.error('Cart API DELETE: Cart items table does not exist. Please run the cart-schema.sql file.');
        return NextResponse.json({ error: 'Cart table not found. Please contact administrator.' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 