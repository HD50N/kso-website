'use client';

import { useState, useEffect } from 'react';
import { SpotifyAPI, SpotifyPlaylist, SpotifyTrack, formatDuration, getBestImage } from '@/lib/spotify';

interface SpotifyPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  defaultPlaylistId?: string;
}

export default function SpotifyPlaylistModal({ isOpen, onClose, accessToken, defaultPlaylistId }: SpotifyPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'featured' | 'search'>('my');
  const [user, setUser] = useState<any>(null);

  const spotifyAPI = new SpotifyAPI(accessToken);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadUser();
      
      // If we have a default playlist ID, load it directly
      if (defaultPlaylistId) {
        loadDefaultPlaylist();
      } else {
        loadUserPlaylists();
      }
    }
  }, [isOpen, accessToken, defaultPlaylistId]);

  const loadUser = async () => {
    try {
      const userData = await spotifyAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadDefaultPlaylist = async () => {
    if (!defaultPlaylistId) return;
    
    setLoading(true);
    setError('');
    try {
      const playlist = await spotifyAPI.getPlaylist(defaultPlaylistId);
      setSelectedPlaylist(playlist);
      setTracks(playlist.tracks.items.map(item => item.track).filter(track => track));
      setActiveTab('my'); // Set to my playlists tab
    } catch (error) {
      setError('Failed to load default playlist');
      console.error('Error loading default playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await spotifyAPI.getUserPlaylists(50);
      setPlaylists(data.items);
    } catch (error) {
      setError('Failed to load playlists');
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await spotifyAPI.getFeaturedPlaylists(50);
      setPlaylists(data.playlists.items);
    } catch (error) {
      setError('Failed to load featured playlists');
      console.error('Error loading featured playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaylists = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await spotifyAPI.searchPlaylists(searchQuery, 50);
      setPlaylists(data.playlists.items);
    } catch (error) {
      setError('Failed to search playlists');
      console.error('Error searching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistTracks = async (playlist: SpotifyPlaylist) => {
    setLoading(true);
    setError('');
    try {
      const playlistData = await spotifyAPI.getPlaylist(playlist.id);
      setSelectedPlaylist(playlistData);
      setTracks(playlistData.tracks.items.map(item => item.track).filter(track => track));
    } catch (error) {
      setError('Failed to load playlist tracks');
      console.error('Error loading playlist tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'my' | 'featured' | 'search') => {
    setActiveTab(tab);
    setPlaylists([]);
    setSelectedPlaylist(null);
    setTracks([]);
    
    if (tab === 'my') {
      loadUserPlaylists();
    } else if (tab === 'featured') {
      loadFeaturedPlaylists();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchPlaylists();
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
              <h2 className="text-xl font-bold text-gray-900">Spotify Playlists</h2>
              {user && (
                <p className="text-sm text-gray-600">Welcome, {user.display_name}</p>
              )}
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
          {/* Sidebar - Playlist List */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabChange('my')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'my'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Playlists
              </button>
              <button
                onClick={() => handleTabChange('featured')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'featured'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => handleTabChange('search')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'search'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Search
              </button>
            </div>

            {/* Search Bar (only for search tab) */}
            {activeTab === 'search' && (
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search playlists..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Search
                  </button>
                </form>
              </div>
            )}

            {/* Playlist List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">{error}</div>
              ) : playlists.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {activeTab === 'search' ? 'Search for playlists...' : 'No playlists found'}
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      onClick={() => loadPlaylistTracks(playlist)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPlaylist?.id === playlist.id
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={getBestImage(playlist.images)}
                          alt={playlist.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{playlist.name}</h3>
                          <p className="text-sm text-gray-600 truncate">
                            {playlist.owner.display_name} • {playlist.tracks.total} tracks
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Playlist Details */}
          <div className="w-1/2 flex flex-col">
            {selectedPlaylist ? (
              <>
                {/* Playlist Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getBestImage(selectedPlaylist.images)}
                      alt={selectedPlaylist.name}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h3>
                      <p className="text-gray-600">{selectedPlaylist.owner.display_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {tracks.length} tracks
                      </p>
                    </div>
                    <button
                      onClick={() => openInSpotify(selectedPlaylist.external_urls.spotify)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Open in Spotify
                    </button>
                  </div>
                  {selectedPlaylist.description && (
                    <p className="mt-3 text-sm text-gray-600">{selectedPlaylist.description}</p>
                  )}
                </div>

                {/* Tracks List */}
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
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-500 w-8">{index + 1}</span>
                          <img
                            src={getBestImage(track.album.images)}
                            alt={track.album.name}
                            className="w-10 h-10 rounded object-cover"
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
                            className="text-green-600 hover:text-green-700"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 8.88 15 9.42 18.72 11.4c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Playlist</h3>
                  <p className="text-gray-600">Choose a playlist from the sidebar to view its tracks</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
