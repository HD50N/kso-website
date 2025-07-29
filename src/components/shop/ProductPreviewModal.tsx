'use client';

import { useState, useEffect } from 'react';

interface ProductPreviewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, isOpen, onClose }: ProductPreviewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch detailed product information including variants
  useEffect(() => {
    if (isOpen && product) {
      fetchProductVariants();
    }
  }, [isOpen, product]);

  const fetchProductVariants = async () => {
    setLoadingVariants(true);
    try {
      const response = await fetch(`/api/sync-products/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.sync_variants) {
          setVariants(data.sync_variants);
        }
      }
    } catch (error) {
      console.error('Error fetching product variants:', error);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Extract colors and sizes from variants
  const colors = [...new Set(variants.map(v => v.color || v.color_name || 'Default').filter(Boolean))];
  const sizes = [...new Set(variants.map(v => v.size || 'Default').filter(Boolean))].sort((a, b) => {
    // Sort sizes from smallest to largest
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());
    
    // If both sizes are in the order, sort by index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order, prioritize the known size
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order, sort alphabetically
    return a.localeCompare(b);
  });
  
  // Auto-select if only one option available
  useEffect(() => {
    if (colors.length === 1 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
    if (sizes.length === 1 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [colors, sizes, selectedColor, selectedSize]);

  // Find the selected variant based on color and size selection
  const selectedVariant = variants.find(
    v => (v.color || v.color_name) === selectedColor && v.size === selectedSize
  ) || null;
  
  // Get images based on selected variant or fall back to product image
  const getProductImages = () => {
    if (selectedVariant && selectedVariant.files && selectedVariant.files.length > 0) {
      // Use variant-specific images if available
      return selectedVariant.files.map((file: any) => file.preview_url || file.url).filter(Boolean);
    }
    // Fall back to product thumbnail
    return [product.thumbnail_url];
  };
  
  const productImages = getProductImages();
  
  const currentPrice = selectedVariant ? parseFloat(selectedVariant.retail_price) : product.retail_price || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-2">
                  {productImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price */}
              <div className="text-3xl font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* Color and Size Selection */}
              {variants.length > 0 && (
                <div className="space-y-4">
                  {/* Color Selection */}
                  {colors.length > 1 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`p-3 rounded-lg border-2 transition-colors text-center ${
                              selectedColor === color
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium capitalize">{color}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {sizes.length > 1 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`p-3 rounded-lg border-2 transition-colors text-center ${
                              selectedSize === size
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{size}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Selected: <span className="font-medium capitalize">{selectedColor}</span> / <span className="font-medium">{selectedSize}</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${parseFloat(selectedVariant.retail_price).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {loadingVariants && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-gray-600">Loading variants...</span>
                </div>
              )}

              {/* Product Info */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span>{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Variants:</span>
                  <span>{variants.length || product.variants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Synced:</span>
                  <span>{product.synced}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={product.is_ignored ? 'text-red-600' : 'text-green-600'}>
                    {product.is_ignored ? 'Ignored' : 'Active'}
                  </span>
                </div>
                {product.external_id && (
                  <div className="flex justify-between">
                    <span>External ID:</span>
                    <span>{product.external_id}</span>
                  </div>
                )}
              </div>

              {/* Preview Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 text-sm font-medium">
                    This is a preview of the product as it appears in Printful. 
                    All variants and options are shown for your review.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 