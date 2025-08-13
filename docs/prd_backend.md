# CRUMBLE Backend PRD

## Backend Architecture
### Primary Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Database**: SQLite
- **Rationale**: Optimal for web-focused deployment, excellent macOS compatibility, easier maintenance

## Stremio Compatibility Layer
### Addon Protocol
- **Version**: 1.0
- **Implementation**: Full compatibility with existing Stremio addons
- **SDK Integration**: stremio-addon-sdk v1.6.10+
- **Custom Wrapper**: Simplified addon management for web interface

### Addon Management
- **Discovery**: Community catalog (https://stremio-addons.netlify.app/), manual installation, curated list
- **Frontend Integration**: AddonManager.js component, real-time health monitoring, simple toggle/priority ordering

## API Endpoints

### TMDB Integration (`/api/tmdb`)
- `/configuration` - TMDB configuration data
- `/trending/all/day` - Hero banner content
- `/movie/popular` - Popular movies carousel
- `/movie/upcoming` - Coming soon carousel
- `/movie/top_rated` - Top rated carousel
- `/search/multi` - Search functionality
- `/movie/{id}` - Movie details modal
- `/movie/{id}/videos` - Trailers and videos
- `/movie/{id}/credits` - Cast and crew info

**Integration**: TMDBService.js + React hooks, 5-15 minute cache with React Query, user-friendly error boundaries

### Stremio Bridge (`/api/stremio`)
- `/resolve/{id}` - Stream resolution for play buttons
- `/addons` - Addon management
- `/catalogs` - Content discovery
- `/meta/{type}/{id}` - Enhanced metadata

**Integration**: StremioService.js + custom hooks

### User Data (`/api/user`)
- `/watchlist` - Personal watchlist management
- `/favorites` - Favorites collection
- `/history` - Watch history tracking
- `/preferences` - User settings and preferences

**Storage**: SQLite database + localStorage sync

## Settings Configuration

### Player Settings
- Auto-play next episode (toggle, default: true)
- Skip intro/outro (toggle, default: false)
- Default video quality (dropdown: Full HD, HD, SD, Auto - default: Full HD)
- Subtitle language (dropdown: English, Spanish, French, German, Off - default: English)

### API Integrations
#### TMDB API
- Status indicator (Connected/Disconnected/Error)
- API key field (password input, validation on save)
- Help link to themoviedb.org

#### MDBList Integration
- Status indicator (Connected/Disconnected)
- Enable toggle with description

### External Player Settings
- Default external player (dropdown: VLC Media Player, Infuse, Outplayer, Custom Command)
- Auto-launch external player (toggle, default: false)
- Custom player command (text input with %URL% placeholder)

### Addon Management
#### Installed Addons
- **Torrentio** v0.0.14 (enabled) - Torrent streams from various providers
- **ThePirateBay+** v1.0.0 (enabled) - Enhanced TPB addon with better filtering
- **RARBG** v1.0.0 (disabled) - RARBG torrent streams addon

Actions: configure, enable/disable, remove

### Catalog Configuration
- IMDB catalog (toggle, default: true)
- Trakt.tv integration (toggle, default: false)
- Content filters: minimum IMDB rating (6.0+, 7.0+, 8.0+, No filter), release year (2000+, 2010+, 2015+, 2020+, No filter)

## Performance Requirements
### Response Times
- TMDB proxy: <200ms average
- Addon discovery: <500ms average
- Stream resolution: <2s average
- Catalog loading: <1s average

### Resource Usage
- Memory: <100MB base, <300MB peak
- CPU: <5% idle, <20% under load

## Backend Structure
```
server.js                 # Express server entry point
routes/
  api/                    # Main API routes
  tmdb/                   # TMDB proxy routes
  stremio/                # Stremio integration routes
  user/                   # User data routes
services/
  tmdbService.js          # TMDB API wrapper
  stremioService.js       # Stremio addon manager
  addonManager.js         # Addon lifecycle management
  streamResolver.js       # Stream resolution logic
  cacheManager.js         # Caching layer
middleware/               # Express middleware
config/                   # Configuration management
database/                 # SQLite schema and migrations
```

## Data Caching Strategy
- Movie metadata: 7 days
- Trending content: 6 hours
- User collections: Persistent local storage
- Background sync with frontend every 5 minutes

## Error Handling
- Network errors: Cached fallback + retry mechanisms
- API failures: User-friendly error messages
- Rate limits: Exponential backoff + loading states
- Addon failures: Graceful degradation + fallback options

## Deployment Options
### Backend Hosting
- Railway
- Render
- Vercel API

### Requirements
- Environment management: Secure .env handling
- Database persistence: SQLite file persistence
- Development: Backend (3001)
- Production: Single domain with API proxy
- Docker support: Complete containerization option