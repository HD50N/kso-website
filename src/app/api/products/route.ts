import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Product, ProductVariant } from '@/types/shop';

export async function GET() {
  try {
    // Fetch products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Group products by base product name (remove variant suffix)
    const productGroups = new Map<string, {
      baseProduct: any;
      variants: any[];
    }>();

    products.data.forEach((product) => {
      const productName = product.name;
      const baseName = productName.includes(' - ') 
        ? productName.split(' - ')[0] 
        : productName;
      
      if (!productGroups.has(baseName)) {
        productGroups.set(baseName, {
          baseProduct: product,
          variants: []
        });
      }
      
      const group = productGroups.get(baseName)!;
      group.variants.push(product);
    });

    // Transform grouped products to our Product interface
    const transformedProducts: Product[] = Array.from(productGroups.values()).map((group) => {
      const baseProduct = group.baseProduct;
      const variants = group.variants;
      
      // Use the first variant for base product info
      const firstVariant = variants[0];
      const basePrice = firstVariant.default_price 
        ? (firstVariant.default_price as any).unit_amount / 100 
        : 0;

      // Create variant objects with color and size extraction
      const productVariants: ProductVariant[] = variants.map((variant) => {
        const variantName = variant.name.includes(' - ') ? 
          variant.name.split(' - ')[1] : 
          'Default';
        
        // Extract color and size from variant name
        let color = 'Default';
        let size = 'Default';
        
        if (variantName.includes(' / ')) {
          const parts = variantName.split(' / ');
          color = parts[0] || 'Default';
          size = parts[1] || 'Default';
        } else {
          color = variantName;
        }
        
        return {
          id: variant.id,
          name: `${color} / ${size}`,
          color: color,
          size: size,
          price: variant.default_price 
            ? (variant.default_price as any).unit_amount / 100 
            : 0,
          stripe_product_id: variant.id,
          stripe_price_id: variant.default_price ? (variant.default_price as any).id : '',
          printful_variant_id: variant.metadata.printful_variant_id || '',
          is_available: true
        };
      });

      return {
        id: baseProduct.id, // Use base product ID
        name: baseProduct.name.includes(' - ') 
          ? baseProduct.name.split(' - ')[0] 
          : baseProduct.name,
        description: 'KSO ' + (baseProduct.name.includes(' - ') 
          ? baseProduct.name.split(' - ')[0] 
          : baseProduct.name),
        price: basePrice, // Use first variant price as base price
        image: baseProduct.images[0] || '/placeholder-product.jpg',
        category: baseProduct.metadata.category || '',
        stripe_product_id: baseProduct.id,
        stripe_price_id: firstVariant.default_price ? (firstVariant.default_price as any).id : '',
        printful_product_id: baseProduct.metadata.printful_product_id || '',
        tapstitch_product_id: baseProduct.metadata.tapstitch_product_id || '',
        inventory_count: baseProduct.metadata.printful_product_id ? 999 : parseInt(baseProduct.metadata.inventory_count || '0'),
        is_active: baseProduct.active,
        variants: productVariants
      };
    });

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
} 