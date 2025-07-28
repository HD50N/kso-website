'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function AuthDebugger() {
  const { user, profile, session, loading } = useAuth();

  useEffect(() => {
    console.log('AuthDebugger: State changed', {
      user: user?.id,
      profile: profile?.id,
      session: !!session,
      loading
    });
  }, [user, profile, session, loading]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-75 z-50">
      <div>Auth: {loading ? 'Loading' : user ? 'Logged In' : 'Not Logged In'}</div>
      <div>User: {user?.id?.slice(0, 8) || 'None'}</div>
      <div>Profile: {profile?.id?.slice(0, 8) || 'None'}</div>
    </div>
  );
} 