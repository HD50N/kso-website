'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpotifyPlayerContextType {
  isPlayerOpen: boolean;
  isPlaying: boolean;
  togglePlayer: () => void;
  setPlaying: (playing: boolean) => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedPlayerState = localStorage.getItem('spotify-player-open');
    const savedPlayingState = localStorage.getItem('spotify-playing');
    
    if (savedPlayerState) {
      setIsPlayerOpen(JSON.parse(savedPlayerState));
    }
    if (savedPlayingState) {
      setIsPlaying(JSON.parse(savedPlayingState));
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('spotify-player-open', JSON.stringify(isPlayerOpen));
  }, [isPlayerOpen]);

  useEffect(() => {
    localStorage.setItem('spotify-playing', JSON.stringify(isPlaying));
  }, [isPlaying]);

  const togglePlayer = () => {
    setIsPlayerOpen(!isPlayerOpen);
  };

  const setPlaying = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const value = {
    isPlayerOpen,
    isPlaying,
    togglePlayer,
    setPlaying,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer() {
  const context = useContext(SpotifyPlayerContext);
  if (context === undefined) {
    throw new Error('useSpotifyPlayer must be used within a SpotifyPlayerProvider');
  }
  return context;
}
