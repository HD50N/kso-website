'use client';

import { Product } from '@/types/shop';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenModal: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onOpenModal }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div 
          className="cursor-pointer group relative"
          onClick={() => onOpenModal(product)}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-68 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        {product.inventory_count === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 
          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-gray-700"
          onClick={() => onOpenModal(product)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {product.variants && product.variants.length > 1 && (
          <div className="mb-3 space-y-1">
            {/* Show available colors and sizes */}
            {(() => {
              const colors = [...new Set(product.variants.map(v => v.color))];
              const sizes = [...new Set(product.variants.map(v => v.size))];
              return (
                <>
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1">
                    {colors.length} colors
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    {sizes.length} sizes
                  </span>
                </>
              );
            })()}
          </div>
        )}
        
        {product.category && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.variants && product.variants.length > 1 ? (
            <button
              onClick={() => onOpenModal(product)}
              className="px-4 py-2 rounded font-medium transition-colors duration-200 bg-black text-white hover:bg-gray-800"
            >
              Choose Options
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.inventory_count === 0}
              className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                product.inventory_count === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {product.inventory_count === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 