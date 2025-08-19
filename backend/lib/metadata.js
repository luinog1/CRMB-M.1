const axios = require('axios');

/**
 * MetadataProvider class for fetching metadata from TMDB
 */
class MetadataProvider {
    /**
     * Create a new MetadataProvider
     * @param {string} apiKey - TMDB API key
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
        
        if (!this.apiKey) {
            console.warn('TMDB API key not provided. Using mock data.');
        }
    }
    
    /**
     * Get catalog metadata
     * @param {string} type - Content type (movie or series)
     * @param {string} id - Catalog ID
     * @param {number} skip - Number of items to skip
     * @param {number} limit - Maximum number of items to return
     * @returns {Promise<Array>} - Array of metadata objects
     */
    async getCatalog(type, id, skip = 0, limit = 100) {
        console.log(`Getting catalog for ${type}/${id} (skip: ${skip}, limit: ${limit})`);
        
        if (!this.apiKey) {
            return this.getMockCatalog(type, skip, limit);
        }
        
        try {
            let endpoint;
            
            if (type === 'movie') {
                endpoint = '/discover/movie';
            } else if (type === 'series') {
                endpoint = '/discover/tv';
            } else {
                throw new Error(`Unsupported type: ${type}`);
            }
            
            const response = await axios.get(`${this.baseUrl}${endpoint}`, {
                params: {
                    api_key: this.apiKey,
                    language: 'en-US',
                    sort_by: 'popularity.desc',
                    include_adult: false,
                    page: Math.floor(skip / 20) + 1
                }
            });
            
            return this.transformTmdbResults(response.data.results, type);
        } catch (error) {
            console.error(`Error fetching catalog for ${type}/${id}:`, error);
            return this.getMockCatalog(type, skip, limit);
        }
    }
    
    /**
     * Search for content
     * @param {string} type - Content type (movie or series)
     * @param {string} query - Search query
     * @returns {Promise<Object>} - Search results
     */
    async search(type, query) {
        console.log(`Searching for ${type}: ${query}`);
        
        if (!this.apiKey) {
            return { metas: [] };
        }
        
        try {
            const searchType = type === 'series' ? 'tv' : type;
            
            const response = await axios.get(`${this.baseUrl}/search/${searchType}`, {
                params: {
                    api_key: this.apiKey,
                    language: 'en-US',
                    query: query,
                    include_adult: false,
                    page: 1
                }
            });
            
            const metas = this.transformTmdbResults(response.data.results, type);
            return { metas };
        } catch (error) {
            console.error(`Error searching for ${type} with query "${query}":`, error);
            return { metas: [] };
        }
    }
    
    /**
     * Get detailed metadata for a specific item
     * @param {string} type - Content type (movie or series)
     * @param {string} id - IMDB ID
     * @returns {Promise<Object>} - Detailed metadata
     */
    async getMeta(type, id) {
        console.log(`Getting metadata for ${type}/${id}`);
        
        if (!this.apiKey) {
            return this.getMockMeta(type, id);
        }
        
        try {
            // Extract TMDB ID from IMDB ID
            const tmdbId = id.replace('tt', '');
            const contentType = type === 'series' ? 'tv' : type;
            
            const response = await axios.get(`${this.baseUrl}/${contentType}/${tmdbId}`, {
                params: {
                    api_key: this.apiKey,
                    language: 'en-US',
                    append_to_response: 'videos,credits'
                }
            });
            
            return this.transformTmdbMeta(response.data, type);
        } catch (error) {
            console.error(`Error fetching metadata for ${type}/${id}:`, error);
            return this.getMockMeta(type, id);
        }
    }
    
    /**
     * Transform TMDB results to Stremio format
     * @param {Array} results - TMDB results
     * @param {string} type - Content type
     * @returns {Array} - Transformed results
     */
    transformTmdbResults(results, type) {
        return results.map(item => {
            const id = `tt${item.id}`; // Prefix with 'tt' to mimic IMDB IDs
            
            return {
                id,
                type,
                name: item.title || item.name,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                year: new Date(item.release_date || item.first_air_date).getFullYear(),
                description: item.overview,
                imdbRating: (item.vote_average / 2).toFixed(1)
            };
        });
    }
    
