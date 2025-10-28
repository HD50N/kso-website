'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SpotifyContextType {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for tokens in URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('spotify_token');
    const refresh = urlParams.get('spotify_refresh');
    const expires = urlParams.get('spotify_expires');

    if (token && refresh && expires) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setExpiresIn(parseInt(expires));
      setIsAuthenticated(true);

      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', token);
      localStorage.setItem('spotify_refresh_token', refresh);
      localStorage.setItem('spotify_expires_in', expires);
      localStorage.setItem('spotify_token_timestamp', Date.now().toString());

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('spotify_token');
      url.searchParams.delete('spotify_refresh');
      url.searchParams.delete('spotify_expires');
      window.history.replaceState({}, '', url.toString());
    } else {
      // Check localStorage for existing tokens
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedRefresh = localStorage.getItem('spotify_refresh_token');
      const storedExpires = localStorage.getItem('spotify_expires_in');
      const storedTimestamp = localStorage.getItem('spotify_token_timestamp');

      if (storedToken && storedRefresh && storedExpires && storedTimestamp) {
        const tokenAge = Date.now() - parseInt(storedTimestamp);
        const tokenLifetime = parseInt(storedExpires) * 1000;

        if (tokenAge < tokenLifetime) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefresh);
          setExpiresIn(parseInt(storedExpires));
          setIsAuthenticated(true);
        } else {
          // Token expired, try to refresh
          refreshAccessToken();
        }
      } else {
        // No existing tokens, try to get client credentials token for public playlists
        getClientCredentialsToken();
      }
    }
  }, []);

  const getClientCredentialsToken = async () => {
    try {
      const response = await fetch('/api/spotify/client-credentials', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        setExpiresIn(data.expires_in);
        setIsAuthenticated(true);
        
        // Store token in localStorage
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_expires_in', data.expires_in.toString());
        localStorage.setItem('spotify_token_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Error getting client credentials token:', error);
    }
  };

  const login = () => {
    window.location.href = '/api/spotify/auth';
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setExpiresIn(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_expires_in');
    localStorage.removeItem('spotify_token_timestamp');
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const storedRefresh = localStorage.getItem('spotify_refresh_token');
    
    if (!storedRefresh) {
      logout();
      return false;
    }

    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefresh }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      setAccessToken(data.access_token);
      setExpiresIn(data.expires_in);
      setIsAuthenticated(true);

      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_expires_in', data.expires_in.toString());
      localStorage.setItem('spotify_token_timestamp', Date.now().toString());

      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  const value = {
    accessToken,
    refreshToken,
    expiresIn,
    isAuthenticated,
    login,
    logout,
    refreshAccessToken,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}
