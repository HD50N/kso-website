'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartItem } from '@/types/shop';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, variant?: any) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotal: number;
  loading: boolean;
  saveCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (!user) {
      console.log('CartContext: loadCart called but no user');
      return;
    }

    console.log('CartContext: Starting to load cart for user:', user.id);
    setLoading(true);
    try {
      // Add credentials to ensure cookies are sent
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id, // Pass user ID as header for verification
        },
      });
      console.log('CartContext: Cart API response status:', response.status);
      
      if (response.ok) {
        const items = await response.json();
        console.log('CartContext: Loaded cart items:', items);
        setCartItems(items);
      } else {
        const errorText = await response.text();
        console.error('CartContext: Failed to load cart, status:', response.status, 'error:', errorText);
        
        // If we get a 401, it might be a session issue - try to refresh the session
        if (response.status === 401) {
          console.log('CartContext: 401 error - session might be expired');
        }
      }
    } catch (error) {
      console.error('CartContext: Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart from database when user changes or component mounts
  useEffect(() => {
    console.log('CartContext: User changed or component mounted, user:', user?.id);
    if (user) {
      console.log('CartContext: Loading cart for user:', user.id);
      loadCart();
    } else {
      console.log('CartContext: No user, clearing cart');
      // Clear cart when user logs out
      setCartItems([]);
    }
  }, [user, loadCart]);

  const saveCartToDatabase = useCallback(async (items: CartItem[]) => {
    if (!user) {
      console.log('CartContext: saveCartToDatabase called but no user');
      return;
    }

    console.log('CartContext: Saving cart to database for user:', user.id, 'items:', items);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id, // Pass user ID as header for verification
        },
        body: JSON.stringify({ items }),
      });

      console.log('CartContext: Save cart API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CartContext: Failed to save cart to database, status:', response.status, 'error:', errorText);
      } else {
        console.log('CartContext: Successfully saved cart to database');
      }
    } catch (error) {
      console.error('CartContext: Error saving cart to database:', error);
    }
  }, [user]);

  const saveCart = useCallback(async () => {
    if (!user || cartItems.length === 0) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        console.error('Failed to save cart');
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [user, cartItems]);

  const addToCart = useCallback(async (product: any, variant?: any) => {
    const newItems = (currentItems: CartItem[]): CartItem[] => {
      // Create unique ID for product + variant combination
      const uniqueId = variant ? `${product.id}-${variant.id}` : product.id;
      const displayName = variant ? `${product.name} - ${variant.name}` : product.name;
      
      // Ensure we have a valid price with fallbacks
      let price = 0;
      if (variant && variant.price) {
        price = parseFloat(variant.price);
      } else if (variant && variant.retail_price) {
        price = parseFloat(variant.retail_price);
      } else if (product.price) {
        price = parseFloat(product.price);
      }
      
      // Ensure price is a valid number
      if (isNaN(price)) {
        price = 0;
      }
      
      const stripePriceId = variant ? variant.stripe_price_id : product.stripe_price_id;
      
      const existingItem = currentItems.find(item => item.id === uniqueId);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === uniqueId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...currentItems, {
          id: uniqueId,
          name: displayName,
          price: price,
          image: product.image,
          quantity: 1,
          stripe_price_id: stripePriceId,
        }];
      }
    };

    // Update local state immediately
    setCartItems(prevItems => {
      const updatedItems = newItems(prevItems);
      
      // Immediately save to database if user is logged in
      if (user) {
        saveCartToDatabase(updatedItems);
      }
      
      return updatedItems;
    });
  }, [user, saveCartToDatabase]);

  const removeFromCart = useCallback(async (itemId: string) => {
    // Update local state immediately
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    // Delete from database if user is logged in
    if (user) {
      try {
        console.log('CartContext: Deleting item from database:', itemId);
        const response = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-User-ID': user.id,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('CartContext: Failed to delete item from database, status:', response.status, 'error:', errorText);
        } else {
          console.log('CartContext: Successfully deleted item from database:', itemId);
        }
      } catch (error) {
        console.error('CartContext: Error deleting item from database:', error);
      }
    }
  }, [user]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prevItems => {
      let updatedItems: CartItem[];
      
      if (quantity === 0) {
        updatedItems = prevItems.filter(item => item.id !== itemId);
      } else {
        updatedItems = prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
      }
      
      // Immediately save to database if user is logged in
      if (user) {
        saveCartToDatabase(updatedItems);
      }
      
      return updatedItems;
    });
  }, [user, saveCartToDatabase]);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (user) {
      try {
        await fetch('/api/cart', { 
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-User-ID': user.id, // Pass user ID as header for verification
          },
        });
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  }, [user]);



  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    cartTotal,
    loading,
    saveCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 