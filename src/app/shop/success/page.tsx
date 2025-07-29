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
      // In a real implementation, you would fetch order details from your API
      // For now, we'll simulate this
      setTimeout(() => {
        setOrderDetails({
          id: sessionId,
          total: 29.99, // This would come from your API
          items: [
            { name: 'KSO T-Shirt', quantity: 1, price: 29.99 }
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [sessionId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {loading ? (
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your order...</p>
        </div>
      ) : (
        <>
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">
            Thank You!
          </h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1 mb-8">
            Your order has been placed successfully
          </p>
          
          {orderDetails && (
            <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              <div className="text-left space-y-2">
                <p><span className="font-semibold">Order ID:</span> {orderDetails.id}</p>
                <p><span className="font-semibold">Total:</span> ${orderDetails.total}</p>
                <div className="mt-4">
                  <p className="font-semibold mb-2">Items:</p>
                  {orderDetails.items.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-600">
                      {item.name} x{item.quantity} - ${item.price}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-gray-600">
              You will receive an email confirmation shortly with your order details.
            </p>
            <p className="text-gray-600">
              We'll notify you when your order ships!
            </p>
          </div>
          
          <div className="mt-8 space-x-4">
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Success Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </section>

      <Footer />
    </div>
  );
} 