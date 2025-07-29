import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { formatPriceForStripe } from '@/lib/stripe';
import { CartItem } from '@/types/shop';

export async function POST(request: Request) {
  try {
    const { items, customerEmail }: { items: CartItem[]; customerEmail: string } = await request.json();

    // Validate input
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Transform cart items to Stripe line items
    const lineItems = items.map((item) => {
      // If item has a stripe_price_id, use it directly (for variants)
      // This will use the existing Stripe product name, avoiding duplication
      if (item.stripe_price_id) {
        return {
          price: item.stripe_price_id,
          quantity: item.quantity,
        };
      }
      
      // Otherwise, create a custom price (fallback for non-variant products)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: formatPriceForStripe(item.price),
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://ksouchicago.com/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://ksouchicago.com/shop`,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Add more countries as needed
      },
      customer_creation: 'always', // Creates customer for future orders
      phone_number_collection: {
        enabled: true, // Collect phone number for shipping
      },
      metadata: {
        items: JSON.stringify(items.map(item => ({ 
          id: item.id, 
          quantity: item.quantity,
          stripe_price_id: item.stripe_price_id
        }))),
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 