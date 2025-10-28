'use client';

import { useState, useEffect } from 'react';
import { SpotifyTrack, formatDuration, getBestImage } from '@/lib/spotify';

interface SimpleSpotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
}

interface PlaylistData {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
  };
}

export default function SimpleSpotifyModal({ isOpen, onClose, playlistId }: SimpleSpotifyModalProps) {
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && playlistId) {
      loadPlaylist();
    }
  }, [isOpen, playlistId]);

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
      setTracks(data.tracks.items.map((item: any) => item.track).filter((track: any) => track));
    } catch (error) {
      setError('Failed to load playlist');
      console.error('Error loading playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInSpotify = (url: string) => {
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.88 15 9.42 18.72 11.4c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Now Playing</h2>
              <p className="text-sm text-gray-600">KSO Spotify Playlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Playlist Info */}
          <div className="w-1/3 border-r border-gray-200 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : playlist ? (
              <div className="text-center">
                <img
                  src={getBestImage(playlist.images)}
                  alt={playlist.name}
                  className="w-48 h-48 rounded-lg mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{playlist.name}</h3>
                <p className="text-gray-600 mb-2">{playlist.owner.display_name}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {tracks.length} tracks
                </p>
                {playlist.description && (
                  <p className="text-sm text-gray-600 mb-6">{playlist.description}</p>
                )}
                <button
                  onClick={() => openInSpotify(playlist.external_urls.spotify)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Open in Spotify
                </button>
              </div>
            ) : null}
          </div>

          {/* Tracks List */}
          <div className="w-2/3 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Track List</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No tracks available</div>
              ) : (
                <div className="space-y-1 p-4">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-3 p-3 rounded hover:bg-gray-100"
                    >
                      <span className="text-sm text-gray-500 w-8">{index + 1}</span>
                      <img
                        src={getBestImage(track.album.images)}
                        alt={track.album.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{track.name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {track.artists.map(artist => artist.name).join(', ')}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDuration(track.duration_ms)}
                      </span>
                      <button
                        onClick={() => openInSpotify(track.external_urls.spotify)}
                        className="text-green-600 hover:text-green-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.88 15 9.42 18.72 11.4c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
