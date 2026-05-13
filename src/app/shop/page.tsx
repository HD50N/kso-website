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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() && !filters.category && !filters.color && !filters.size) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      const matchesQuery = !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.category && product.category.toLowerCase().includes(query));
      const matchesCategory = !filters.category || product.category === filters.category;
      let matchesColor = !filters.color;
      let matchesSize = !filters.size;
      if (product.variants) {
        if (filters.color) matchesColor = product.variants.some(variant => variant.color.toLowerCase() === filters.color.toLowerCase());
        if (filters.size) matchesSize = product.variants.some(variant => variant.size.toLowerCase() === filters.size.toLowerCase());
      }
      return matchesQuery && matchesCategory && matchesColor && matchesSize;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, filters, products]);

  const availableCategories = [...new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)))];
  const availableColors = [...new Set(products.flatMap(p => p.variants?.map(v => v.color) || []).filter((c): c is string => Boolean(c)))];
  const availableSizes = [...new Set(products.flatMap(p => p.variants?.map(v => v.size) || []).filter((s): s is string => Boolean(s)))].sort((a, b) => {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const openProductModal = (product: Product) => { setSelectedProduct(product); setIsProductModalOpen(true); };
  const closeProductModal = () => { setIsProductModalOpen(false); setSelectedProduct(null); };

  const handleCheckout = async (customerEmail: string) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, customerEmail }),
      });
      if (!response.ok) throw new Error('Checkout failed');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation onOpenCart={() => setIsCartOpen(true)} />

      {/* Hero */}
      <section className="border-b border-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                KSO Merchandise
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                KSO<br />Shop
              </h1>
            </div>
            <div className="lg:pt-10">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Show your KSO pride — every purchase supports our events and programming.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-md mb-8">
                Exclusive merchandise for members and friends of KSO. Browse variants, add to cart, and check out securely.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-3 border border-gray-200 px-6 py-3 hover:border-black hover:bg-black group transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black group-hover:text-white transition-colors">
                  Cart ({cartItemCount})
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchQuery}
                onFilterChange={setFilters}
                placeholder="Search products, colors, sizes..."
                availableCategories={availableCategories}
                availableColors={availableColors}
                availableSizes={availableSizes}
              />
            </div>
          </div>

          {searchQuery && (
            <p className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-medium mb-8">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading products...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="text-[10px] tracking-[0.14em] uppercase font-semibold text-black underline underline-offset-2 hover:no-underline">
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              {searchQuery ? (
                <>
                  <p className="text-sm text-gray-400 mb-4">No products match &ldquo;{searchQuery}&rdquo;.</p>
                  <button onClick={() => setSearchQuery('')} className="text-[10px] tracking-[0.14em] uppercase font-semibold text-black underline underline-offset-2 hover:no-underline">
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-black tracking-tight mb-3">Coming Soon</h2>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    We&apos;re working on bringing you amazing KSO merchandise. Stay tuned for exclusive clothing, accessories, and more.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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

      <ShoppingCart
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        onClearCart={clearCart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

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
