# CRUMBLE Architecture Overview

## System Architecture
**Type**: Full-stack media center web application  
**Target Platform**: macOS (Chrome/Safari optimized)  
**Architecture**: React frontend + Node.js backend with Stremio compatibility

## High-Level Data Flow
```
Frontend ↔ Backend API ↔ TMDB/Stremio ↔ Cache ↔ Frontend
```

### Specific Flows
- **Page Load**: Frontend → Backend API → TMDB/Stremio → Cache → Frontend
- **Search**: SearchComponent → /api/tmdb/search → Real-time results
- **Play Action**: PlayButton → /api/stremio/resolve → External player launch
- **Watchlist**: WatchlistButton → /api/user/watchlist → UI update

## Frontend Architecture
### Technology Stack
- **Framework**: React 18+
- **Language**: JavaScript (ES6+)
- **Styling**: Custom CSS with Flexbox/Grid, CSS custom properties
- **State Management**: React Context API + Custom Hooks
- **Build Tool**: Create React App or Vite

### Component Architecture
```
App
├── NavigationSidebar (persistent)
├── SearchOverlay (modal)
└── Routes
    ├── HomePage
    │   ├── HeroBanner
    │   └── ContentCarousels[]
    ├── LibraryPage
    │   ├── CollectionTabs
    │   └── ContentGrid/List
    └── SettingsPage
        ├── PlayerSettings
        ├── AddonManager
        └── APIIntegrations
```

### State Management Strategy
- **Global State**: React Context for user preferences, addon status
- **API Cache**: React Query for TMDB data caching
- **Local Storage**: User preferences, recent searches
- **Sync Strategy**: Background sync with backend every 5 minutes

## Backend Architecture
### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite
- **SDK**: stremio-addon-sdk v1.6.10+

### Service Layer
```
Express Server
├── Routes Layer
│   ├── /api/tmdb/* (TMDB proxy)
│   ├── /api/stremio/* (Stremio bridge)
│   └── /api/user/* (User data)
├── Services Layer
│   ├── tmdbService.js
│   ├── stremioService.js
│   ├── addonManager.js
│   ├── streamResolver.js
│   └── cacheManager.js
└── Data Layer
    ├── SQLite Database
    └── Cache Layer
```

## Integration Architecture

### TMDB Integration
- **Purpose**: Movie metadata, images, trending content
- **Caching**: 5-15 minute cache with React Query
- **Error Handling**: User-friendly error boundaries
- **Rate Limiting**: Exponential backoff

### Stremio Compatibility Layer
- **Addon Protocol**: Version 1.0, full compatibility
- **Community Catalog**: https://stremio-addons.netlify.app/
- **Addon Management**: Real-time health monitoring
- **Stream Resolution**: <2s average response time

### External Integrations
- **MDBList**: Bidirectional sync, daily frequency
- **Trakt**: Scrobbling, import history
- **External Players**: VLC, Infuse, Outplayer, Custom Command

## Performance Architecture

### Frontend Optimizations
- **Code Splitting**: Route-based, component lazy loading
- **Image Loading**: Progressive lazy loading, blur-up technique
- **Bundle Size**: <250KB gzipped initial, <100KB chunks
- **Animations**: 60fps for all scrolling and transitions

### Backend Optimizations
- **Response Times**: TMDB <200ms, Addon discovery <500ms
- **Resource Usage**: <100MB base memory, <300MB peak
- **Caching Strategy**: Movie metadata 7d, Trending 6h, User data persistent

### Browser Optimizations
- **Safari**: Webkit optimizations, privacy compatibility
- **Chrome**: V8 optimizations, service worker support
- **Touch Events**: 44px minimum touch targets
- **Keyboard Navigation**: Full accessibility support

## Security Architecture
- **Environment Management**: Secure .env handling
- **API Keys**: Encrypted storage, validation on save
- **Privacy**: Safari tracking prevention compatible
- **Data Persistence**: SQLite file persistence

## Deployment Architecture
### Development Environment
- Frontend: localhost:3000
- Backend: localhost:3001
- Hot reloading enabled

### Production Environment
- **Frontend Options**: Vercel, Netlify, GitHub Pages
- **Backend Options**: Railway, Render, Vercel API
- **Full-Stack**: Single domain with API proxy
- **CDN**: Cloudflare for asset delivery
- **Docker**: Complete containerization support

## Responsive Architecture
### Breakpoints
- Mobile: 768px
- Tablet: 1024px
- Desktop: 1280px
- Wide: 1920px

### Adaptive Components
- **Carousel Cards**: Mobile(2) → Tablet(4) → Desktop(6) → Wide(8)
- **Library Grid**: Mobile(2) → Tablet(3) → Desktop(4) → Wide(6)

## Error Handling Architecture
- **Network Errors**: Cached fallback + retry mechanisms
- **API Failures**: User-friendly error messages
- **Rate Limits**: Exponential backoff + loading states
- **Addon Failures**: Graceful degradation + fallback options
- **Frontend Errors**: React Error Boundaries