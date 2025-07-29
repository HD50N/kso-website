import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createPrintfulOrder } from '@/lib/printful';
import { createOrder, updateOrderStatus } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
  
  console.log('Received webhook event:', event.type);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      console.log('Processing completed checkout session:', session.id);
      
      // Extract order details from session metadata
      const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerPhone = session.customer_details?.phone;
      const shippingAddress = session.customer_details?.address;
      
      // Get line items from session to map to Printful products
      const lineItems = session.line_items?.data || [];
      
      if (!customerEmail || !items.length) {
        console.error('Missing required order information:', { customerEmail, items });
        return NextResponse.json({ error: 'Missing required order information' }, { status: 400 });
      }
      
      // Map items to Printful using the stripe_price_id to get the correct variant
      const printfulItems = await Promise.all(items.map(async (item: any) => {
        if (!item.stripe_price_id) {
          console.warn(`No stripe_price_id found for item ${item.id}`);
          return null;
        }
        
        try {
          // Get the price to find the product
          const price = await stripe.prices.retrieve(item.stripe_price_id);
          const product = await stripe.products.retrieve(price.product as string);
          
          // Use the printful_variant_id from the product metadata
          const printfulVariantId = product.metadata.printful_variant_id;
          
          if (!printfulVariantId) {
            console.warn(`No printful_variant_id found for product ${product.id}`);
            return null;
          }
          
          return {
            id: printfulVariantId,
            quantity: item.quantity || 1
          };
        } catch (error) {
          console.error(`Error getting product info for item ${item.id}:`, error);
          return null;
        }
      }));
      
      // Filter out items without Printful mapping
      const validPrintfulItems = printfulItems.filter((item: any) => item !== null);
      
      if (validPrintfulItems.length === 0) {
        console.error('No valid Printful items found for order');
        return NextResponse.json({ error: 'No valid Printful items found' }, { status: 400 });
      }
      
      // Create order in Printful
      const printfulOrder = await createPrintfulOrder({
        recipient: {
          name: customerName || 'Customer',
          email: customerEmail,
          phone: customerPhone || '',
          address1: shippingAddress?.line1 || '',
          address2: shippingAddress?.line2 || '',
          city: shippingAddress?.city || '',
          state_code: shippingAddress?.state || '',
          country_code: shippingAddress?.country || 'US',
          zip: shippingAddress?.postal_code || '',
        },
        items: validPrintfulItems,
        external_id: session.id, // Use Stripe session ID as external reference
      });
      
      console.log('Printful order created successfully:', printfulOrder.id);
      
      // Store order in database for tracking
      try {
        const order = await createOrder({
          stripe_session_id: session.id,
          customer_email: customerEmail,
          customer_name: customerName || undefined,
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          shipping_address: shippingAddress,
          items: items
        });
        
        // Update order with Printful order ID
        await updateOrderStatus(order.id, 'processing', printfulOrder.id);
        
        console.log('Order stored in database:', order.id);
      } catch (dbError) {
        console.error('Error storing order in database:', dbError);
        // Don't fail the webhook if database storage fails
      }
      
    } catch (error) {
      console.error('Error processing checkout session:', error);
      // Don't return error to Stripe - we'll handle this separately
      // but we should log it for monitoring
    }
  }
  
  return NextResponse.json({ received: true });
} 