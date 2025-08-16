# Repository Configuration

## Project Information
- **Name**: CRMB-M.1
- **Type**: Full-stack web application
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Target Framework**: Jest

## Architecture
- Frontend: React application with React Router for navigation
- Backend: Express.js API server with routes for TMDB, Stremio, Trakt, and MDbList
- Addon System: Stremio addon integration with Cinemeta for metadata

## Key Features
- Content discovery via TMDB API
- Metadata fetching from Stremio addons (Cinemeta)
- Detail pages with comprehensive movie/TV show information
- Library management
- Settings configuration

## API Endpoints
- `/api/tmdb/*` - TMDB integration
- `/api/stremio/*` - Stremio addon integration
- `/api/trakt/*` - Trakt integration
- `/api/mdblist/*` - MDbList integration