'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting to sign up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }
      
      console.log('Auth signup successful:', data);
      
      // Create profile after successful signup
      if (data.user) {
        console.log('Creating profile for user:', data.user.id);
        
                            const { error: profileError } = await supabase
                      .from('profiles')
                      .insert({
                        user_id: data.user.id,
                        full_name: fullName,
                        is_admin: false,
                        username: null, // Will be set later in profile
                      });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw error here as user is already created
        } else {
          console.log('Profile created successfully');
        }
      }
    } catch (error) {
      console.error('Signup process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    console.log('Updating profile for user:', user.id);
    console.log('Updates:', updates);

    // Add timeout and retry logic
    const maxRetries = 3;
    const timeoutMs = 10000; // 10 seconds timeout

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Profile update attempt ${attempt}/${maxRetries}`);

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        // Create the update promise
        const updatePromise = supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select();

        // Race between timeout and update
        const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) {
          console.error(`Error updating profile (attempt ${attempt}):`, error);
          
          // If it's a network error or timeout, retry
          if (attempt < maxRetries && (
            error.message?.includes('timeout') ||
            error.message?.includes('network') ||
            error.code === 'PGRST301' || // Supabase timeout
            error.code === 'PGRST302'    // Supabase connection error
          )) {
            console.log(`Retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
          
          throw error;
        }

        console.log('Profile updated successfully:', data);
        
        // Refresh profile
        await fetchProfile(user.id);
        return; // Success, exit retry loop

      } catch (error: any) {
        console.error(`Profile update failed (attempt ${attempt}):`, error);
        
        if (attempt === maxRetries) {
          // Final attempt failed
          if (error.message?.includes('timeout')) {
            throw new Error('Request timed out. Please check your connection and try again.');
          } else if (error.message?.includes('network')) {
            throw new Error('Network error. Please check your connection and try again.');
          } else {
            throw error;
          }
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 