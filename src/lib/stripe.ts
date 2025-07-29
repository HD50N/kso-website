import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

// Client-side Stripe instance
export const stripeClient = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Helper function to format price for Stripe (convert to cents)
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100);
};

// Helper function to format price for display (convert from cents)
export const formatPriceForDisplay = (price: number): string => {
  return `$${(price / 100).toFixed(2)}`;
}; 