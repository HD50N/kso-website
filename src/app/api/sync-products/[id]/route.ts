import { NextResponse } from 'next/server';
import { PrintfulAPI } from '@/lib/printful';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (!process.env.PRINTFUL_API_KEY) {
      return NextResponse.json(
        { error: 'Printful API key not configured' },
        { status: 400 }
      );
    }

    const printfulApi = new PrintfulAPI(process.env.PRINTFUL_API_KEY);
    
    console.log(`Fetching detailed product data for ID: ${productId}`);
    
    const detailedProduct = await printfulApi.getProductDetails(productId);
    
    return NextResponse.json({
      success: true,
      ...detailedProduct,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 