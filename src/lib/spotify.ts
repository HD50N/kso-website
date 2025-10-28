const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
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

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export class SpotifyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string) {
    const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Get current user's profile
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeRequest('/me');
  }

  // Get user's playlists
  async getUserPlaylists(limit = 20, offset = 0): Promise<{
    items: SpotifyPlaylist[];
    total: number;
  }> {
    return this.makeRequest(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  // Get specific playlist with tracks
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.makeRequest(`/playlists/${playlistId}?market=US`);
  }

  // Search for playlists
  async searchPlaylists(query: string, limit = 20): Promise<{
    playlists: {
      items: SpotifyPlaylist[];
      total: number;
    };
  }> {
    return this.makeRequest(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`);
  }

  // Get featured playlists
  async getFeaturedPlaylists(limit = 20): Promise<{
    playlists: {
      items: SpotifyPlaylist[];
      total: number;
    };
  }> {
    return this.makeRequest(`/browse/featured-playlists?limit=${limit}&market=US`);
  }

  // Get category playlists
  async getCategoryPlaylists(categoryId: string, limit = 20): Promise<{
    playlists: {
      items: SpotifyPlaylist[];
      total: number;
    };
  }> {
    return this.makeRequest(`/browse/categories/${categoryId}/playlists?limit=${limit}&market=US`);
  }
}

// Helper function to format duration
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to get the best image from an array
export function getBestImage(images: Array<{ url: string; height: number; width: number }>): string {
  if (!images || images.length === 0) return '/placeholder-playlist.jpg';
  
  // Sort by size and return the medium-sized image
  const sortedImages = images.sort((a, b) => a.height - b.height);
  const mediumImage = sortedImages[Math.floor(sortedImages.length / 2)];
  
  return mediumImage?.url || images[0]?.url || '/placeholder-playlist.jpg';
}
