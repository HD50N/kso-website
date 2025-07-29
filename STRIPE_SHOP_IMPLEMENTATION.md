# KSO Shop Implementation Guide: Stripe + Custom

## 🎯 Overview

This guide outlines the step-by-step process for implementing a custom e-commerce solution using Stripe for payments, integrated with Printful/Tapstitch for print-on-demand fulfillment.

## 🏗️ Architecture

```
Next.js Frontend (Vercel)
    ↓ API calls
Next.js API Routes (Vercel)
    ↓ Stripe API
Stripe (Payments)
    ↓ Webhooks
Printful/Tapstitch APIs (Fulfillment)
```

## 📋 Implementation Phases

### Phase 1: Foundation Setup
- [ ] Stripe account creation and configuration
- [ ] Environment variables setup
- [ ] Required packages installation
- [ ] Basic project structure

### Phase 2: Backend Development
- [ ] Stripe API integration
- [ ] Product management system
- [ ] Order management system
- [ ] Webhook handlers

### Phase 3: Frontend Development
- [ ] Product catalog components
- [ ] Shopping cart functionality
- [ ] Checkout flow
- [ ] Order confirmation

### Phase 4: Fulfillment Integration
- [ ] Printful API setup
- [ ] Tapstitch API setup
- [ ] Order fulfillment automation
- [ ] Inventory management

### Phase 5: Testing & Deployment
- [ ] End-to-end testing
- [ ] Payment flow testing
- [ ] Production deployment
- [ ] Monitoring setup

## 🔧 Technical Requirements

### Required Packages
```bash
npm install stripe @stripe/stripe-js
npm install @headlessui/react
npm install react-query
npm install @types/stripe
```

### Environment Variables
```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Printful
PRINTFUL_API_KEY=...

# Tapstitch
TAPSTITCH_API_KEY=...

# Database (if using Supabase)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  printful_product_id TEXT,
  tapstitch_product_id TEXT,
  inventory_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  items JSONB,
  printful_order_id TEXT,
  tapstitch_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Implementation Steps

### Step 1: Stripe Account Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a business account
   - Complete verification process

2. **Get API Keys**
   - Navigate to Developers → API keys
   - Copy publishable and secret keys
   - Add to environment variables

3. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy webhook secret

### Step 2: Project Structure

```
src/
├── app/
│   ├── shop/
│   │   ├── page.tsx (Product catalog)
│   │   ├── [productId]/
│   │   │   └── page.tsx (Product detail)
│   │   └── checkout/
│   │       └── page.tsx (Checkout)
│   └── api/
│       ├── products/
│       │   └── route.ts
│       ├── checkout/
│       │   └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ShoppingCart.tsx
│   │   └── CheckoutForm.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Modal.tsx
├── lib/
│   ├── stripe.ts
│   ├── printful.ts
│   ├── tapstitch.ts
│   └── supabase.ts
└── types/
    └── shop.ts
```

### Step 3: Stripe Integration

#### Create Stripe Client (`src/lib/stripe.ts`)
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const stripeClient = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);
```

#### Products API (`src/app/api/products/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });
    
    return NextResponse.json(products.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
```

#### Checkout API (`src/app/api/checkout/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { items, customerEmail } = await request.json();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/shop`,
      customer_email: customerEmail,
    });
    
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
```

### Step 4: Frontend Components

#### Product Card Component
```typescript
// src/components/shop/ProductCard.tsx
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  onAddToCart: (product: any) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">${product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Shopping Cart Component
```typescript
// src/components/shop/ShoppingCart.tsx
export default function ShoppingCart({ items, onRemove, onCheckout }: ShoppingCartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      {items.map((item) => (
        <div key={item.id} className="flex justify-between items-center py-2">
          <span>{item.name} x {item.quantity}</span>
          <span>${item.price * item.quantity}</span>
          <button onClick={() => onRemove(item.id)} className="text-red-500">Remove</button>
        </div>
      ))}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>${total}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full bg-black text-white py-2 rounded mt-4 hover:bg-gray-800"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Printful/Tapstitch Integration

#### Printful API Setup (`src/lib/printful.ts`)
```typescript
const PRINTFUL_API_URL = 'https://api.printful.com';

export async function createPrintfulOrder(orderData: any) {
  const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  
  return response.json();
}
```

#### Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createPrintfulOrder } from '@/lib/printful';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Create order in your database
    // Send order to Printful/Tapstitch
    await createPrintfulOrder({
      recipient: session.customer_details,
      items: session.line_items,
    });
  }
  
  return NextResponse.json({ received: true });
}
```

## 🧪 Testing

### Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

### Testing Checklist
- [ ] Product display
- [ ] Add to cart functionality
- [ ] Checkout flow
- [ ] Payment processing
- [ ] Order confirmation
- [ ] Webhook handling
- [ ] Printful/Tapstitch integration

## 🚀 Deployment

### Vercel Deployment
1. **Push code to GitHub**
2. **Connect repository to Vercel**
3. **Add environment variables**
4. **Deploy**

### Environment Variables (Production)
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRINTFUL_API_KEY=...
TAPSTITCH_API_KEY=...
NEXT_PUBLIC_URL=https://your-domain.com
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Conversion rate
- Average order value
- Cart abandonment rate
- Payment success rate
- Fulfillment success rate

### Tools
- Stripe Dashboard
- Vercel Analytics
- Custom logging
- Error tracking (Sentry)

## 🔒 Security Considerations

- [ ] Validate all inputs
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Secure webhook endpoints
- [ ] Regular security audits
- [ ] PCI compliance (handled by Stripe)

## 💰 Cost Structure

- **Stripe:** 2.9% + 30¢ per transaction
- **Printful:** Base cost + markup per item
- **Tapstitch:** Base cost + markup per item
- **Vercel:** Free tier (or $20/month for Pro)
- **Total:** Only pay for what you sell!

## 🎯 Success Metrics

- **Launch Goal:** 10 orders in first month
- **Revenue Goal:** $500 in first quarter
- **Customer Satisfaction:** 4.5+ star rating
- **Technical:** 99.9% uptime

## 📞 Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Printful API Docs](https://www.printful.com/docs)
- [Tapstitch API Docs](https://tapstitch.com/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** Ready for Implementation 