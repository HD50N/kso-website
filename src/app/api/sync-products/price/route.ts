import { NextResponse } from 'next/server';
import { getProductRetailPrice } from '@/lib/printful';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json(
        { error: 'Printful API key not configured' },
        { status: 400 }
      );
    }

    console.log(`Getting price for product ID: ${productId}`);
    const price = await getProductRetailPrice(parseInt(productId), process.env.PRINTFUL_API_KEY);
    console.log(`Retrieved price for product ${productId}: ${price}`);
    
    // Also log the raw product data to see what we're working with
    try {
      const { PrintfulAPI } = await import('@/lib/printful');
      const printfulApi = new PrintfulAPI(process.env.PRINTFUL_API_KEY);
      const rawProductData = await printfulApi.getProductDetails(parseInt(productId));
      console.log(`Raw product data for ${productId}:`, JSON.stringify(rawProductData, null, 2));
    } catch (error) {
      console.error('Error getting raw product data:', error);
    }

    return NextResponse.json({
      success: true,
      price: price,
    });
  } catch (error) {
    console.error('Error getting product price:', error);
    return NextResponse.json(
      { error: 'Failed to get product price' },
      { status: 500 }
    );
  }
} 