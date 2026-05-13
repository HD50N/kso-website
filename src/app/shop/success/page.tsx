'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => {
        setOrderDetails({
          id: sessionId,
          total: 29.99,
          items: [
            { name: 'KSO T-Shirt', quantity: 1, price: 29.99 }
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm text-gray-400">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start py-20 lg:py-28">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
            Order Confirmed
          </p>
          <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter mb-8">
            Thank<br />You
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-md mb-8">
            Your order has been placed successfully. You&apos;ll receive an email confirmation shortly with your order details, and we&apos;ll notify you when your order ships.
          </p>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="inline-block bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-block border border-gray-200 text-black text-[10px] font-semibold tracking-[0.18em] uppercase px-8 py-4 hover:border-black transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {orderDetails && (
          <div className="lg:pt-20 border border-gray-100 p-8">
            <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
            <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-4">Order Summary</p>
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between py-4 text-sm">
                <span className="text-gray-400">Order ID</span>
                <span className="text-black font-mono text-xs">{orderDetails.id.slice(0, 16)}...</span>
              </div>
              {orderDetails.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between py-4 text-sm">
                  <span className="text-gray-600">{item.name} ×{item.quantity}</span>
                  <span className="text-black font-semibold">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between py-4">
                <span className="text-sm font-black text-black tracking-tight">Total</span>
                <span className="text-sm font-black text-black">${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="border-b border-gray-100">
        <Suspense fallback={
          <div className="text-center py-32">
            <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </section>

      <Footer />
    </div>
  );
}
