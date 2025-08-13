# CRUMBLE Frontend PRD

## Platform Identity
- **Name**: CRUMBLE
- **Tagline**: OTT Streaming Platform Interface
- **Branding**: Minimalist text logo, white primary (#ffffff), indigo accent (#6366f1), dark gradient background

## Frontend Architecture
- **Framework**: React 18+
- **Language**: JavaScript (ES6+)
- **Styling**: Custom CSS with Flexbox/Grid, CSS custom properties
- **State Management**: React Context API + Custom Hooks
- **Build Tool**: Create React App or Vite

## Tab Navigation System
### Left Sidebar Navigation (280px width)
1. **Home** (`/`) - Home icon, Alt+1
   - Main content discovery with hero banner and trending carousels
2. **Library** (`/library`) - Collection icon, Alt+2
   - Personal collection management - Watchlist, Favorites, Continue Watching
3. **Settings** (`/settings`) - Cog icon, Alt+3
   - Platform configuration, integrations, and preferences

### Navigation Features
- Persistent search bar
- Smooth transitions
- State preservation
- Bottom border highlight for active tab

## Home Tab Features
### Hero Banner
- Full-width backdrop layout
- Featured trending movie content
- Cinematic gradient overlay
- Bottom-left text positioning
- **Interactive Elements**:
  - Primary CTA: "Play" (solid button with play icon)
  - Secondary: "My List" (outline button with plus icon)
  - Tertiary: "More Info" (text button with info icon)
- **Metadata Display**: rating badge, release year, runtime, genre tags, synopsis preview

### Content Sections
1. **Trending Now** - TMDB trending daily (20 items, 6 per view)
2. **New Releases** - TMDB upcoming movies (20 items, 6 per view)
3. **Action Movies** - TMDB action genre (20 items, 6 per view)

### Carousel Behavior
- Smooth horizontal scrolling
- Touch enabled
- Hover effects: scale and overlay
- Lazy loading
- No infinite scroll

## Library Tab Features
### Header Section
- Title: "My Library"
- Subtitle explaining functionality
- Collection stats: "Your Collection • X items"

### Quick Actions
- "Continue Watching" prominent button with play circle icon

### Collection Management
- **Tabs**: Watchlist (bookmark icon), Favorites (heart icon)
- **Sort Options**: recently added, alphabetical, release date, rating
- **View Modes**: Grid (3x3, 3 cards per row), List (compact view)
- **Filters**: all content, movies only, series only, watched status

### Sync Integrations
- **MDBList**: Import capability, bidirectional sync, daily frequency
- **Trakt**: Scrobbling, import history

## UI Design System
### Color Palette
- Primary Background: #0a0a0a
- Secondary Background: #1a1a1a
- Card Background: #2a2a2a
- Text Primary: #ffffff
- Text Secondary: #a1a1aa
- Text Muted: #71717a
- Accent Primary: #6366f1
- Accent Secondary: #8b5cf6
- Success: #10b981
- Warning: #f59e0b
- Error: #ef4444

### Typography
- Font Family: Inter, system-ui, sans-serif
- Hero Title: 48px/1.1 bold
- Section Title: 24px/1.2 semibold
- Card Title: 16px/1.3 medium
- Body Text: 14px/1.4 regular

### Component Styles
- **Primary Button**: #6366f1 background, white text, 8px border-radius, 12px 24px padding
- **Secondary Button**: Transparent background, white text, 1px white border
- **Movie Card**: #2a2a2a background, 12px border-radius, 2:3 aspect ratio, 1.05x hover scale

## Interaction Patterns
### Movie Card Interactions
- **Hover**: 1.05x scale, metadata overlay fade, show rating, fade-in bottom action buttons
- **Click**: Show detail modal with hero backdrop, poster, metadata, synopsis, cast, ratings, similar content, action buttons

### Performance Requirements
- Lighthouse scores: 90+ performance, 95+ accessibility, 90+ best practices, 90+ SEO
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Bundle size: <250KB gzipped initial, <100KB chunks
- 60fps animations for all scrolling and transitions

## Responsive Behavior
### Breakpoints
- Mobile: 768px (2 carousel cards)
- Tablet: 1024px (4 carousel cards)
- Desktop: 1280px (6 carousel cards)
- Wide: 1920px (8 carousel cards)

### Library Grid Responsive
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Wide: 6 columns

## Frontend Structure
```
src/
  components/
    common/          # Reusable UI components
    search/          # SearchComponent.js (mandatory)
    carousel/        # Content carousel components
    hero/           # Hero banner component
    modals/         # Detail modals and overlays
  pages/
    HomePage.js     # Main dashboard with hero + carousels
    LibraryPage.js  # Personal collections management
    SettingsPage.js # Configuration and integrations
  services/
    tmdbService.js  # TMDB API integration
    stremioService.js # Stremio addon communication
    userService.js  # User data management
  hooks/            # Custom React hooks for data fetching
  contexts/         # React Context providers
  utils/           # Utility functions
  styles/          # Global styles and themes
```