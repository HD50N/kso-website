'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [major, setMajor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Function to validate username availability
  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;
    
    setIsCheckingUsername(true);
    setUsernameError('');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        setIsCheckingUsername(false);
        return true;
      }
      
      // Username exists
      setUsernameError('This username is already taken');
      setIsCheckingUsername(false);
      return false;
    } catch (error) {
      console.error('Username validation error:', error);
      setIsCheckingUsername(false);
      return false;
    }
  };

  const handleUsernameBlur = async () => {
    if (username.trim()) {
      await validateUsername(username.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        // Validate all required fields for signup
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        if (username.trim().length < 3) {
          setError('Username must be at least 3 characters long');
          setLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
          setError('Username can only contain letters, numbers, and underscores');
          setLoading(false);
          return;
        }
        if (!graduationYear.trim()) {
          setError('Graduation year is required');
          setLoading(false);
          return;
        }
        const year = parseInt(graduationYear.trim());
        if (isNaN(year) || year < 1900 || year > 2100) {
          setError('Please enter a valid graduation year');
          setLoading(false);
          return;
        }
        if (!major.trim()) {
          setError('Major is required');
          setLoading(false);
          return;
        }
        
        // Check if username is available
        const isUsernameAvailable = await validateUsername(username.trim());
        if (!isUsernameAvailable) {
          setError('Username is already taken');
          setLoading(false);
          return;
        }
        
        await signUp(
          email, 
          password, 
          fullName.trim(), 
          username.trim(),
          year,
          major.trim(),
          undefined
        );
      }
      router.push('/profile');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Auth Section */}
      <section className="min-h-screen bg-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Soft gradient splotches */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Red gradient splotch */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-200 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-1/3 right-20 w-80 h-80 bg-red-300 rounded-full opacity-25 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-red-200 rounded-full opacity-20 blur-3xl"></div>
          
          {/* Blue gradient splotch */}
          <div className="absolute top-1/2 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-300 rounded-full opacity-25 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits & Information */}
            <div className="text-center lg:text-left">
                <div className="mb-8">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Korean Students Organization</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
                    {isLogin ? 'Welcome Back to KSO' : 'Join the KSO Community'}
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    {isLogin 
                      ? 'Sign in to access your profile and connect with fellow members'
                      : 'Become part of the Korean Students Organization at UChicago'
                    }
                  </p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">한국학생회</span> • Since 1976
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="space-y-6 mb-8">
                  <h2 className="text-2xl font-bold text-black mb-4">Why Join KSO?</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <h3 className="font-semibold text-black">Cultural Connection</h3>
                      </div>
                      <p className="text-sm text-gray-600">Connect with Korean culture through events, language exchange, and traditional celebrations</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <h3 className="font-semibold text-black">Professional Network</h3>
                      </div>
                      <p className="text-sm text-gray-600">Build connections with alumni and current students across different fields and industries</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <h3 className="font-semibold text-black">Leadership Opportunities</h3>
                      </div>
                      <p className="text-sm text-gray-600">Take on board positions and develop leadership skills through event planning and organization</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">4</span>
                        </div>
                        <h3 className="font-semibold text-black">Lifelong Community</h3>
                      </div>
                      <p className="text-sm text-gray-600">Stay connected with the KSO community even after graduation through our alumni network</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-black">1976</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">100+</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">50+</div>
                    <div className="text-sm text-gray-600">Events/Year</div>
                  </div>
                </div>
              </div>

            {/* Right Side - Auth Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Access your KSO profile' : 'Join our community today'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <>
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={!isLogin}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onBlur={handleUsernameBlur}
                          required={!isLogin}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Choose a username"
                        />
                        {isCheckingUsername && (
                          <p className="text-blue-600 text-xs mt-1">Checking username availability...</p>
                        )}
                        {usernameError && (
                          <p className="text-red-600 text-xs mt-1">{usernameError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Username can contain letters, numbers, and underscores. Must be at least 3 characters.
                        </p>
                      </div>
                      <div>
                        <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                          Graduation Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="graduationYear"
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          required={!isLogin}
                          min="1900"
                          max="2100"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="e.g., 2025"
                        />
                      </div>
                      <div>
                        <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                          Major <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="major"
                          type="text"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          required={!isLogin}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setUsernameError('');
                      setUsername('');
                      setFullName('');
                      setGraduationYear('');
                      setMajor('');
                    }}
                    className="text-black hover:text-gray-700 font-medium"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
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