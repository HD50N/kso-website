'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { isAlumniClassYear, memberTypeLabel, type MemberType } from '@/lib/membership';
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
  const [memberType, setMemberType] = useState<MemberType>('undergrad');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const router = useRouter();

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
        setIsCheckingUsername(false);
        return true;
      }

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
      if (isForgot) {
        if (!email.trim()) { setError('Email address is required'); setLoading(false); return; }
        await requestPasswordReset(email);
        setResetSent(true);
        return;
      }

      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
        if (username.trim().length < 3) { setError('Username must be at least 3 characters long'); setLoading(false); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Username can only contain letters, numbers, and underscores'); setLoading(false); return; }
        if (!graduationYear.trim()) { setError('Graduation year is required'); setLoading(false); return; }
        const year = parseInt(graduationYear.trim());
        if (isNaN(year) || year < 1900 || year > 2100) { setError('Please enter a valid graduation year'); setLoading(false); return; }
        if (!major.trim()) { setError('Major is required'); setLoading(false); return; }

        const isUsernameAvailable = await validateUsername(username.trim());
        if (!isUsernameAvailable) { setError('Username is already taken'); setLoading(false); return; }

        await signUp(email, password, fullName.trim(), username.trim(), year, major.trim(), undefined, memberType);
      }
      router.push('/profile');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 bg-white text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors";
  const labelClass = "block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2";

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="border-b border-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">

            {/* Left — identity */}
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                Korean Students Organization · UChicago
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter mb-10">
                {isForgot ? (
                  <>Reset<br />Password</>
                ) : isLogin ? (
                  <>Welcome<br />Back</>
                ) : (
                  <>Join<br />KSO</>
                )}
              </h1>
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-base text-gray-500 leading-relaxed max-w-sm mb-10">
                {isForgot
                  ? 'Enter the email address on your account and we will send you a link to set a new password.'
                  : isLogin
                    ? 'Sign in to access your profile and connect with fellow members.'
                    : 'Become part of the Korean Students Organization at the University of Chicago.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 border border-gray-100 divide-x divide-gray-100">
                {[
                  { label: 'Founded', val: '1976' },
                  { label: 'Members', val: '100+' },
                  { label: 'Events/yr', val: '50+' },
                ].map((s) => (
                  <div key={s.label} className="py-6 px-4 text-center">
                    <div className="text-xl font-black text-black tracking-tight">{s.val}</div>
                    <div className="text-[10px] text-gray-400 tracking-[0.14em] uppercase font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-gray-600">한국 문화 동아리</span> · Est. 1976
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:pt-12">
              <div className="border border-gray-100 p-8 lg:p-10">
                <h2 className="text-xl font-black text-black tracking-tight mb-8">
                  {isForgot ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
                </h2>

                {isForgot && resetSent ? (
                  <div>
                    <div className="border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-sm text-black font-medium mb-1">Check your email</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        If an account exists for {email.trim()}, a password reset link is on its way.
                        The link expires in one hour.
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                      Open the link in this same browser. If nothing arrives, check your spam folder
                      and confirm you used the address you signed up with.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setIsForgot(false); setResetSent(false); setError(''); setPassword(''); }}
                      className="w-full border border-gray-200 text-black text-[10px] font-semibold tracking-[0.18em] uppercase py-4 hover:border-black transition-colors mt-6"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <>
                      <div>
                        <label htmlFor="fullName" className={labelClass}>
                          Full Name <span className="text-[#CD2E3A]">*</span>
                        </label>
                        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin} className={inputClass} placeholder="Enter your full name" />
                      </div>
                      <div>
                        <label htmlFor="username" className={labelClass}>
                          Username <span className="text-[#CD2E3A]">*</span>
                        </label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} onBlur={handleUsernameBlur} required={!isLogin} className={inputClass} placeholder="Choose a username" />
                        {isCheckingUsername && <p className="text-gray-400 text-xs mt-1.5">Checking availability...</p>}
                        {usernameError && <p className="text-[#CD2E3A] text-xs mt-1.5">{usernameError}</p>}
                        <p className="text-xs text-gray-400 mt-1.5">Letters, numbers, and underscores. Min. 3 characters.</p>
                      </div>
                      <div>
                        <label htmlFor="graduationYear" className={labelClass}>
                          Graduation Year <span className="text-[#CD2E3A]">*</span>
                        </label>
                        <input id="graduationYear" type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} required={!isLogin} min="1900" max="2100" className={inputClass} placeholder="e.g., 2026" />
                      </div>
                      <div>
                        <label htmlFor="major" className={labelClass}>
                          Major <span className="text-[#CD2E3A]">*</span>
                        </label>
                        <input id="major" type="text" value={major} onChange={(e) => setMajor(e.target.value)} required={!isLogin} className={inputClass} placeholder="e.g., Computer Science" />
                      </div>
                      <div>
                        <label htmlFor="memberType" className={labelClass}>
                          Member Type <span className="text-[#CD2E3A]">*</span>
                        </label>
                        <select
                          id="memberType"
                          value={isAlumniClassYear(parseInt(graduationYear)) ? 'alumni' : memberType}
                          onChange={(e) => setMemberType(e.target.value as MemberType)}
                          disabled={isAlumniClassYear(parseInt(graduationYear))}
                          className={inputClass}
                        >
                          <option value="undergrad">Undergraduate Student</option>
                          <option value="grad">Graduate Student</option>
                          <option value="alumni">Alumni</option>
                        </select>
                        {isAlumniClassYear(parseInt(graduationYear)) && (
                          <p className="text-xs text-gray-400 mt-1.5">
                            Class of {graduationYear} has graduated, so you&apos;ll join as{' '}
                            {memberTypeLabel(null, parseInt(graduationYear))}.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address <span className="text-[#CD2E3A]">*</span>
                    </label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="Enter your email" />
                  </div>

                  {!isForgot && (
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password <span className="text-[#CD2E3A]">*</span>
                      </label>
                      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isForgot} className={inputClass} placeholder="Enter your password" />
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => { setIsForgot(true); setError(''); setPassword(''); }}
                          className="text-xs text-gray-400 hover:text-black transition-colors mt-2"
                        >
                          Forgot your password?
                        </button>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3">
                      <p className="text-[#CD2E3A] text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Loading...' : isForgot ? 'Send reset link' : isLogin ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      if (isForgot) {
                        setIsForgot(false);
                        setResetSent(false);
                        setError('');
                        return;
                      }
                      setIsLogin(!isLogin);
                      setError('');
                      setUsernameError('');
                      setUsername('');
                      setFullName('');
                      setGraduationYear('');
                      setMajor('');
                      setMemberType('undergrad');
                    }}
                    className="text-sm text-gray-400 hover:text-black transition-colors"
                  >
                    {isForgot
                      ? 'Back to sign in'
                      : isLogin
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Sign in'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
