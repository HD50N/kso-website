import { ProductVariant } from '@/types/shop';

/**
 * Get the best variant based on color preference:
 * 1. White variant (case-insensitive)
 * 2. Black variant (case-insensitive) 
 * 3. Any other variant
 */
export function getBestVariant(variants: ProductVariant[] | undefined): ProductVariant | null {
  if (!variants || variants.length === 0) {
    return null;
  }

  // Priority order: white, black, any other
  const colorPriority = ['white', 'black'];
  
  // Try to find variants by priority
  for (const priorityColor of colorPriority) {
    const variant = variants.find(v => 
      v.color.toLowerCase().includes(priorityColor.toLowerCase())
    );
    if (variant) {
      return variant;
    }
  }
  
  // If no white or black variant found, return the first variant
  return variants[0] || null;
}

/**
 * Get the best variant image URL for a product
 * For shop products: uses the product's main image (since variants share the same image)
 * For admin preview: uses the product's thumbnail_url
 * Falls back to placeholder if no image is available
 */
export function getProductDisplayImage(product: any): string {
  // For shop products (from Stripe), use the main product image
  if (product.image) {
    return product.image;
  }
  
  // For admin preview products (from Printful), use thumbnail_url
  if (product.thumbnail_url) {
    return product.thumbnail_url;
  }
  
  // Fall back to placeholder
  return '/placeholder-product.jpg';
} 