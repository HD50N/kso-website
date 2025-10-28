'use client';

import { useState, useEffect } from 'react';
import { useSpotify } from '@/contexts/SpotifyContext';
import SpotifyPlaylistModal from './SpotifyPlaylistModal';

interface SpotifyAutoModalProps {
  defaultPlaylistId?: string;
}

export default function SpotifyAutoModal({ defaultPlaylistId }: SpotifyAutoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, accessToken } = useSpotify();

  useEffect(() => {
    // Auto-open the modal when the component mounts and user is authenticated
    if (isAuthenticated && accessToken) {
      setIsOpen(true);
    }
  }, [isAuthenticated, accessToken]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return (
    <SpotifyPlaylistModal
      isOpen={isOpen}
      onClose={handleClose}
      accessToken={accessToken}
      defaultPlaylistId={defaultPlaylistId}
    />
  );
}
