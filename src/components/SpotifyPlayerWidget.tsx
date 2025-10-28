'use client';

import { useState, useEffect, useRef } from 'react';
import { getBestImage } from '@/lib/spotify';
import { useSpotifyPlayer } from '@/contexts/SpotifyPlayerContext';

interface SpotifyPlayerWidgetProps {
  playlistId: string;
}

interface PlaylistData {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
  };
}

export default function SpotifyPlayerWidget({ playlistId }: SpotifyPlayerWidgetProps) {
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Use global context
  const { isPlayerOpen, isPlaying, togglePlayer, setPlaying } = useSpotifyPlayer();

  useEffect(() => {
    if (playlistId) {
      loadPlaylist();
    }
    
    // Set initial position to bottom right
    setPosition({ 
      x: window.innerWidth - 360, 
      y: window.innerHeight - 120 
    });
  }, [playlistId]);

  const loadPlaylist = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/spotify/playlist/${playlistId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load playlist');
      }
      
      const data = await response.json();
      setPlaylist(data);
    } catch (error) {
      setError('Failed to load playlist');
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const playClickSound = () => {
    // Create a simple click sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleTogglePlayer = () => {
    // Visual click effect
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);
    
    // Play click sound
    playClickSound();
    
    togglePlayer();
    // When opening player, assume user will start playing
    if (!isPlayerOpen) {
      setPlaying(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep widget within viewport bounds
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 100;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Close player when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        togglePlayer();
      }
    };

    if (isPlayerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPlayerOpen, togglePlayer]);

  if (loading) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-80"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className={`fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 cursor-move select-none w-80 ${
        isDragging ? 'shadow-2xl' : 'hover:shadow-xl'
      } transition-shadow duration-200`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div className="drag-handle absolute top-1 right-1 w-2 h-2 bg-gray-300 rounded-full cursor-move"></div>
      
      {/* Main Widget Content */}
      <div className="flex items-center space-x-4 p-4">
        {/* Playlist Image */}
        <div className="flex-shrink-0">
          <img
            src={getBestImage(playlist.images)}
            alt={playlist.name}
            className="w-14 h-14 rounded object-cover"
          />
        </div>
        
        {/* Playlist Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate" title={playlist.name}>
            {playlist.name}
          </h3>
          <p className="text-xs text-gray-600 truncate" title={playlist.owner.display_name}>
            {playlist.owner.display_name}
          </p>
        </div>
        
        {/* Play Button */}
        <button
          onClick={handleTogglePlayer}
          className={`${
            isPlaying ? 'bg-green-700' : 'bg-green-600'
          } text-white p-3 rounded hover:bg-green-700 transition-all duration-150 relative ${
            isClicking ? 'scale-95 shadow-inner' : 'scale-100'
          }`}
          title={isPlayerOpen ? "Close Player" : "Play Playlist"}
        >
          {isPlaying && !isPlayerOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      
      {/* Dropdown Player */}
      <div className={`absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 ${
        isPlayerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg"
          onLoad={() => setPlaying(true)}
        ></iframe>
      </div>
    </div>
  );
}
