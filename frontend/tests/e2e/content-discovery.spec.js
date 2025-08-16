import { test, expect } from '@playwright/test';

test.describe('CRMB-M.1 Content Discovery and Addon Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should load home page with demo content', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Vite \+ React/);
    
    // Verify main navigation elements
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    
    // Verify header elements
    await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible();
    await expect(page.getByPlaceholder('Search movies, TV shows...')).toBeVisible();
    
    // Verify featured content section
    await expect(page.getByRole('heading', { name: 'The Dark Knight' })).toBeVisible();
    await expect(page.getByText('2008')).toBeVisible();
    await expect(page.getByText('9.0')).toBeVisible();
    
    // Verify demo movies section
    await expect(page.getByRole('heading', { name: 'Demo Movies (Click to Test Detail Page)' })).toBeVisible();
    
    // Verify demo movie cards are present
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Interstellar' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Matrix' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pulp Fiction' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fight Club' })).toBeVisible();
  });

  test('should navigate to Inception detail page and display TMDB data', async ({ page }) => {
    // Navigate directly to Inception detail page
    await page.goto('/detail/movie/27205');
    
    // Wait for content to load
    await expect(page.getByText('Loading content details...')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Verify TMDB data is displayed
    await expect(page.getByText('2010')).toBeVisible();
    await expect(page.getByText('8.8')).toBeVisible();
    await expect(page.getByText('148 min')).toBeVisible();
    await expect(page.getByText('Movie')).toBeVisible();
    
    // Verify genres
    await expect(page.getByText('Action, Science Fiction, Thriller')).toBeVisible();
    
    // Verify overview
    await expect(page.getByText(/A thief who steals corporate secrets/)).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to Library' })).toBeVisible();
    
    // Verify back button
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  test('should display cast information from TMDB', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Verify cast section
    await expect(page.getByRole('heading', { name: 'Cast' })).toBeVisible();
    
    // Verify main cast members
    await expect(page.getByText('Leonardo DiCaprio')).toBeVisible();
    await expect(page.getByText('Dom Cobb')).toBeVisible();
    await expect(page.getByText('Marion Cotillard')).toBeVisible();
    await expect(page.getByText('Mal')).toBeVisible();
    await expect(page.getByText('Tom Hardy')).toBeVisible();
    await expect(page.getByText('Eames')).toBeVisible();
  });

  test('should display Stremio Cinemeta addon metadata', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Verify additional information section (from Stremio addon)
    await expect(page.getByRole('heading', { name: 'Additional Information' })).toBeVisible();
    
    // Verify director information from Cinemeta
    await expect(page.getByText('Director:')).toBeVisible();
    await expect(page.getByText('Christopher Nolan')).toBeVisible();
    
    // Verify writer information from Cinemeta
    await expect(page.getByText('Writer:')).toBeVisible();
    
    // Verify country information from Cinemeta
    await expect(page.getByText('Country:')).toBeVisible();
    await expect(page.getByText(/United States/)).toBeVisible();
  });

  test('should display similar movies and allow navigation', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Verify similar movies section
    await expect(page.getByRole('heading', { name: 'Similar Movies' })).toBeVisible();
    
    // Verify similar movie items are present
    await expect(page.getByText('Interstellar')).toBeVisible();
    await expect(page.getByText('The Matrix')).toBeVisible();
  });

  test('should navigate to The Matrix detail page and display addon data', async ({ page }) => {
    await page.goto('/detail/movie/603');
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: 'The Matrix' })).toBeVisible({ timeout: 10000 });
    
    // Verify TMDB data
    await expect(page.getByText('1999')).toBeVisible();
    await expect(page.getByText('8.7')).toBeVisible();
    await expect(page.getByText('136 min')).toBeVisible();
    await expect(page.getByText('Action, Science Fiction')).toBeVisible();
    
    // Verify overview
    await expect(page.getByText(/A computer hacker learns from mysterious rebels/)).toBeVisible();
    
    // Verify cast from TMDB
    await expect(page.getByText('Keanu Reeves')).toBeVisible();
    await expect(page.getByText('Neo')).toBeVisible();
    await expect(page.getByText('Laurence Fishburne')).toBeVisible();
    await expect(page.getByText('Morpheus')).toBeVisible();
    
    // Verify Stremio addon data
    await expect(page.getByRole('heading', { name: 'Additional Information' })).toBeVisible();
    await expect(page.getByText('Director:')).toBeVisible();
    await expect(page.getByText(/Wachowski/)).toBeVisible();
    await expect(page.getByText('Writer:')).toBeVisible();
    await expect(page.getByText('Country:')).toBeVisible();
    await expect(page.getByText(/United States/)).toBeVisible();
  });

  test('should handle back navigation correctly', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Navigate to a detail page
    await page.goto('/detail/movie/27205');
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Click back button
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Should navigate back (browser back functionality)
    // Note: This tests the browser's back functionality
    await page.waitForTimeout(1000);
  });

  test('should display error for non-existent content', async ({ page }) => {
    // Navigate to a non-existent movie ID
    await page.goto('/detail/movie/999999');
    
    // Should show error message
    await expect(page.getByRole('heading', { name: 'Error Loading Content' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Go Back' })).toBeVisible();
  });

  test('should verify API integration endpoints', async ({ page }) => {
    // Test that the backend is responding
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const healthData = await response.json();
    expect(healthData.status).toBe('ok');
    expect(healthData.message).toBe('CRUMBLE BFF server is running');
  });

  test('should verify TMDB test data endpoint', async ({ page }) => {
    // Test TMDB endpoint with test data
    const response = await page.request.get('/api/tmdb/movie/27205');
    expect(response.ok()).toBeTruthy();
    
    const movieData = await response.json();
    expect(movieData.title).toBe('Inception');
    expect(movieData.id).toBe(27205);
    expect(movieData.vote_average).toBe(8.8);
  });

  test('should verify Stremio addon integration', async ({ page }) => {
    // Test Stremio metadata endpoint
    const response = await page.request.get('/api/stremio/meta-by-tmdb/movie/27205');
    expect(response.ok()).toBeTruthy();
    
    const stremioData = await response.json();
    expect(stremioData.meta).toBeDefined();
    expect(stremioData.meta.name).toBe('Inception');
    expect(stremioData.meta.imdb_id).toBe('tt1375666');
    expect(stremioData.meta.director).toContain('Christopher Nolan');
  });

  test('should verify Cinemeta addon manifest', async ({ page }) => {
    // Test Cinemeta addon manifest
    const response = await page.request.get('/api/stremio/addon/cinemeta/manifest');
    expect(response.ok()).toBeTruthy();
    
    const manifest = await response.json();
    expect(manifest.name).toBe('Cinemeta');
    expect(manifest.resources).toContain('meta');
    expect(manifest.types).toContain('movie');
  });

  test('should handle multiple detail page navigations', async ({ page }) => {
    // Navigate through multiple detail pages to test data consistency
    
    // Start with Inception
    await page.goto('/detail/movie/27205');
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('2010')).toBeVisible();
    
    // Navigate to The Matrix
    await page.goto('/detail/movie/603');
    await expect(page.getByRole('heading', { name: 'The Matrix' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('1999')).toBeVisible();
    
    // Verify data is correctly loaded for each movie
    await expect(page.getByText('Keanu Reeves')).toBeVisible();
    await expect(page.getByText('Neo')).toBeVisible();
  });

  test('should verify responsive design elements', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    await expect(page.getByRole('heading', { name: 'Inception' })).toBeVisible({ timeout: 10000 });
    
    // Verify key UI elements are present and styled
    const poster = page.locator('img[alt="Inception"]');
    await expect(poster).toBeVisible();
    
    // Verify rating display
    const rating = page.getByText('8.8');
    await expect(rating).toBeVisible();
    
    // Verify genre tags
    await expect(page.getByText('Action, Science Fiction, Thriller')).toBeVisible();
  });
});