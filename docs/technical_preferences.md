# CRUMBLE Technical Preferences

## Technology Stack Preferences

### Frontend Stack
- **Framework**: React 18+ (Preferred over Vue/Angular for ecosystem maturity)
- **Language**: JavaScript ES6+ (TypeScript considered but not required for MVP)
- **Build Tool**: Vite (Preferred over Create React App for faster builds)
- **Styling**: Custom CSS with CSS Custom Properties (No CSS-in-JS libraries)
- **State Management**: React Context API + Custom Hooks (No Redux for simplicity)

### Backend Stack  
- **Runtime**: Node.js 18+ (Preferred for JavaScript full-stack consistency)
- **Framework**: Express.js (Lightweight, well-documented)
- **Database**: SQLite (File-based, zero configuration for easy deployment)
- **ORM**: None (Direct SQL queries for better performance and control)

### Rationale
- **JavaScript Everywhere**: Reduces context switching, shared utilities
- **Minimal Dependencies**: Easier maintenance, smaller bundle sizes
- **macOS Optimization**: Native performance on target platform

## Development Tool Preferences

### Code Editor
- **Primary**: VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - GitLens

### Browser Developer Tools
- **Chrome DevTools**: Primary debugging environment
- **Safari Web Inspector**: macOS-specific testing
- **React Developer Tools**: Component tree inspection
- **Lighthouse**: Performance auditing (target 90+ scores)

### Package Management
- **npm**: Preferred over yarn for simplicity
- **Package-lock.json**: Always commit for consistent installs
- **Node Modules**: Never commit to version control

## API Integration Preferences

### TMDB API
- **Version**: v3 (Stable, well-documented)
- **Image Base URL**: Use configuration endpoint for dynamic URLs
- **Rate Limiting**: 40 requests per 10 seconds (respect limits)
- **Caching**: 5-15 minute cache for metadata, 6 hours for trending

### Stremio Integration
- **SDK**: stremio-addon-sdk v1.6.10+ (Official package)
- **Compatibility**: Full backward compatibility with existing addons
- **Community Catalog**: Primary source for addon discovery
- **Custom Wrapper**: Simplified management for web interface

### External Services
- **MDBList**: Enhanced ratings, list synchronization
- **Trakt.tv**: Watch history, scrobbling (optional)
- **External Players**: VLC, Infuse, Outplayer support

## Performance Preferences

### Frontend Performance
- **Bundle Splitting**: Route-based code splitting mandatory
- **Image Loading**: Progressive lazy loading with blur-up
- **Animation**: 60fps target, use `transform` and `opacity` properties
- **Caching**: React Query for API data, localStorage for user preferences

### Backend Performance
- **Response Times**: <200ms for TMDB proxy, <2s for stream resolution
- **Memory Usage**: <100MB base, <300MB peak
- **Database**: SQLite with proper indexing on frequently queried fields
- **Caching**: In-memory cache for frequently accessed data

### Optimization Techniques
- **Critical CSS**: Inline above-the-fold styles
- **Resource Hints**: Preload critical resources
- **Service Worker**: Offline functionality (future enhancement)
- **CDN**: Cloudflare for static asset delivery

## UI/UX Design Preferences

### Design Philosophy
- **Minimalist**: Clean, uncluttered interface
- **Dark Theme**: Primary theme with high contrast text
- **Netflix-inspired**: Familiar streaming platform patterns
- **Responsive**: Mobile-first approach

### Interaction Patterns
- **Hover Effects**: Subtle scale transforms (1.05x)
- **Transitions**: 200ms duration for most interactions
- **Loading States**: Skeleton screens over spinners
- **Error States**: User-friendly messages with retry options

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG AA compliance minimum
- **Touch Targets**: 44px minimum size

## Code Organization Preferences

### File Structure
- **Feature-based**: Group related components together
- **Index Files**: Use for clean imports
- **Absolute Imports**: Configure path mapping for cleaner imports
- **Component Co-location**: Keep styles and tests near components

### Naming Conventions
- **Components**: PascalCase (MovieCard.js)
- **Utilities**: camelCase (formatDate.js)
- **Constants**: SCREAMING_SNAKE_CASE
- **CSS Classes**: BEM methodology

### Import Organization
1. React and external libraries
2. Internal utilities and services  
3. Components
4. Styles

## Testing Preferences

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Test user workflows
- **E2E Tests**: Playwright for critical paths (future)
- **Coverage**: 80%+ for utilities, 60%+ for components

### Testing Philosophy
- **User-centric**: Test behavior, not implementation
- **Fast Feedback**: Quick test execution
- **Maintainable**: Tests that survive refactoring

## Security Preferences

### API Security
- **Environment Variables**: Never expose API keys in client code
- **CORS**: Proper CORS configuration for production
- **Rate Limiting**: Implement on backend endpoints
- **Input Validation**: Sanitize all user inputs

### Client Security
- **Content Security Policy**: Implement CSP headers
- **HTTPS**: Enforce HTTPS in production
- **XSS Protection**: Sanitize dynamic content
- **Dependency Scanning**: Regular security audits

## Deployment Preferences

### Development Environment
- **Hot Reloading**: Instant feedback during development
- **Environment Variables**: .env files for configuration
- **Local Database**: SQLite file in project directory
- **Proxy Setup**: Frontend proxy to backend during development

### Production Environment
- **Frontend Hosting**: Vercel (preferred), Netlify, GitHub Pages
- **Backend Hosting**: Railway (preferred), Render, Vercel API
- **Database**: Persistent SQLite file storage
- **CDN**: Cloudflare for global asset delivery

### CI/CD Preferences
- **GitHub Actions**: Automated testing and deployment
- **Automated Testing**: Run tests on every PR
- **Deployment**: Auto-deploy main branch to staging
- **Environment Promotion**: Manual promotion to production

## Browser Compatibility

### Primary Targets
- **Chrome 90+**: Primary development browser
- **Safari 14+**: macOS native browser
- **Firefox 88+**: Secondary support
- **Mobile Safari**: iOS compatibility

### Feature Support
- **ES6+ Features**: Use modern JavaScript features
- **CSS Grid/Flexbox**: Modern layout techniques
- **Fetch API**: No XMLHttpRequest
- **Async/Await**: Preferred over Promises

## Error Handling Preferences

### Frontend Errors
- **Error Boundaries**: Catch React component errors
- **User Feedback**: Toast notifications for errors
- **Logging**: Console errors with context
- **Graceful Degradation**: App remains functional when features fail

### Backend Errors
- **Structured Logging**: Consistent error message format
- **Error Codes**: Specific codes for different error types
- **Retry Logic**: Exponential backoff for transient failures
- **Circuit Breakers**: Prevent cascade failures

## Monitoring Preferences

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: Regular bundle size monitoring
- **Lighthouse CI**: Automated performance testing
- **User Analytics**: Basic usage patterns (privacy-focused)

### Error Monitoring
- **Console Logging**: Structured client-side logging
- **Server Logging**: Request/response logging
- **Health Checks**: API endpoint health monitoring
- **Uptime Monitoring**: Service availability tracking