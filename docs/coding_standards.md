# CRUMBLE Coding Standards

## JavaScript Standards
### General Guidelines
- **Language**: JavaScript ES6+
- **Style Guide**: Airbnb JavaScript Style Guide
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Indentation**: 2 spaces, no tabs
- **Line Length**: 80-100 characters maximum

### Variable Naming
- **camelCase**: Functions, variables, properties
- **PascalCase**: Classes, React components, constructors
- **SCREAMING_SNAKE_CASE**: Constants
- **kebab-case**: File names, CSS classes

```javascript
// ✅ Good
const userName = 'john_doe';
const API_BASE_URL = 'https://api.example.com';
const UserProfile = () => { /* component */ };

// ❌ Bad
const user_name = 'john_doe';
const apiBaseUrl = 'https://api.example.com';
const userprofile = () => { /* component */ };
```

### Function Standards
- **Arrow Functions**: Prefer for simple functions and callbacks
- **Function Declarations**: Use for main component functions
- **Async/Await**: Prefer over Promises for better readability
- **Pure Functions**: Prefer side-effect-free functions

```javascript
// ✅ Good
const HomePage = () => {
  const handleSearch = async (query) => {
    try {
      const results = await tmdbService.search(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  return <div>...</div>;
};

// ❌ Bad
function HomePage() {
  function handleSearch(query) {
    tmdbService.search(query).then(results => {
      // Handle results
    }).catch(error => {
      // Handle error
    });
  }
  
  return <div>...</div>;
}
```

## React Standards
### Component Structure
```javascript
// ✅ Component Template
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. State declarations
  const [state, setState] = useState(initialValue);
  
  // 2. Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3. Event handlers
  const handleEvent = (event) => {
    // Handle event
  };
  
  // 4. Computed values
  const computedValue = useMemo(() => {
    return expensiveOperation(state);
  }, [state]);
  
  // 5. Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

// 6. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number
};

// 7. Default props
ComponentName.defaultProps = {
  prop2: 0
};

export default ComponentName;
```

### Hook Standards
- **Custom Hooks**: Prefix with `use`, return objects for multiple values
- **useState**: Destructure with descriptive names
- **useEffect**: Always include dependency arrays
- **useCallback/useMemo**: Use for performance optimization only

```javascript
// ✅ Custom Hook Example
const useMovieData = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieData = await tmdbService.getMovie(movieId);
        setMovie(movieData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);
  
  return { movie, loading, error };
};
```

## CSS Standards
### Methodology
- **BEM Naming**: Block__Element--Modifier
- **CSS Custom Properties**: Use for theming and repeated values
- **Mobile-First**: Start with mobile styles, enhance for larger screens
- **Flexbox/Grid**: Prefer modern layout methods

```css
/* ✅ Good BEM Structure */
.movie-card {
  /* Block styles */
}

.movie-card__poster {
  /* Element styles */
}

.movie-card__poster--loading {
  /* Modifier styles */
}

.movie-card--featured {
  /* Block modifier */
}

/* ✅ CSS Custom Properties */
:root {
  --color-primary: #6366f1;
  --color-background: #0a0a0a;
  --spacing-base: 8px;
  --border-radius: 8px;
}

.button {
  background-color: var(--color-primary);
  padding: calc(var(--spacing-base) * 1.5) calc(var(--spacing-base) * 3);
  border-radius: var(--border-radius);
}
```

### Responsive Design
```css
/* ✅ Mobile-First Approach */
.carousel {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Mobile: 2 columns */
  gap: var(--spacing-base);
}

@media (min-width: 1024px) {
  .carousel {
    grid-template-columns: repeat(4, 1fr); /* Tablet: 4 columns */
  }
}

@media (min-width: 1280px) {
  .carousel {
    grid-template-columns: repeat(6, 1fr); /* Desktop: 6 columns */
  }
}
```

## File Organization Standards
### Naming Conventions
- **Components**: PascalCase (e.g., `MovieCard.js`)
- **Utilities**: camelCase (e.g., `apiHelpers.js`)
- **Constants**: kebab-case (e.g., `api-constants.js`)
- **Styles**: Match component name (e.g., `MovieCard.css`)

### Directory Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   ├── Button.css
│   │   │   └── index.js
│   │   └── ...
│   ├── search/
│   └── ...
├── pages/
├── services/
├── hooks/
├── contexts/
├── utils/
└── styles/
    ├── globals.css
    ├── variables.css
    └── components.css
```

### Import Standards
```javascript
// ✅ Import Order
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 2. Internal utilities and services
import { tmdbService } from '../services';
import { formatDate } from '../utils';

// 3. Components
import Button from '../common/Button';
import MovieCard from '../common/MovieCard';

// 4. Styles
import './HomePage.css';
```

## Error Handling Standards
### Frontend Error Handling
```javascript
// ✅ Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// ✅ Async Error Handling
const fetchMovies = async () => {
  try {
    setLoading(true);
    const movies = await tmdbService.getTrending();
    setMovies(movies);
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    setError('Unable to load movies. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## Performance Standards
### Optimization Techniques
- **React.memo**: Wrap components that receive same props frequently
- **useCallback**: Memoize event handlers passed to child components  
- **useMemo**: Memoize expensive calculations
- **Lazy Loading**: Use React.lazy for route-based code splitting

```javascript
// ✅ Performance Optimizations
const MovieCard = React.memo(({ movie, onAddToWatchlist }) => {
  const handleClick = useCallback(() => {
    onAddToWatchlist(movie.id);
  }, [movie.id, onAddToWatchlist]);
  
  const formattedDate = useMemo(() => {
    return formatDate(movie.release_date);
  }, [movie.release_date]);
  
  return (
    <div className="movie-card" onClick={handleClick}>
      {/* Card content */}
    </div>
  );
});

// ✅ Route-based Code Splitting
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LibraryPage = React.lazy(() => import('../pages/LibraryPage'));
```

## Testing Standards
### Component Testing
```javascript
// ✅ Component Test Example
import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from './MovieCard';

describe('MovieCard', () => {
  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test-poster.jpg'
  };
  
  it('renders movie title correctly', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
  
  it('calls onAddToWatchlist when clicked', () => {
    const mockOnAdd = jest.fn();
    render(<MovieCard movie={mockMovie} onAddToWatchlist={mockOnAdd} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnAdd).toHaveBeenCalledWith(1);
  });
});
```

## Documentation Standards
### Component Documentation
```javascript
/**
 * MovieCard component displays a movie poster with metadata overlay
 * 
 * @param {Object} movie - Movie data object from TMDB
 * @param {string} movie.id - Unique movie identifier
 * @param {string} movie.title - Movie title
 * @param {string} movie.poster_path - Relative path to poster image
 * @param {Function} onAddToWatchlist - Callback when add to watchlist is clicked
 * @param {boolean} showMetadata - Whether to display metadata overlay on hover
 * 
 * @example
 * <MovieCard 
 *   movie={movieData} 
 *   onAddToWatchlist={handleAddToWatchlist}
 *   showMetadata={true}
 * />
 */
const MovieCard = ({ movie, onAddToWatchlist, showMetadata = true }) => {
  // Component implementation
};
```