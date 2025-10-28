# Spotify Integration

This document explains how to set up and use the Spotify integration feature in the KSO website.

## Features

- **Auto-Opening Modal**: Automatically opens a Spotify playlist modal on page load
- **Default Playlist**: Plays a specific playlist configured via environment variables
- **Client Credentials Authentication**: Uses Spotify's client credentials flow for public playlists
- **Playlist Browser**: Browse personal playlists, featured playlists, and search for playlists
- **Track Listing**: View detailed track information for selected playlists
- **Direct Spotify Links**: Open playlists and tracks directly in Spotify
- **Responsive Design**: Works on both desktop and mobile devices

## Setup

### 1. Spotify App Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set the redirect URI to: `https://yourdomain.com/api/spotify/callback`
4. Note down your Client ID and Client Secret

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Spotify Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://yourdomain.com/api/spotify/callback
NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_ID=your_default_playlist_id

# Base URL (for redirects)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Default Playlist Setup

1. Create a public playlist on Spotify
2. Copy the playlist ID from the Spotify URL (e.g., `37i9dQZF1DXcBWIGoYBM5M`)
3. Set the `NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_ID` environment variable

### 4. Required Scopes

The integration uses two authentication methods:

**Client Credentials Flow** (for default playlist):
- No user scopes required
- Can access public playlists only

**OAuth 2.0 Flow** (for user playlists):
- `user-read-private` - Read user's subscription details
- `user-read-email` - Read user's email address
- `playlist-read-private` - Read user's private playlists
- `playlist-read-collaborative` - Read collaborative playlists
- `user-library-read` - Read user's saved tracks and albums
- `user-top-read` - Read user's top artists and tracks

## Architecture

### Components

- **`SpotifyAutoModal`**: Auto-opening modal component that loads on page load
- **`SpotifyPlaylistModal`**: Main modal component for browsing playlists
- **`SpotifyContext`**: React context for managing authentication state
- **`SpotifyAPI`**: Utility class for making Spotify API calls

### API Routes

- **`/api/spotify/auth`**: Initiates OAuth flow
- **`/api/spotify/callback`**: Handles OAuth callback
- **`/api/spotify/refresh`**: Refreshes access tokens
- **`/api/spotify/client-credentials`**: Gets client credentials token for public playlists

### Key Features

#### Authentication Flow
1. **Auto-Load**: Modal automatically opens on page load
2. **Client Credentials**: Uses client credentials flow to get token for public playlists
3. **Default Playlist**: Loads the configured default playlist immediately
4. **User Authentication**: Optional OAuth flow for personal playlists

#### Playlist Management
- **My Playlists**: User's personal playlists
- **Featured**: Spotify's featured playlists
- **Search**: Search for public playlists

#### Track Display
- Track name, artist, and album information
- Album artwork
- Track duration
- Direct links to Spotify

## Usage

### For Users

1. **Automatic**: The Spotify modal opens automatically when you visit the homepage
2. **Default Playlist**: Your configured default playlist loads immediately
3. **Browse**: Use the tabs to browse other playlists (My Playlists, Featured, Search)
4. **Play**: Click "Open in Spotify" to play any playlist in the Spotify app
5. **Close**: Click the X button to close the modal

### For Developers

#### Using the Spotify Context

```tsx
import { useSpotify } from '@/contexts/SpotifyContext';

function MyComponent() {
  const { 
    isAuthenticated, 
    accessToken, 
    login, 
    logout 
  } = useSpotify();

  return (
    <div>
      {isAuthenticated ? (
        <p>Connected to Spotify!</p>
      ) : (
        <button onClick={login}>Connect Spotify</button>
      )}
    </div>
  );
}
```

#### Using the Spotify API

```tsx
import { SpotifyAPI } from '@/lib/spotify';

const spotify = new SpotifyAPI(accessToken);
const playlists = await spotify.getUserPlaylists();
```

## Security Considerations

- Access tokens are stored in localStorage (client-side)
- Refresh tokens are used to maintain sessions
- All API calls are made client-side to avoid exposing tokens
- Tokens are automatically refreshed when expired

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Invalid tokens
- Rate limiting
- Authentication errors

## Customization

### Styling
The modal uses Tailwind CSS classes and can be customized by modifying the component styles.

### Features
Additional features can be added by extending the `SpotifyAPI` class or adding new methods to the context.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure the redirect URI in your Spotify app matches exactly
2. **"Invalid client"**: Check that your Client ID and Secret are correct
3. **"Token expired"**: The app should automatically refresh tokens, but users may need to re-authenticate

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed API responses and error messages.

## Future Enhancements

- Playlist creation and editing
- Track recommendations
- Collaborative playlists
- Playlist sharing
- Offline playlist caching
- Playback controls (requires Spotify Web Playback SDK)
