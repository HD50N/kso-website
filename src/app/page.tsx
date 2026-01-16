'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import AnimatedFlag from '@/components/AnimatedFlag';
import AnimatedFan from '@/components/AnimatedFan';
import AnimatedMask from '@/components/AnimatedMask';
import AnimatedPalace from '@/components/AnimatedPalace';
import PhotoCollage from '@/components/PhotoCollage';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  const [currentAnimation, setCurrentAnimation] = useState('flag');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation(prev => {
        if (prev === 'flag') return 'fan';
        if (prev === 'fan') return 'mask';
        if (prev === 'mask') return 'palace';
        return 'flag';
      });
    }, 8000); // Switch every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const upcomingEvents = [
    {
      title: "General Meeting",
      date: "Week 1-2",
      description: "Join us for our general meeting to kick off winter quarter and learn about upcoming events.",
      image: "/placeholder-rso-fair.jpg"
    },
    {
      title: "Family Event",
      date: "Week 3-4",
      description: "A special event for KSO families to bond and celebrate our community together.",
      image: "/placeholder-family-event.jpg"
    },
    {
      title: "Winter Formal",
      date: "Week 5",
      description: "Join us for our annual Winter Formal! A night of celebration, dancing, and community.",
      image: "/placeholder-kso-phi-delt.jpg"
    },
    {
      title: "TBD",
      date: "Week 5",
      description: "Details to be announced.",
      image: "/placeholder-welcome-dinner.jpg"
    },
    {
      title: "Fundraiser",
      date: "Week 6-7",
      description: "Support KSO through our fundraising event. Details to be announced.",
      image: "/placeholder-fundraiser.jpg"
    },
  ];

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA==', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      href: 'https://www.facebook.com/share/g/16cdxUAiLv/', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com/company/uchicago-kso', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      name: 'Email', 
      href: 'mailto:ksouchicago@gmail.com', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Announcement Bar */
      }
      <div className="w-full bg-korean-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="text-xs sm:text-sm font-body-bold tracking-wide">
            Applications are open — get involved with KSO!
          </div>
          <Link href="/applications" className="hidden sm:block">
            <Button size="sm" variant="secondary" className="!bg-white !text-black !border-0">
              Apply now
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fef2f2] via-[#f8f9fa] to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-korean-gradient opacity-10" />
        {/* Accent blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-korean-red opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-korean-blue opacity-10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Title */}
              <ScrollAnimation>
                <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-4 sm:mb-6 animate-bounce-in text-black leading-tight">
                  Korean Students Organization
                </h1>
              </ScrollAnimation>
              
              {/* Subtitle */}
              <ScrollAnimation>
                <p className="hero-subtitle text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 sm:mb-8 text-gray-700 animate-slide-in-up stagger-1">
                  University of Chicago
                </p>
              </ScrollAnimation>
              
              {/* ASCII Component - Mobile Only */}
              <ScrollAnimation className="flex justify-center lg:hidden mb-0">
                {/* Layered Card with Rotated Background Accent */}
                <div className="relative w-80 h-80 mx-auto">
                  {/* Bottom layer - rotated background accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-korean-red/20 to-korean-blue/20 rounded-3xl rotate-6"></div>
                  
                  {/* Top layer - white card with shadow */}
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div 
                        className={`transition-all duration-1500 ease-in-out ${
                          currentAnimation === 'flag' 
                            ? 'opacity-100 transform scale-100' 
                            : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        }`}
                      >
                        <AnimatedFlag />
                      </div>
                      <div 
                        className={`transition-all duration-1500 ease-in-out ${
                          currentAnimation === 'fan' 
                            ? 'opacity-100 transform scale-100' 
                            : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        }`}
                      >
                        <AnimatedFan />
                      </div>
                      <div 
                        className={`transition-all duration-1500 ease-in-out ${
                          currentAnimation === 'mask' 
                            ? 'opacity-100 transform scale-100' 
                            : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        }`}
                      >
                        <AnimatedMask />
                      </div>
                      <div 
                        className={`transition-all duration-1500 ease-in-out ${
                          currentAnimation === 'palace' 
                            ? 'opacity-100 transform scale-100' 
                            : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        }`}
                      >
                        <AnimatedPalace />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
              
              {/* Description */}
              <ScrollAnimation>
                <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto lg:mx-0 text-gray-600 animate-fade-in stagger-2 px-4 lg:px-0 leading-relaxed">
                  Representing the Korean community and strengthening its voice on campus and beyond
                </p>
              </ScrollAnimation>
              
              {/* Buttons */}
              <ScrollAnimation>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-scale-in stagger-3 px-4 lg:px-0">
                  <Link href="#winter-events">
                    <Button size="lg" variant="primary" className="shadow-lg animate-float-slow">See Events</Button>
                  </Link>
                </div>
              </ScrollAnimation>
            </div>
            
            {/* Right side - Alternating Flag, Fan, Mask, and Palace - Desktop Only */}
            <ScrollAnimation className="hidden lg:flex lg:justify-end order-1 lg:order-2">
              {/* Layered Card with Rotated Background Accent */}
              <div className="relative w-96 h-96">
                {/* Bottom layer - rotated background accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-korean-red/20 to-korean-blue/20 rounded-3xl rotate-6"></div>
                
                {/* Top layer - white card with shadow */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div 
                      className={`transition-all duration-1500 ease-in-out ${
                        currentAnimation === 'flag' 
                          ? 'opacity-100 transform scale-100' 
                          : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}
                    >
                      <AnimatedFlag />
                    </div>
                    <div 
                      className={`transition-all duration-1500 ease-in-out ${
                        currentAnimation === 'fan' 
                          ? 'opacity-100 transform scale-100' 
                          : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}
                    >
                      <AnimatedFan />
                    </div>
                    <div 
                      className={`transition-all duration-1500 ease-in-out ${
                        currentAnimation === 'mask' 
                          ? 'opacity-100 transform scale-100' 
                          : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}
                    >
                      <AnimatedMask />
                    </div>
                    <div 
                      className={`transition-all duration-1500 ease-in-out ${
                        currentAnimation === 'palace' 
                          ? 'opacity-100 transform scale-100' 
                          : 'opacity-0 transform scale-95 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}
                    >
                      <AnimatedPalace />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Gradient Transition */}
      <div className="h-24 bg-gradient-to-b from-white via-white to-white"></div>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Mission Statement */}
      <section className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <PhotoCollage />
        <ScrollAnimation className="max-w-5xl mx-auto text-center relative z-10">
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-black leading-relaxed max-w-4xl mx-auto px-4">
            Our mission is to represent the Korean community and strengthen its voice on (and beyond) campus 
            and to bring together those who have a common interest in Korean culture through social activities and events
          </p>
        </ScrollAnimation>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Sponsors */}
      <section className="section-padding bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation className="text-center mb-8 sm:mb-12">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-4">Sponsors</h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-4">
              We're grateful for the support of the past, present, and future sponsors that have and will help make our events possible. 
            </p>
          </ScrollAnimation>
          
          <ScrollAnimation>
            <div className="flex flex-nowrap overflow-x-auto gap-4 sm:gap-6 lg:gap-8 pb-4 sm:pb-0 sm:flex-wrap sm:justify-center scrollbar-hide justify-center">
              {/* Weee! Sponsor */}
              <div className="modern-card hover-lift shadow-lg p-3 sm:p-6 lg:p-8 bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl flex-shrink-0 w-48 sm:w-full sm:max-w-xs">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center p-2 sm:p-3 shadow-sm border border-gray-100">
                    <img 
                      src="/weee!.jpg" 
                      alt="Weee! Sponsor Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-black mb-1 sm:mb-2">Weee!</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Food & Grocery Sponsor</p>
                </div>
              </div>
              
              {/* The Face Shop Sponsor */}
              <div className="modern-card hover-lift shadow-lg p-3 sm:p-6 lg:p-8 bg-white rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl flex-shrink-0 w-48 sm:w-full sm:max-w-xs">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center p-2 sm:p-3 shadow-sm border border-gray-100">
                    <img 
                      src="/thefaceshop.jpg" 
                      alt="The Face Shop Sponsor Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-black mb-1 sm:mb-2">The Face Shop</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Clean Beauty Sponsor</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Upcoming Events */}
      <section id="winter-events" className="section-padding px-6 sm:px-6 lg:px-8 p-4 sm:p-0">
        <div className="max-w-sm sm:max-w-7xl mx-auto">
          <ScrollAnimation className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="section-title text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black mb-3 sm:mb-4">Winter 2025-2026</h2>
            <p className="font-body text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto px-4">Check out our latest events and stay connected with the Korean community</p>
          </ScrollAnimation>
          
          {/* Mobile: Timeline View */}
          <div className="block sm:hidden">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {upcomingEvents.map((event, index) => (
                <ScrollAnimation key={index} className={`stagger-${index + 1} relative mb-8`}>
                  <div className="flex items-start">
                    {/* Timeline bubble */}
                    <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4 relative z-10 shadow-lg">
                      <div className="text-center px-1">
                        <span className="text-white text-xs font-bold block leading-tight">
                          {event.date.split(' ').slice(-1)[0]}
                        </span>
                      </div>
                    </div>
                    
                    {/* Event card */}
                    <div className="flex-1 bg-white rounded-lg shadow-lg p-3 sm:p-4 hover-lift border-l-4 border-black">
                      <h3 className="text-base sm:text-lg font-bold text-black mb-2">{event.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{event.description}</p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Timeline View */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 transform -translate-x-1/2"></div>
              
              <div className="space-y-12">
                {upcomingEvents.map((event, index) => (
                  <ScrollAnimation key={index} className={`stagger-${index + 1} relative`}>
                    <div className="flex items-center">
                      {/* Event card - left side */}
                      <div className="flex-1 pr-8 text-right">
                        <div className={`bg-white rounded-lg shadow-lg p-6 hover-lift border-l-4 border-black inline-block w-full max-w-md h-32 flex flex-col justify-center ${index % 2 === 0 ? 'block' : 'invisible'}`}>
                          <h3 className="text-xl font-bold text-black mb-2">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                        </div>
                      </div>
                      
                      {/* Timeline bubble - perfectly centered on line */}
                      <div className="flex-shrink-0 w-16 h-16 bg-black rounded-full flex items-center justify-center relative z-10 shadow-lg" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
                        <div className="text-center px-1">
                          <span className="text-white text-sm font-bold block leading-tight">
                            {event.date.split(' ').slice(-1)[0]}
                          </span>
                          <span className="text-white text-xs block leading-tight">
                            {event.date.split(' ').slice(0, -1).join(' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Event card - right side */}
                      <div className="flex-1 pl-8 text-left">
                        <div className={`bg-white rounded-lg shadow-lg p-6 hover-lift border-l-4 border-black inline-block w-full max-w-md h-32 flex flex-col justify-center ${index % 2 === 1 ? 'block' : 'invisible'}`}>
                          <h3 className="text-xl font-bold text-black mb-2">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Quick Stats */}
      <section className="section-padding bg-white relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="section-title text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-3 sm:mb-4 text-black">Our Impact</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">Celebrating community building and cultural celebration</p>
          </ScrollAnimation>
          
          {/* Mobile: Compact Horizontal Scroll */}
          <div className="block sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              {[
                { number: "KSO", label: "Community" },
                { number: "Culture", label: "Show" },
                { number: "Coed IM", label: "Soccer" },
                { number: "AAPI", label: "Events" }
              ].map((stat, index) => (
                <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                  <div className="modern-card rounded-lg p-3 hover-lift shadow-lg text-center">
                    <div className="text-lg font-bold mb-1 text-black">{stat.number}</div>
                    <div className="text-gray-700 text-xs font-medium">{stat.label}</div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {[
              { number: "KSO", label: "Community" },
              { number: "Culture", label: "Show" },
              { number: "AAPI", label: "Events" },
              { number: "Alumni", label: "Network" },
            ].map((stat, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="modern-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover-lift shadow-lg">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-black">{stat.number}</div>
                  <div className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">{stat.label}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Social Media & Contact */}
      <section className="section-padding bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimation>
            <h2 className="section-title text-xl sm:text-2xl md:text-3xl lg:text-4xl text-black mb-4 sm:mb-6 lg:mb-8">Connect With Us</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-2xl mx-auto px-4">
              Stay updated with our latest events, announcements, and community highlights!
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Compact Horizontal Scroll */}
          <div className="block sm:hidden mb-6">
            <div className="flex justify-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {socialLinks.map((link, index) => (
                <ScrollAnimation key={link.name} className={`stagger-${index + 1} flex-shrink-0`}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-card flex flex-col items-center p-4 hover-lift hover-glow min-w-[80px]"
                  >
                    <span className="text-2xl mb-2 animate-float-fast hover-rotate">{link.icon}</span>
                    <span className="text-gray-700 font-semibold text-xs">{link.name}</span>
                  </a>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden sm:flex sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {socialLinks.map((link, index) => (
              <ScrollAnimation key={link.name} className={`stagger-${index + 1}`}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modern-card flex flex-col items-center p-6 sm:p-8 hover-lift hover-glow min-w-[100px] sm:min-w-[120px]"
                >
                  <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float-slow hover-rotate">{link.icon}</span>
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">{link.name}</span>
                </a>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
