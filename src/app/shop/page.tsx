'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/shop/ProductCard';
import ShoppingCart from '@/components/shop/ShoppingCart';
import ProductModal from '@/components/shop/ProductModal';
import SearchBar, { FilterState } from '@/components/shop/SearchBar';
import { Product, ProductVariant } from '@/types/shop';
import { useCart } from '@/contexts/CartContext';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    category: '',
    color: '',
    size: ''
  });
  
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartItemCount } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data); // Initialize filtered products with all products
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query and filters
  useEffect(() => {
    if (!searchQuery.trim() && !filters.category && !filters.color && !filters.size) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      // Text search
      const matchesQuery = !query || 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query));

      // Category filter
      const matchesCategory = !filters.category || product.category === filters.category;

      // Color and size filters
      let matchesColor = !filters.color;
      let matchesSize = !filters.size;

      if (product.variants) {
        if (filters.color) {
          matchesColor = product.variants.some(variant => 
            variant.color.toLowerCase() === filters.color.toLowerCase()
          );
        }
        if (filters.size) {
          matchesSize = product.variants.some(variant => 
            variant.size.toLowerCase() === filters.size.toLowerCase()
          );
        }
      }

      return matchesQuery && matchesCategory && matchesColor && matchesSize;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, filters, products]);

  // Extract available filter options
  const availableCategories = [...new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)))];
  const availableColors = [...new Set(
    products.flatMap(p => p.variants?.map(v => v.color) || []).filter((c): c is string => Boolean(c))
  )];
  const availableSizes = [...new Set(
    products.flatMap(p => p.variants?.map(v => v.size) || []).filter((s): s is string => Boolean(s))
  )].sort((a, b) => {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });


  // Open product modal
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Close product modal
  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };



  // Handle checkout
  const handleCheckout = async (customerEmail: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };



  return (
    <div className="min-h-screen">
      <Navigation onOpenCart={() => setIsCartOpen(true)} />
      
      {/* Hero Section */}
      <section className="bg-white text-black py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">KSO Shop</h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
            Show your KSO pride with our exclusive merchandise
          </p>
        </div>
      </section>

      {/* Horizontal separator line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-300"></div>
      </div>

      {/* Shop Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Cart Button and Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            {/* Search Bar */}
            <div className="w-full sm:w-auto sm:flex-1">
              <SearchBar 
                onSearch={setSearchQuery}
                onFilterChange={setFilters}
                placeholder="Search products, colors, sizes..."
                availableCategories={availableCategories}
                availableColors={availableColors}
                availableSizes={availableSizes}
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart ({cartItemCount})</span>
            </button>
          </div>

          {/* Search Results Counter */}
          {searchQuery && (
            <div className="text-center mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              {searchQuery ? (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                  <p className="text-gray-600 mb-4">
                    No products match "{searchQuery}". Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🛍️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    We're working hard to bring you amazing KSO merchandise. 
                    Stay tuned for exclusive clothing, accessories, and more!
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onOpenModal={openProductModal}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shopping Cart Modal */}
      <ShoppingCart
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        onClearCart={clearCart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={closeProductModal}
          onAddToCart={addToCart}
        />
      )}

      <Footer />
    </div>
  );
} 