'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ShopPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
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
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Coming Soon Message */}
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="text-6xl mb-4">🛍️</div>
              <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-4">Coming Soon</h2>
              <p className="font-body text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                We're working hard to bring you amazing KSO merchandise. 
                Stay tuned for exclusive clothing, accessories, and more!
              </p>
            </div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">👕</div>
                <h3 className="text-lg font-semibold text-black mb-2">KSO Apparel</h3>
                <p className="text-gray-600">T-shirts, hoodies, and more with our signature designs</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎒</div>
                <h3 className="text-lg font-semibold text-black mb-2">Accessories</h3>
                <p className="text-gray-600">Bags, stickers, and other KSO-branded items</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-black mb-2">Custom Designs</h3>
                <p className="text-gray-600">Exclusive artwork celebrating Korean culture and community</p>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-12 bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-black mb-4">Get Notified</h3>
              <p className="text-gray-600 text-sm mb-4">
                Be the first to know when our shop launches!
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 