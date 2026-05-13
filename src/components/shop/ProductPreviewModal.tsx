'use client';

import { useState, useEffect } from 'react';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';

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
    <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 backdrop-blur-md bg-black/20">
      <div className="bg-white border border-gray-100 shadow-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-1">Printful preview</p>
            <h2 className="text-xl font-bold text-black tracking-tight pr-4">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 p-1 text-gray-400 hover:text-black transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 border border-gray-100 overflow-hidden relative">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {productImages[currentImageIndex] && (
                  <div className="absolute bottom-2 right-2 z-10">
                    <PhotoDownloadButton
                      imageUrl={productImages[currentImageIndex]}
                      fileName={`${String(product.name).replace(/\s+/g, '-')}-printful-${currentImageIndex + 1}.jpg`}
                      tone="onLight"
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {productImages.map((image: string, index: number) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 overflow-hidden border ${
                        currentImageIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-400'
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

            <div className="space-y-6">
              <div className="text-3xl font-bold text-black tracking-tight">${currentPrice.toFixed(2)}</div>

              <div>
                <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {variants.length > 0 && (
                <div className="space-y-5">
                  {colors.length > 1 && (
                    <div>
                      <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3">Color</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {colors.map((color) => (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`p-3 border text-center text-sm transition-colors ${
                              selectedColor === color
                                ? 'border-black bg-gray-50 text-black'
                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <span className="font-medium capitalize">{color}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sizes.length > 1 && (
                    <div>
                      <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3">Size</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {sizes.map((size) => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`p-3 border text-center text-sm transition-colors ${
                              selectedSize === size
                                ? 'border-black bg-gray-50 text-black'
                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <span className="font-medium">{size}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVariant && (
                    <div className="border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Selected variant</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium capitalize text-black">{selectedColor}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="font-medium text-black">{selectedSize}</span>
                      </p>
                      <p className="text-lg font-bold text-black mt-1">${parseFloat(selectedVariant.retail_price).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              {loadingVariants && (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Loading variants…</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Product ID</span>
                  <span className="text-right font-mono text-gray-800">{product.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Variants</span>
                  <span>{variants.length || product.variants}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Synced</span>
                  <span>{String(product.synced)}</span>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400">Status</span>
                  <span
                    className={`text-[10px] font-semibold tracking-[0.08em] uppercase px-2 py-1 border ${
                      product.is_ignored
                        ? 'border-[#CD2E3A]/40 text-[#CD2E3A]'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {product.is_ignored ? 'Ignored' : 'Active'}
                  </span>
                </div>
                {product.external_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400">External ID</span>
                    <span className="text-right font-mono text-gray-800">{product.external_id}</span>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 px-4 py-3">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-2">Note</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Preview matches Printful. All variants and options are shown for review before syncing.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 border border-gray-200 text-black hover:border-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 