export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  printful_product_id?: string;
  tapstitch_product_id?: string;
  inventory_count?: number;
  is_active?: boolean;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  stripe_product_id: string;
  stripe_price_id: string;
  printful_variant_id: string;
  is_available?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stripe_price_id?: string;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  shipping_address?: any;
  items: CartItem[];
  printful_order_id?: string;
  tapstitch_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  metadata: Record<string, string>;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
  };
} 