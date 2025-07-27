'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Forms() {
  const [activeForm, setActiveForm] = useState('membership');
  const [membershipForm, setMembershipForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    year: '',
    major: '',
    interests: [] as string[],
    experience: '',
    whyJoin: ''
  });

  const [committeeForm, setCommitteeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    year: '',
    committee: '',
    experience: '',
    availability: '',
    motivation: ''
  });

  const [volunteerForm, setVolunteerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    event: '',
    availability: '',
    skills: '',
    experience: ''
  });

  const committees = [
    'Culture Show Committee',
    'Social Events Committee',
    'Professional Development Committee',
    'Cultural Education Committee',
    'Marketing & Publicity Committee',
    'Finance Committee'
  ];

  const interests = [
    'Korean Culture & Heritage',
    'K-pop & Modern Korean Music',
    'Traditional Korean Arts',
    'Korean Language Learning',
    'Community Building',
    'Event Planning',
    'Leadership Development',
    'Professional Networking',
    'Cultural Exchange',
    'Performance Arts'
  ];

  const events = [
    'Culture Show 2024',
    'Korean Language Exchange',
    'K-pop Dance Workshop',
    'Cultural Food Festival',
    'Professional Networking Event',
    'Korean Movie Night',
    'Other (specify below)'
  ];

  const handleMembershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your membership application! We will contact you soon.');
    setMembershipForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      year: '',
      major: '',
      interests: [],
      experience: '',
      whyJoin: ''
    });
  };

  const handleCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your committee application! We will review and get back to you.');
    setCommitteeForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      year: '',
      committee: '',
      experience: '',
      availability: '',
      motivation: ''
    });
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for volunteering! We will contact you with details.');
    setVolunteerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      event: '',
      availability: '',
      skills: '',
      experience: ''
    });
  };

  const toggleInterest = (interest: string) => {
    setMembershipForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-korean-gradient text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join KSO</h1>
          <p className="text-xl text-red-100">
            Become part of our vibrant Korean community at the University of Chicago
          </p>
        </div>
      </section>

      {/* Form Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setActiveForm('membership')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeForm === 'membership'
                  ? 'bg-korean-red text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              General Membership
            </button>
            <button
              onClick={() => setActiveForm('committee')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeForm === 'committee'
                  ? 'bg-korean-red text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Join Committee
            </button>
            <button
              onClick={() => setActiveForm('volunteer')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeForm === 'volunteer'
                  ? 'bg-korean-red text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* Membership Form */}
      {activeForm === 'membership' && (
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">General Membership Application</h2>
            <form onSubmit={handleMembershipSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={membershipForm.firstName}
                    onChange={(e) => setMembershipForm({...membershipForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={membershipForm.lastName}
                    onChange={(e) => setMembershipForm({...membershipForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={membershipForm.email}
                    onChange={(e) => setMembershipForm({...membershipForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={membershipForm.phone}
                    onChange={(e) => setMembershipForm({...membershipForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    id="year"
                    required
                    value={membershipForm.year}
                    onChange={(e) => setMembershipForm({...membershipForm, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Year</option>
                    <option value="2024">Class of 2024</option>
                    <option value="2025">Class of 2025</option>
                    <option value="2026">Class of 2026</option>
                    <option value="2027">Class of 2027</option>
                    <option value="Graduate">Graduate Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                    Major/Program
                  </label>
                  <input
                    type="text"
                    id="major"
                    value={membershipForm.major}
                    onChange={(e) => setMembershipForm({...membershipForm, major: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Areas of Interest (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {interests.map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={membershipForm.interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="mr-2 korean-red focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Experience (Optional)
                </label>
                <textarea
                  id="experience"
                  rows={3}
                  value={membershipForm.experience}
                  onChange={(e) => setMembershipForm({...membershipForm, experience: e.target.value})}
                  placeholder="Any relevant experience with Korean culture, student organizations, or event planning?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="whyJoin" className="block text-sm font-medium text-gray-700 mb-1">
                  Why do you want to join KSO? *
                </label>
                <textarea
                  id="whyJoin"
                  rows={4}
                  required
                  value={membershipForm.whyJoin}
                  onChange={(e) => setMembershipForm({...membershipForm, whyJoin: e.target.value})}
                  placeholder="Tell us about your interest in joining KSO and what you hope to contribute to our community."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-korean-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Submit Membership Application
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Committee Form */}
      {activeForm === 'committee' && (
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Committee Application</h2>
            <form onSubmit={handleCommitteeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="committeeFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="committeeFirstName"
                    required
                    value={committeeForm.firstName}
                    onChange={(e) => setCommitteeForm({...committeeForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="committeeLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="committeeLastName"
                    required
                    value={committeeForm.lastName}
                    onChange={(e) => setCommitteeForm({...committeeForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="committeeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="committeeEmail"
                    required
                    value={committeeForm.email}
                    onChange={(e) => setCommitteeForm({...committeeForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="committeePhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="committeePhone"
                    value={committeeForm.phone}
                    onChange={(e) => setCommitteeForm({...committeeForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="committeeYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    id="committeeYear"
                    required
                    value={committeeForm.year}
                    onChange={(e) => setCommitteeForm({...committeeForm, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Year</option>
                    <option value="2024">Class of 2024</option>
                    <option value="2025">Class of 2025</option>
                    <option value="2026">Class of 2026</option>
                    <option value="2027">Class of 2027</option>
                    <option value="Graduate">Graduate Student</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="committee" className="block text-sm font-medium text-gray-700 mb-1">
                    Committee of Interest *
                  </label>
                  <select
                    id="committee"
                    required
                    value={committeeForm.committee}
                    onChange={(e) => setCommitteeForm({...committeeForm, committee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Committee</option>
                    {committees.map((committee) => (
                      <option key={committee} value={committee}>{committee}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="committeeExperience" className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Experience
                </label>
                <textarea
                  id="committeeExperience"
                  rows={3}
                  value={committeeForm.experience}
                  onChange={(e) => setCommitteeForm({...committeeForm, experience: e.target.value})}
                  placeholder="Describe any relevant experience you have for this committee."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability *
                </label>
                <textarea
                  id="availability"
                  rows={3}
                  required
                  value={committeeForm.availability}
                  onChange={(e) => setCommitteeForm({...committeeForm, availability: e.target.value})}
                  placeholder="Describe your availability for committee meetings and events."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
                  Why this committee? *
                </label>
                <textarea
                  id="motivation"
                  rows={4}
                  required
                  value={committeeForm.motivation}
                  onChange={(e) => setCommitteeForm({...committeeForm, motivation: e.target.value})}
                  placeholder="Why are you interested in joining this specific committee?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-korean-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Submit Committee Application
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Volunteer Form */}
      {activeForm === 'volunteer' && (
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Volunteer Application</h2>
            <form onSubmit={handleVolunteerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="volunteerFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="volunteerFirstName"
                    required
                    value={volunteerForm.firstName}
                    onChange={(e) => setVolunteerForm({...volunteerForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="volunteerLastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="volunteerLastName"
                    required
                    value={volunteerForm.lastName}
                    onChange={(e) => setVolunteerForm({...volunteerForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="volunteerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="volunteerEmail"
                    required
                    value={volunteerForm.email}
                    onChange={(e) => setVolunteerForm({...volunteerForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="volunteerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="volunteerPhone"
                    value={volunteerForm.phone}
                    onChange={(e) => setVolunteerForm({...volunteerForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                  Event to Volunteer For *
                </label>
                <select
                  id="event"
                  required
                  value={volunteerForm.event}
                  onChange={(e) => setVolunteerForm({...volunteerForm, event: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Event</option>
                  {events.map((event) => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="volunteerAvailability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability *
                </label>
                <textarea
                  id="volunteerAvailability"
                  rows={3}
                  required
                  value={volunteerForm.availability}
                  onChange={(e) => setVolunteerForm({...volunteerForm, availability: e.target.value})}
                  placeholder="When are you available to volunteer?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Skills & Interests
                </label>
                <textarea
                  id="skills"
                  rows={3}
                  value={volunteerForm.skills}
                  onChange={(e) => setVolunteerForm({...volunteerForm, skills: e.target.value})}
                  placeholder="What skills or interests do you have that could be helpful?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="volunteerExperience" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Volunteer Experience
                </label>
                <textarea
                  id="volunteerExperience"
                  rows={3}
                  value={volunteerForm.experience}
                  onChange={(e) => setVolunteerForm({...volunteerForm, experience: e.target.value})}
                  placeholder="Any previous volunteer or event planning experience?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-korean-red text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Submit Volunteer Application
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions?</h2>
          <p className="text-lg text-gray-700 mb-8">
            If you have any questions about joining KSO or need help with your application, 
            don't hesitate to reach out to us!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:kso@uchicago.edu"
              className="bg-korean-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Email Us
            </a>
            <a 
              href="https://instagram.com/kso_uchicago"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-korean-red korean-red px-8 py-3 rounded-lg font-semibold hover:bg-korean-red hover:text-white transition-colors"
            >
              Follow Us on Instagram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 