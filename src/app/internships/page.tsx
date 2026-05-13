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

  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterApplicationType, setFilterApplicationType] = useState<'all' | 'url' | 'contact'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company' | 'title'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [formError, setFormError] = useState<string>('');

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
      if (error) throw new Error('Failed to load internship opportunities');
      setInternships((data as Internship[]) || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load internship opportunities');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) { fetchInternships(); } }, [user, fetchInternships]);

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

    const hasUrl = formData.application_url.trim() !== '';
    const hasContact = formData.contact_name.trim() !== '' && formData.contact_email.trim() !== '';
    if (!hasUrl && !hasContact) { setFormError('Please provide either an Application URL or Contact Information (or both).'); return; }
    if ((formData.contact_name.trim() !== '' || formData.contact_email.trim() !== '') && !hasContact) { setFormError('Please provide both Contact Name and Contact Email, or leave both empty.'); return; }

    try {
      if (isEditing) {
        const { error } = await supabase.from('internships').update({ ...formData }).eq('id', isEditing).eq('posted_by', user.id);
        if (error) { alert('Failed to update internship posting. Please try again.'); return; }
      } else {
        const { error } = await supabase.from('internships').insert({ ...formData, posted_by: user.id }).select().single();
        if (error) { alert('Failed to create internship posting. Please try again.'); return; }
      }
      setFormData({ title: '', company: '', location: '', description: '', application_url: '', contact_email: '', contact_name: '', contact_linkedin: '', contact_phone: '' });
      setHasApplicationUrl(false);
      setHasContactInfo(false);
      setFormError('');
      setIsAddModalOpen(false);
      setIsEditing(null);
      fetchInternships();
    } catch (error: any) {
      alert(`Failed to ${isEditing ? 'update' : 'create'} internship posting. Please try again.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship posting?')) return;
    setIsDeleting(id);
    try {
      const { error } = await supabase.from('internships').delete().eq('id', id);
      if (error) { alert('Failed to delete internship posting. Please try again.'); return; }
      fetchInternships();
    } catch (error: any) {
      alert('Failed to delete internship posting. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const uniqueCompanies = Array.from(new Set(internships.map(i => i.company).filter(Boolean))).sort();
  const uniqueLocations = Array.from(new Set(internships.map(i => i.location).filter(Boolean))).sort();
  const uniqueRoles = Array.from(new Set(internships.map(i => i.title).filter(Boolean))).sort();

  const filteredInternships = internships
    .filter((internship) => {
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          internship.title.toLowerCase().includes(searchLower) ||
          internship.company.toLowerCase().includes(searchLower) ||
          (internship.location && internship.location.toLowerCase().includes(searchLower)) ||
          (internship.description && internship.description.toLowerCase().includes(searchLower)) ||
          (internship.contact_name && internship.contact_name.toLowerCase().includes(searchLower)) ||
          (internship.contact_email && internship.contact_email.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      if (filterCompany && internship.company !== filterCompany) return false;
      if (filterLocation && (!internship.location || !internship.location.toLowerCase().includes(filterLocation.toLowerCase()))) return false;
      if (filterRole && internship.title !== filterRole) return false;
      if (filterApplicationType !== 'all') {
        if (filterApplicationType === 'url' && !internship.application_url) return false;
        if (filterApplicationType === 'contact' && (!internship.contact_email || !internship.contact_name)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'company': return a.company.localeCompare(b.company);
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const activeFiltersCount = [filterCompany, filterLocation, filterRole, filterApplicationType !== 'all'].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0 || searchTerm.trim() !== '';
  const clearAllFilters = () => { setSearchTerm(''); setFilterCompany(''); setFilterLocation(''); setFilterRole(''); setFilterApplicationType('all'); };

  const inputClass = "px-4 py-2.5 border border-gray-200 bg-white text-sm text-black focus:outline-none focus:border-black transition-colors";
  const modalInputClass = "w-full px-4 py-3 border border-gray-200 bg-white text-sm text-black focus:outline-none focus:border-black transition-colors";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                KSO Network
              </p>
              <h1 className="text-[3rem] sm:text-[4.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-black text-black leading-[0.87] tracking-tighter">
                Internships
              </h1>
            </div>
            <div className="lg:pt-20">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Opportunities shared by members and alumni — for the whole community.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Explore internship opportunities shared by the KSO community. Board members can post new roles; everyone can search and filter listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">

          {/* Search + actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-white text-sm text-black focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                showFilters || hasActiveFilters ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-black text-[9px] font-black px-1.5 py-0.5">{activeFiltersCount}</span>
              )}
            </button>
            {isBoardMember && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2.5 bg-[#CD2E3A] text-white text-[10px] font-semibold tracking-[0.14em] uppercase hover:bg-[#b02633] transition-colors whitespace-nowrap"
              >
                + Add Opportunity
              </button>
            )}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="border border-gray-100 p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium">Filter Options</p>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-[10px] tracking-[0.14em] uppercase text-gray-400 hover:text-black transition-colors">
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className={inputClass}>
                  <option value="">All Companies</option>
                  {uniqueCompanies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className={inputClass}>
                  <option value="">All Roles</option>
                  {uniqueRoles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <input type="text" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} placeholder="Location..." className={inputClass} />
                <select value={filterApplicationType} onChange={(e) => setFilterApplicationType(e.target.value as 'all' | 'url' | 'contact')} className={inputClass}>
                  <option value="all">All Types</option>
                  <option value="url">Has URL</option>
                  <option value="contact">Has Contact</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {(['newest', 'oldest', 'company', 'title'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-4 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase border transition-colors ${
                      sortBy === option ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                searchTerm && { label: `"${searchTerm}"`, clear: () => setSearchTerm('') },
                filterCompany && { label: filterCompany, clear: () => setFilterCompany('') },
                filterRole && { label: filterRole, clear: () => setFilterRole('') },
                filterLocation && { label: filterLocation, clear: () => setFilterLocation('') },
                filterApplicationType !== 'all' && { label: filterApplicationType === 'url' ? 'Has URL' : 'Has Contact', clear: () => setFilterApplicationType('all') },
              ].filter(Boolean).map((tag: any, i) => (
                <span key={i} className="inline-flex items-center gap-2 border border-gray-200 px-3 py-1 text-xs text-gray-600">
                  {tag.label}
                  <button onClick={tag.clear} className="text-gray-400 hover:text-black transition-colors">×</button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-[10px] tracking-[0.14em] uppercase text-gray-400 hover:text-black transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Count */}
          <p className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-medium mb-8">
            {filteredInternships.length} of {internships.length} opportunities
          </p>

          {/* Error */}
          {error && !loading && (
            <div className="border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3 mb-6 flex items-center justify-between">
              <p className="text-[#CD2E3A] text-sm">{error}</p>
              <button onClick={() => fetchInternships()} className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#CD2E3A] hover:text-black transition-colors">Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading opportunities...</p>
            </div>
          ) : filteredInternships.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredInternships.map((internship, index) => (
                <div key={internship.id} className="flex flex-col sm:flex-row sm:items-start gap-6 py-8 hover:bg-gray-50 -mx-2 px-2 transition-colors">
                  <div className="flex-shrink-0 w-20 pt-0.5">
                    <span className="text-gray-200 text-[10px] font-mono tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">{internship.title}</h3>
                        <p className="text-sm text-gray-500 font-medium">{internship.company}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {user && internship.posted_by === user.id && (
                          <button onClick={() => handleEdit(internship)} className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {isBoardMember && (
                          <button onClick={() => handleDelete(internship.id)} disabled={isDeleting === internship.id} className="p-1.5 text-gray-400 hover:text-[#CD2E3A] transition-colors disabled:opacity-50" title="Delete">
                            {isDeleting === internship.id ? (
                              <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {internship.location && (
                      <p className="text-xs text-[#CD2E3A] tracking-[0.1em] uppercase font-semibold mb-2">{internship.location}</p>
                    )}
                    {internship.description && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-3">{internship.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {internship.contact_name && <span><span className="text-gray-400">Contact:</span> {internship.contact_name}</span>}
                      {internship.contact_email && (
                        <a href={`mailto:${internship.contact_email}`} className="text-black underline underline-offset-2 hover:no-underline">
                          {internship.contact_email}
                        </a>
                      )}
                      {internship.contact_linkedin && (
                        <a href={internship.contact_linkedin.startsWith('http') ? internship.contact_linkedin : `https://${internship.contact_linkedin}`} target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 hover:no-underline">
                          LinkedIn
                        </a>
                      )}
                      {internship.contact_phone && (
                        <a href={`tel:${internship.contact_phone}`} className="text-black underline underline-offset-2 hover:no-underline">{internship.contact_phone}</a>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:w-32">
                    {internship.application_url ? (
                      <a
                        href={internship.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full border border-gray-200 px-4 py-3 hover:border-black hover:bg-black group transition-colors"
                      >
                        <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-black group-hover:text-white transition-colors">Apply</span>
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Via contact</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm mb-2">
                {searchTerm ? 'No matching opportunities found.' : 'No opportunities posted yet.'}
              </p>
              {!searchTerm && !isBoardMember && (
                <p className="text-xs text-gray-300">Have an opportunity to share? Contact the KSO board.</p>
              )}
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="mt-4 text-[10px] tracking-[0.14em] uppercase text-black underline underline-offset-2 hover:no-underline">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-black tracking-tight">
                  {isEditing ? 'Edit Opportunity' : 'Add Opportunity'}
                </h2>
                <button
                  onClick={() => { setIsAddModalOpen(false); setIsEditing(null); setFormError(''); setHasApplicationUrl(false); setHasContactInfo(false); }}
                  className="p-1.5 text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">Job Title <span className="text-[#CD2E3A]">*</span></label>
                  <input type="text" required value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} list="role-suggestions" className={modalInputClass} placeholder="e.g., Software Engineering Intern" />
                  <datalist id="role-suggestions">{uniqueRoles.map((r) => <option key={r} value={r} />)}</datalist>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">Company <span className="text-[#CD2E3A]">*</span></label>
                  <input type="text" required value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} list="company-suggestions" className={modalInputClass} placeholder="e.g., Google" />
                  <datalist id="company-suggestions">{uniqueCompanies.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} list="location-suggestions" className={modalInputClass} placeholder="e.g., San Francisco, CA or Remote" />
                  <datalist id="location-suggestions">{uniqueLocations.map((l) => <option key={l} value={l} />)}</datalist>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} className={modalInputClass} placeholder="Describe the internship opportunity..." />
                </div>

                {/* Application method */}
                <div>
                  <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-3">How can applicants apply? <span className="text-[#CD2E3A]">*</span></label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => { setHasApplicationUrl(!hasApplicationUrl); if (hasApplicationUrl) setFormData(prev => ({ ...prev, application_url: '' })); setFormError(''); }}
                      className={`p-4 border-2 text-left transition-colors ${hasApplicationUrl ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      <div className="text-xs font-semibold mb-0.5">Application URL</div>
                      <div className="text-[10px] opacity-70">Link to application page</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setHasContactInfo(!hasContactInfo); if (hasContactInfo) setFormData(prev => ({ ...prev, contact_email: '', contact_name: '' })); setFormError(''); }}
                      className={`p-4 border-2 text-left transition-colors ${hasContactInfo ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      <div className="text-xs font-semibold mb-0.5">Contact Information</div>
                      <div className="text-[10px] opacity-70">Email and name</div>
                    </button>
                  </div>
                </div>

                {hasApplicationUrl && (
                  <div className="bg-gray-50 p-4 border border-gray-100">
                    <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">Application URL</label>
                    <input type="url" value={formData.application_url} onChange={(e) => { handleInputChange('application_url', e.target.value); setFormError(''); }} className={modalInputClass} placeholder="https://company.com/apply" />
                  </div>
                )}

                {hasContactInfo && (
                  <div className="bg-gray-50 p-4 border border-gray-100 space-y-3">
                    {[
                      { field: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'e.g., John Doe' },
                      { field: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'contact@company.com' },
                      { field: 'contact_linkedin', label: 'LinkedIn Profile', type: 'text', placeholder: 'linkedin.com/in/johndoe' },
                      { field: 'contact_phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
                    ].map(({ field, label, type, placeholder }) => (
                      <div key={field}>
                        <label className="block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2">{label}</label>
                        <input type={type} value={(formData as any)[field]} onChange={(e) => { handleInputChange(field, e.target.value); setFormError(''); }} className={modalInputClass} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                )}

                {formError && (
                  <div className="border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3">
                    <p className="text-[#CD2E3A] text-sm">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditing(null); setFormError(''); setHasApplicationUrl(false); setHasContactInfo(false); }} className="px-6 py-2.5 border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-black text-white text-[10px] font-semibold tracking-[0.14em] uppercase hover:bg-gray-800 transition-colors">
                    {isEditing ? 'Update' : 'Post Opportunity'}
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
