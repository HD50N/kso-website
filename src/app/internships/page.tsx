'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Internship } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthPrompt from '@/components/AuthPrompt';

export default function InternshipsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Advanced filtering state
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterApplicationType, setFilterApplicationType] = useState<'all' | 'url' | 'contact'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [formError, setFormError] = useState<string>('');

  // Form state for adding internships
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    application_url: '',
    contact_email: '',
    contact_name: '',
    contact_linkedin: '',
    contact_phone: '',
  });
  const [hasApplicationUrl, setHasApplicationUrl] = useState(false);
  const [hasContactInfo, setHasContactInfo] = useState(false);

  const isBoardMember = profile?.user_type === 'board_member';

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching internships:', error);
        throw new Error('Failed to load internship opportunities');
      }

      setInternships((data as Internship[]) || []);
    } catch (error: any) {
      console.error('Error fetching internships:', error);
      setError(error.message || 'Failed to load internship opportunities');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInternships();
    }
  }, [user, fetchInternships]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (internship: Internship) => {
    if (!user || internship.posted_by !== user.id) return;
    
    setIsEditing(internship.id);
    setFormData({
      title: internship.title,
      company: internship.company,
      location: internship.location || '',
      description: internship.description || '',
      application_url: internship.application_url || '',
      contact_email: internship.contact_email || '',
      contact_name: internship.contact_name || '',
      contact_linkedin: internship.contact_linkedin || '',
      contact_phone: internship.contact_phone || '',
    });
    setHasApplicationUrl(!!internship.application_url);
    setHasContactInfo(!!(internship.contact_name || internship.contact_email));
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!user) return;

    // Validate that at least one application method is provided
    const hasUrl = formData.application_url.trim() !== '';
    const hasContact = formData.contact_name.trim() !== '' && formData.contact_email.trim() !== '';
    
    if (!hasUrl && !hasContact) {
      setFormError('Please provide either an Application URL or Contact Information (or both).');
      return;
    }
    
    // If contact info is partially filled, require both fields
    if ((formData.contact_name.trim() !== '' || formData.contact_email.trim() !== '') && !hasContact) {
      setFormError('Please provide both Contact Name and Contact Email, or leave both empty.');
      return;
    }

    try {
      if (isEditing) {
        // Update existing internship
        const { error } = await supabase
          .from('internships')
          .update({
            ...formData,
          })
          .eq('id', isEditing)
          .eq('posted_by', user.id); // Ensure user owns this posting

        if (error) {
          console.error('Error updating internship:', error);
          alert('Failed to update internship posting. Please try again.');
          return;
        }
      } else {
        // Create new internship
        const { data, error } = await supabase
          .from('internships')
          .insert({
            ...formData,
            posted_by: user.id,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating internship:', error);
          alert('Failed to create internship posting. Please try again.');
          return;
        }
      }

      // Reset form and close modal
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        application_url: '',
        contact_email: '',
        contact_name: '',
        contact_linkedin: '',
        contact_phone: '',
      });
      setHasApplicationUrl(false);
      setHasContactInfo(false);
      setFormError('');
      setIsAddModalOpen(false);
      setIsEditing(null);
      
      // Refresh the list
      fetchInternships();
    } catch (error: any) {
      console.error('Error saving internship:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} internship posting. Please try again.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship posting?')) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting internship:', error);
        alert('Failed to delete internship posting. Please try again.');
        return;
      }

      // Refresh the list
      fetchInternships();
    } catch (error: any) {
      console.error('Error deleting internship:', error);
      alert('Failed to delete internship posting. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Get unique values for filter dropdowns
  const uniqueCompanies = Array.from(new Set(internships.map(i => i.company).filter(Boolean))).sort();
  const uniqueLocations = Array.from(new Set(internships.map(i => i.location).filter(Boolean))).sort();
  const uniqueRoles = Array.from(new Set(internships.map(i => i.title).filter(Boolean))).sort();

  // Filter internships based on all criteria
  const filteredInternships = internships
    .filter((internship) => {
      // Search term filter (searches across multiple fields)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          internship.title.toLowerCase().includes(searchLower) ||
          internship.company.toLowerCase().includes(searchLower) ||
          (internship.location && internship.location.toLowerCase().includes(searchLower)) ||
          (internship.description && internship.description.toLowerCase().includes(searchLower)) ||
          (internship.contact_name && internship.contact_name.toLowerCase().includes(searchLower)) ||
          (internship.contact_email && internship.contact_email.toLowerCase().includes(searchLower)) ||
          (internship.contact_linkedin && internship.contact_linkedin.toLowerCase().includes(searchLower)) ||
          (internship.contact_phone && internship.contact_phone.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Company filter
      if (filterCompany && internship.company !== filterCompany) {
        return false;
      }

      // Location filter
      if (filterLocation) {
        if (!internship.location || !internship.location.toLowerCase().includes(filterLocation.toLowerCase())) {
          return false;
        }
      }

      // Role/Title filter
      if (filterRole && internship.title !== filterRole) {
        return false;
      }

      // Application type filter
      if (filterApplicationType !== 'all') {
        if (filterApplicationType === 'url' && !internship.application_url) {
          return false;
        }
        if (filterApplicationType === 'contact' && (!internship.contact_email || !internship.contact_name)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'company':
          return a.company.localeCompare(b.company);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Count active filters
  const activeFiltersCount = [
    filterCompany,
    filterLocation,
    filterRole,
    filterApplicationType !== 'all',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0 || searchTerm.trim() !== '';

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterCompany('');
    setFilterLocation('');
    setFilterRole('');
    setFilterApplicationType('all');
  };

  // Show loading only for auth
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Internship Opportunities"
        description="Access exclusive internship opportunities shared by KSO members and alumni. Sign in to view available positions."
        features={[
          "Discover internship opportunities from KSO network",
          "Connect with companies and organizations",
          "Access exclusive member-only postings",
          "Build your professional career path"
        ]}
        ctaText="Sign In to View Opportunities"
        ctaHref="/auth"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">Internship Opportunities</h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
            Explore internship opportunities shared by the KSO community
          </p>
        </div>
      </section>

      {/* Horizontal separator line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-300"></div>
      </div>

      {/* Internships Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            {/* Search Bar and Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by title, company, location, description, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 border-2 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                    showFilters || hasActiveFilters
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-white text-black rounded-full px-2 py-0.5 text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                {isBoardMember && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    + Add Opportunity
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Filter Options</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-600 hover:text-black underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Company Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role/Title Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      <option value="">All Roles</option>
                      {uniqueRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      placeholder="e.g., Remote, San Francisco..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Application Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Type
                    </label>
                    <select
                      value={filterApplicationType}
                      onChange={(e) => setFilterApplicationType(e.target.value as 'all' | 'url' | 'contact')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="url">Has Application URL</option>
                      <option value="contact">Has Contact Info</option>
                    </select>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['newest', 'oldest', 'company', 'title'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSortBy(option)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          sortBy === option
                            ? 'bg-black text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Filter Tags */}
            {hasActiveFilters && !showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterCompany && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    Company: {filterCompany}
                    <button
                      onClick={() => setFilterCompany('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterRole && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    Role: {filterRole}
                    <button
                      onClick={() => setFilterRole('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterLocation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    Location: {filterLocation}
                    <button
                      onClick={() => setFilterLocation('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filterApplicationType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 rounded-full text-sm">
                    Type: {filterApplicationType === 'url' ? 'Has URL' : 'Has Contact'}
                    <button
                      onClick={() => setFilterApplicationType('all')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredInternships.length} of {internships.length} opportunities
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-2 text-black hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <button
                onClick={() => fetchInternships()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          ) : filteredInternships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow flex flex-col"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-1">{internship.title}</h3>
                        <p className="text-lg text-gray-700 font-semibold">{internship.company}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {user && internship.posted_by === user.id && (
                          <button
                            onClick={() => handleEdit(internship)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit posting"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {isBoardMember && (
                          <button
                            onClick={() => handleDelete(internship.id)}
                            disabled={isDeleting === internship.id}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete posting"
                          >
                            {isDeleting === internship.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {internship.location && (
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {internship.location}
                      </p>
                    )}

                    {internship.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{internship.description}</p>
                    )}

                    {internship.contact_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Contact:</span> {internship.contact_name}
                      </p>
                    )}

                    {internship.contact_email && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Email:</span>{' '}
                        <a href={`mailto:${internship.contact_email}`} className="text-blue-600 hover:underline">
                          {internship.contact_email}
                        </a>
                      </p>
                    )}

                    {internship.contact_linkedin && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">LinkedIn:</span>{' '}
                        <a 
                          href={internship.contact_linkedin.startsWith('http') ? internship.contact_linkedin : `https://${internship.contact_linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {internship.contact_linkedin}
                        </a>
                      </p>
                    )}

                    {internship.contact_phone && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold">Phone:</span>{' '}
                        <a href={`tel:${internship.contact_phone}`} className="text-blue-600 hover:underline">
                          {internship.contact_phone}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {internship.application_url ? (
                      <a
                        href={internship.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Apply Now
                      </a>
                    ) : (
                      <div className="text-center text-sm text-gray-500">
                        Contact for application details
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-black mb-4">
                  {searchTerm ? 'No matching opportunities found' : 'No Opportunities Yet'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms.'
                    : 'Internship opportunities will be posted here. Check back soon for available positions shared by KSO members and alumni.'}
                </p>
                {!searchTerm && !isBoardMember && (
                  <p className="text-sm text-gray-500">
                    Have an internship opportunity to share? Contact the KSO board.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Add Internship Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">
                  {isEditing ? 'Edit Internship Opportunity' : 'Add Internship Opportunity'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditing(null);
                    setFormError('');
                    setHasApplicationUrl(false);
                    setHasContactInfo(false);
                  }}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    list="role-suggestions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., Software Engineering Intern"
                  />
                  <datalist id="role-suggestions">
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>
                  {uniqueRoles.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select from existing roles or type a new one
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    list="company-suggestions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., Google"
                  />
                  <datalist id="company-suggestions">
                    {uniqueCompanies.map((company) => (
                      <option key={company} value={company} />
                    ))}
                  </datalist>
                  {uniqueCompanies.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select from existing companies or type a new one
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    list="location-suggestions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                  <datalist id="location-suggestions">
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location} />
                    ))}
                  </datalist>
                  {uniqueLocations.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select from existing locations or type a new one
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Describe the internship opportunity..."
                  />
                </div>

                {/* Application Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How can applicants apply? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select at least one option. You can provide both if desired.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setHasApplicationUrl(!hasApplicationUrl);
                        if (hasApplicationUrl) {
                          setFormData(prev => ({ ...prev, application_url: '' }));
                        }
                        setFormError('');
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        hasApplicationUrl
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={hasApplicationUrl}
                          onChange={() => {}}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="font-semibold mb-1">Application URL</div>
                          <div className="text-xs opacity-80">Link to application page</div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasContactInfo(!hasContactInfo);
                        if (hasContactInfo) {
                          setFormData(prev => ({ ...prev, contact_email: '', contact_name: '' }));
                        }
                        setFormError('');
                      }}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        hasContactInfo
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-left flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={hasContactInfo}
                          onChange={() => {}}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="font-semibold mb-1">Contact Information</div>
                          <div className="text-xs opacity-80">Email and name</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Application URL Section */}
                {hasApplicationUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={formData.application_url}
                      onChange={(e) => {
                        handleInputChange('application_url', e.target.value);
                        setFormError('');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                      placeholder="https://company.com/apply"
                    />
                  </div>
                )}

                {/* Contact Information Section */}
                {hasContactInfo && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => {
                          handleInputChange('contact_name', e.target.value);
                          setFormError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => {
                          handleInputChange('contact_email', e.target.value);
                          setFormError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="text"
                        value={formData.contact_linkedin}
                        onChange={(e) => {
                          handleInputChange('contact_linkedin', e.target.value);
                          setFormError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        placeholder="e.g., linkedin.com/in/johndoe or https://linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => {
                          handleInputChange('contact_phone', e.target.value);
                          setFormError('');
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        placeholder="e.g., (555) 123-4567"
                      />
                    </div>
                  </div>
                )}

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditing(null);
                      setFormError('');
                      setHasApplicationUrl(false);
                      setHasContactInfo(false);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {isEditing ? 'Update Opportunity' : 'Post Opportunity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