    /**
     * Transform TMDB metadata to Stremio format
     * @param {Object} data - TMDB metadata
     * @param {string} type - Content type
     * @returns {Object} - Transformed metadata
     */
    transformTmdbMeta(data, type) {
        const videos = data.videos?.results || [];
        const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        
        const meta = {
            id: `tt${data.id}`,
            type,
            name: data.title || data.name,
            year: new Date(data.release_date || data.first_air_date).getFullYear(),
            poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
            background: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
            description: data.overview,
            runtime: data.runtime || (data.episode_run_time && data.episode_run_time[0]),
            language: data.original_language,
            country: data.production_countries && data.production_countries[0]?.iso_3166_1,
            genres: data.genres?.map(g => g.name) || [],
            imdbRating: (data.vote_average / 2).toFixed(1),
            released: data.release_date || data.first_air_date,
            trailers: trailer ? [{ source: trailer.key, type: 'Trailer' }] : []
        };
        
        // Add cast
        if (data.credits?.cast) {
            meta.cast = data.credits.cast.slice(0, 10).map(person => person.name);
        }
        
        // Add director for movies
        if (type === 'movie' && data.credits?.crew) {
            const directors = data.credits.crew
                .filter(person => person.job === 'Director')
                .map(person => person.name);
            
            if (directors.length > 0) {
                meta.director = directors;
            }
        }
        
        // Add series-specific data
        if (type === 'series') {
            meta.status = data.status;
            meta.episodes = data.number_of_episodes;
            meta.seasons = data.number_of_seasons;
        }
        
        return meta;
    }
    
    /**
     * Get mock catalog data
     * @param {string} type - Content type
     * @param {number} skip - Number of items to skip
     * @param {number} limit - Maximum number of items to return
     * @returns {Array} - Mock catalog data
     */
    getMockCatalog(type, skip = 0, limit = 100) {
        const mockMovies = [
            {
                id: 'tt0111161',
                type: 'movie',
                name: 'The Shawshank Redemption',
                poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                year: 1994,
                imdbRating: '9.3',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
            },
            {
                id: 'tt0068646',
                type: 'movie',
                name: 'The Godfather',
                poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                year: 1972,
                imdbRating: '9.2',
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
            },
            {
                id: 'tt0071562',
                type: 'movie',
                name: 'The Godfather: Part II',
                poster: 'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                year: 1974,
                imdbRating: '9.0',
                description: 'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.'
            }
        ];
        
        const mockSeries = [
            {
                id: 'tt0944947',
                type: 'series',
                name: 'Game of Thrones',
                poster: 'https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg',
                year: 2011,
                imdbRating: '9.2',
                description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.'
            },
            {
                id: 'tt0903747',
                type: 'series',
                name: 'Breaking Bad',
                poster: 'https://m.media-amazon.com/images/M/MV5BMjhiMzgxZTctNDc1Ni00OTIxLTlhMTYtZTA3ZWFkODRkNmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                year: 2008,
                imdbRating: '9.5',
                description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.'
            },
            {
                id: 'tt0108778',
                type: 'series',
                name: 'Friends',
                poster: 'https://m.media-amazon.com/images/M/MV5BNDVkYjU0MzctMWRmZi00NTkxLTgwZWEtOWVhYjZlYjllYmU4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg',
                year: 1994,
                imdbRating: '8.9',
                description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.'
            }
        ];
        
        const mockData = type === 'movie' ? mockMovies : mockSeries;
        return mockData.slice(skip, skip + limit);
    }
    
    /**
     * Get mock metadata
     * @param {string} type - Content type
     * @param {string} id - Content ID
     * @returns {Object} - Mock metadata
     */
    getMockMeta(type, id) {
        const mockMovies = {
            'tt0111161': {
                id: 'tt0111161',
                type: 'movie',
                name: 'The Shawshank Redemption',
                year: 1994,
                poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                background: 'https://m.media-amazon.com/images/M/MV5BNTYxOTYyMzE3NV5BMl5BanBnXkFtZTcwOTMxNDY3Mw@@._V1_SX1777_CR0,0,1777,999_AL_.jpg',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                runtime: 142,
                language: 'en',
                genres: ['Drama'],
                imdbRating: '9.3',
                released: '1994-10-14',
                director: ['Frank Darabont'],
                cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler']
            }
        };
        
        const mockSeries = {
            'tt0944947': {
                id: 'tt0944947',
                type: 'series',
                name: 'Game of Thrones',
                year: 2011,
                poster: 'https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_SX300.jpg',
                background: 'https://m.media-amazon.com/images/M/MV5BZjA5NWVhMzktNjEzMS00YWY5LTg0YTUtZjY0Y2QzNjAyMjk0XkEyXkFqcGdeQXVyNjU2NjA5NjM@._V1_SX1777_CR0,0,1777,999_AL_.jpg',
                description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
                runtime: 60,
                language: 'en',
                genres: ['Action', 'Adventure', 'Drama'],
                imdbRating: '9.2',
                released: '2011-04-17',
                cast: ['Emilia Clarke', 'Peter Dinklage', 'Kit Harington', 'Lena Headey'],
                status: 'Ended',
                episodes: 73,
                seasons: 8
            }
        };
        
        const mockData = type === 'movie' ? mockMovies : mockSeries;
        return mockData[id] || null;
    }
}

module.exports = MetadataProvider;