'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CultureShow() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set the target date for the culture show (April 15, 2024)
  const targetDate = new Date('2024-04-15T19:00:00').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pastHighlights = [
    {
      year: "2023",
      title: "Harmony: Bridging Cultures",
      description: "A spectacular showcase featuring traditional Korean dance, modern K-pop performances, and cultural fusion acts.",
      image: "/placeholder-2023.jpg",
      performers: "150+ performers"
    },
    {
      year: "2022",
      title: "Roots & Wings",
      description: "Celebrating Korean heritage while embracing modern expressions of culture and identity.",
      image: "/placeholder-2022.jpg",
      performers: "120+ performers"
    },
    {
      year: "2021",
      title: "Digital Dreams",
      description: "Our first virtual culture show, bringing Korean culture to screens around the world.",
      image: "/placeholder-2021.jpg",
      performers: "100+ performers"
    }
  ];

  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    email: '',
    guests: '1',
    dietary: '',
    comments: ''
  });

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle RSVP submission here
    alert('Thank you for your RSVP! We will send you a confirmation email shortly.');
    setRsvpForm({
      name: '',
      email: '',
      guests: '1',
      dietary: '',
      comments: ''
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-korean-gradient text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">KSO Culture Show 2024</h1>
          <p className="text-xl md:text-2xl mb-8 text-white">
            "Celebrating 48 Years of Korean Culture"
          </p>
          <p className="text-lg text-white mb-8">
            April 15, 2024 • 7:00 PM • Mandel Hall
          </p>
        </div>
      </section>

      {/* Countdown Timer */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Countdown to the Show</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-korean-red rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">{timeLeft.days}</div>
              <div className="text-white opacity-90">Days</div>
            </div>
            <div className="bg-korean-red rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">{timeLeft.hours}</div>
              <div className="text-white opacity-90">Hours</div>
            </div>
            <div className="bg-korean-red rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">{timeLeft.minutes}</div>
              <div className="text-white opacity-90">Minutes</div>
            </div>
            <div className="bg-korean-red rounded-lg p-6">
              <div className="text-4xl font-bold mb-2">{timeLeft.seconds}</div>
              <div className="text-white opacity-90">Seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Details</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Date & Time</h3>
                  <p className="text-gray-600">Monday, April 15, 2024 at 7:00 PM</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">Mandel Hall<br />University of Chicago<br />1131 E 57th St, Chicago, IL 60637</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Admission</h3>
                  <p className="text-gray-600">Free for UChicago students<br />$10 for general admission</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">What to Expect</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Traditional Korean dance performances</li>
                    <li>• Modern K-pop dance covers</li>
                    <li>• Korean music and singing</li>
                    <li>• Cultural fashion show</li>
                    <li>• Korean food and refreshments</li>
                    <li>• Community celebration</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">RSVP</h2>
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={rsvpForm.name}
                    onChange={(e) => setRsvpForm({...rsvpForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={rsvpForm.email}
                    onChange={(e) => setRsvpForm({...rsvpForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    value={rsvpForm.guests}
                    onChange={(e) => setRsvpForm({...rsvpForm, guests: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    id="dietary"
                    value={rsvpForm.dietary}
                    onChange={(e) => setRsvpForm({...rsvpForm, dietary: e.target.value})}
                    placeholder="Any dietary restrictions or allergies?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    id="comments"
                    rows={3}
                    value={rsvpForm.comments}
                    onChange={(e) => setRsvpForm({...rsvpForm, comments: e.target.value})}
                    placeholder="Any special requests or questions?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-korean-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  RSVP for Culture Show
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Past Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Past Culture Shows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pastHighlights.map((highlight, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-korean-gradient-gold flex items-center justify-center">
                  <span className="text-white text-4xl">🎭</span>
                </div>
                <div className="p-6">
                  <div className="korean-red font-bold mb-2">{highlight.year}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{highlight.title}</h3>
                  <p className="text-gray-600 mb-4">{highlight.description}</p>
                  <div className="text-sm text-gray-500">{highlight.performers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-korean-red text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Be Part of the Show</h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Want to perform, volunteer, or help organize this year's Culture Show? 
            We'd love to have you join our team!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <a 
                href="/forms"
                className="bg-white korean-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Join the Team
              </a>
              <a 
                href="mailto:kso@uchicago.edu"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:korean-red transition-colors"
              >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 