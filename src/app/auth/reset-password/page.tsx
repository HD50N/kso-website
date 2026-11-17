'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const MIN_PASSWORD_LENGTH = 8;

type Stage = 'verifying' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [stage, setStage] = useState<Stage>('verifying');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Turn whatever the recovery email linked to into a usable session.
   *
   * The Supabase client is configured with `detectSessionInUrl: false`, so none
   * of this happens automatically — we have to read the URL ourselves. Which
   * shape arrives depends on the project's flow and email template, so handle
   * all of them rather than betting on one.
   */
  const establishRecoverySession = useCallback(async () => {
    const url = new URL(window.location.href);
    const query = url.searchParams;
    // The implicit flow returns tokens in the fragment, not the query string.
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));

    const described = query.get('error_description') || hash.get('error_description');
    const errored = query.get('error') || hash.get('error');
    if (described || errored) {
      return { ok: false, message: described || 'This reset link is no longer valid.' };
    }

    const clearUrl = () =>
      window.history.replaceState({}, '', `${window.location.origin}${window.location.pathname}`);

    try {
      // PKCE: ?code=<auth code>
      const code = query.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          return {
            ok: false,
            message:
              'This reset link could not be verified. Reset links must be opened in the same browser that requested them — please request a new one from this browser.',
          };
        }
        clearUrl();
        return { ok: true };
      }

      // Implicit: #access_token=...&refresh_token=...
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) return { ok: false, message: 'This reset link has expired. Please request a new one.' };
        clearUrl();
        return { ok: true };
      }

      // Token hash: ?token_hash=...&type=recovery
      const tokenHash = query.get('token_hash') || query.get('token');
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (error) return { ok: false, message: 'This reset link has expired. Please request a new one.' };
        clearUrl();
        return { ok: true };
      }

      // No token in the URL: only allow this if they are already signed in,
      // so the page cannot be used to change a stranger's password.
      const { data } = await supabase.auth.getSession();
      if (data.session) return { ok: true };

      return {
        ok: false,
        message: 'This page needs a valid password reset link. Request one from the sign in page.',
      };
    } catch (err: any) {
      console.error('Recovery session error:', err);
      return { ok: false, message: 'We could not verify this reset link. Please request a new one.' };
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await establishRecoverySession();
      if (!active) return;
      if (result.ok) {
        setStage('ready');
      } else {
        setLinkError(result.message || 'This reset link is not valid.');
        setStage('invalid');
      }
    })();
    return () => { active = false; };
  }, [establishRecoverySession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return;
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setStage('done');
      setTimeout(() => router.push('/profile'), 1800);
    } catch (err: any) {
      console.error('Password update failed:', err);
      if (err.message?.toLowerCase().includes('same')) {
        setError('That is already your current password. Please choose a different one.');
      } else if (err.message?.toLowerCase().includes('session')) {
        setError('Your reset link expired before you finished. Please request a new one.');
      } else {
        setError(err.message || 'We could not update your password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 bg-white text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors';
  const labelClass =
    'block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2';

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
                New<br />Password
              </h1>
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-base text-gray-500 leading-relaxed max-w-sm">
                Choose a new password for your KSO account. You will stay signed in on this device
                once it is saved.
              </p>
            </div>

            {/* Right — form */}
            <div className="lg:pt-12">
              <div className="border border-gray-100 p-8 lg:p-10">
                <h2 className="text-xl font-black text-black tracking-tight mb-8">
                  Set a New Password
                </h2>

                {stage === 'verifying' && (
                  <p className="text-sm text-gray-500">Verifying your reset link…</p>
                )}

                {stage === 'invalid' && (
                  <div>
                    <div className="border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3">
                      <p className="text-[#CD2E3A] text-sm leading-relaxed">{linkError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/auth')}
                      className="w-full bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase py-4 hover:bg-gray-800 transition-colors mt-6"
                    >
                      Back to sign in
                    </button>
                  </div>
                )}

                {stage === 'done' && (
                  <div>
                    <div className="border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-sm text-black font-medium mb-1">Password updated</p>
                      <p className="text-sm text-gray-500">Taking you to your profile…</p>
                    </div>
                  </div>
                )}

                {stage === 'ready' && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        New Password <span className="text-[#CD2E3A]">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className={inputClass}
                        placeholder="Enter a new password"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        At least {MIN_PASSWORD_LENGTH} characters.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className={labelClass}>
                        Confirm Password <span className="text-[#CD2E3A]">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className={inputClass}
                        placeholder="Re-enter the new password"
                      />
                    </div>

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
                      {loading ? 'Saving...' : 'Save new password'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
