import { NextResponse } from 'next/server';
import { syncAllProducts } from '@/lib/printful';

export async function POST() {
  try {
    console.log('🔄 POST /api/sync-products - Starting sync...');
    
    // Check if Printful API key is configured
    if (!process.env.PRINTFUL_API_KEY) {
      console.log('❌ Printful API key not configured');
      return NextResponse.json(
        { error: 'Printful API key not configured' },
        { status: 400 }
      );
    }

    console.log('✅ Printful API key configured, starting sync...');
    
    // Sync products from Printful to Stripe
    const syncedProducts = await syncAllProducts();

    console.log(`✅ Sync completed! Synced ${syncedProducts.length} products`);
    console.log('Synced products:', syncedProducts);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedProducts.length} products`,
      products: syncedProducts,
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    return NextResponse.json(
      { error: 'Failed to sync products' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if Printful API key is configured
    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json(
        { error: 'Printful API key not configured' },
        { status: 400 }
      );
    }

    console.log('Printful API Key:', process.env.PRINTFUL_API_KEY ? 'Configured' : 'Missing');

    // Get products from Printful (without syncing to Stripe)
    const { PrintfulAPI } = await import('@/lib/printful');
    const printfulApi = new PrintfulAPI(process.env.PRINTFUL_API_KEY);
    
    console.log('Fetching products from Printful...');
    let products;
    try {
      products = await printfulApi.getProducts();
      console.log('Products fetched:', products.length);
      console.log('Products data:', JSON.stringify(products, null, 2));
    } catch (error) {
      console.error('Error in getProducts():', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error('Error fetching Printful products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 