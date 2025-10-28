'use client';

import { useState, useEffect } from 'react';
import SimpleSpotifyModal from './SimpleSpotifyModal';

interface SimpleSpotifyAutoModalProps {
  playlistId: string;
}

export default function SimpleSpotifyAutoModal({ playlistId }: SimpleSpotifyAutoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Auto-open the modal when the component mounts
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <SimpleSpotifyModal
      isOpen={isOpen}
      onClose={handleClose}
      playlistId={playlistId}
    />
  );
}
