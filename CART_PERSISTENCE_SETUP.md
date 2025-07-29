# Cart Persistence Implementation

This document explains the cart persistence feature that allows users' shopping carts to be saved and restored across sessions.

## Overview

The cart persistence system stores cart items in the database and automatically syncs them when users are logged in. This ensures that users don't lose their cart items when they navigate away from the site or close their browser.

## Database Schema

### Cart Items Table

The `cart_items` table stores individual cart items for each user:

```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  stripe_price_id TEXT,
  variant_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of user, product, and variant
  UNIQUE(user_id, product_id, variant_id)
);
```

### Key Features

- **User-specific carts**: Each user has their own cart
- **Product variants support**: Handles different product variants (size, color, etc.)
- **Automatic cleanup**: Cart items are deleted when users are deleted
- **Row Level Security**: Users can only access their own cart items
- **Performance indexes**: Optimized queries for user_id and product_id

## API Endpoints

### GET /api/cart
- **Purpose**: Load user's cart items
- **Authentication**: Required
- **Response**: Array of CartItem objects

### POST /api/cart
- **Purpose**: Save cart items (replaces entire cart)
- **Authentication**: Required
- **Body**: `{ items: CartItem[] }`
- **Response**: `{ success: true }`

### DELETE /api/cart
- **Purpose**: Clear all cart items for the user
- **Authentication**: Required
- **Response**: `{ success: true }`

## Frontend Implementation

### CartContext

The `CartContext` provides cart management functionality:

```typescript
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
```

### Key Features

- **Automatic persistence**: Cart is automatically saved when items change
- **Debounced saving**: Changes are saved after 1 second of inactivity
- **User-aware**: Cart is loaded when user logs in, cleared when user logs out
- **Real-time updates**: Cart count is displayed in navigation

### Usage

```typescript
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { cartItems, addToCart, cartItemCount } = useCart();
  
  // Add item to cart
  addToCart(product, variant);
  
  // Display cart count
  return <div>Cart: {cartItemCount} items</div>;
}
```

## Setup Instructions

### 1. Database Setup

Run the cart schema SQL file in your Supabase database:

```bash
# In Supabase SQL editor or via psql
\i cart-schema.sql
```

### 2. Environment Variables

Ensure your environment variables are set up for Supabase authentication:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Context Providers

The CartProvider is already set up in the main layout:

```typescript
// src/app/layout.tsx
<AuthProvider>
  <CartProvider>
    {/* Your app content */}
  </CartProvider>
</AuthProvider>
```

### 4. Navigation Integration

The navigation component automatically displays cart count:

- Desktop: Cart icon with badge in top-right
- Mobile: Cart link with badge in mobile menu

## User Experience

### For Logged-in Users

1. **Automatic cart loading**: Cart is restored when user logs in
2. **Real-time persistence**: Changes are saved automatically
3. **Cross-device sync**: Cart is available on any device
4. **Session persistence**: Cart survives browser restarts

### For Guest Users

1. **Local storage fallback**: Cart is stored in browser (if implemented)
2. **Login prompt**: Users are encouraged to log in to save their cart
3. **Cart transfer**: Guest cart can be transferred to account on login

## Security Considerations

- **Row Level Security**: Users can only access their own cart items
- **Authentication required**: All cart operations require user authentication
- **Input validation**: All cart data is validated before storage
- **SQL injection protection**: Using parameterized queries

## Performance Optimizations

- **Debounced saving**: Reduces database writes
- **Efficient queries**: Indexed on user_id and product_id
- **Minimal data transfer**: Only necessary cart data is stored
- **Lazy loading**: Cart is loaded only when needed

## Troubleshooting

### Common Issues

1. **Cart not persisting**: Check user authentication status
2. **Cart count not updating**: Verify CartContext is properly wrapped
3. **Database errors**: Check RLS policies and user permissions
4. **API errors**: Verify Supabase configuration

### Debug Steps

1. Check browser console for errors
2. Verify user is authenticated
3. Check network tab for API calls
4. Verify database schema is applied
5. Check Supabase logs for errors

## Future Enhancements

- **Guest cart support**: Store cart in localStorage for non-authenticated users
- **Cart sharing**: Allow users to share cart links
- **Cart templates**: Save carts as templates for future use
- **Bulk operations**: Add/remove multiple items at once
- **Cart analytics**: Track cart abandonment and conversion rates 