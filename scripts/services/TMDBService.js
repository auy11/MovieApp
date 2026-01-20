// TMDB API Servisi
class TMDBService {
    constructor(apiKey = Constants.API_KEY) {
        if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
            throw new Error(Constants.ERROR_MESSAGES.API_KEY_MISSING);
        }
        
        this.apiKey = apiKey;
        this.baseURL = Constants.BASE_URL;
        this.imageBaseURL = Constants.IMAGE_BASE_URL;
        this.language = Constants.LANGUAGE;
        
        // Cache sistemi
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 dakika
        
        // İstek sayacı
        this.requestCount = 0;
        this.requestLimit = 40; // API limiti
        
        // Hata yönetimi
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }
    
    // Cache kontrolü
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > this.cacheDuration) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    // Cache'e ekle
    setToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Cache boyutu kontrolü
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
    
    // API isteği gönder
    async fetch(endpoint, params = {}, useCache = true) {
        const cacheKey = this.generateCacheKey(endpoint, params);
        
        // Cache kontrolü
        if (useCache) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                console.log(`Cache'ten yüklendi: ${endpoint}`);
                return cachedData;
            }
        }
        
        // İstek limiti kontrolü
        if (this.requestCount >= this.requestLimit) {
            throw new Error('API istek limiti aşıldı. Lütfen bekleyin.');
        }
        
        // Parametreleri hazırla
        const queryParams = new URLSearchParams({
            api_key: this.apiKey,
            language: this.language,
            ...params
        });
        
        const url = `${this.baseURL}${endpoint}?${queryParams}`;
        this.requestCount++;
        
        // İstek gönder
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`API isteği: ${endpoint} (Deneme: ${attempt})`);
                
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                // Rate limit kontrolü
                const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || this.requestLimit);
                this.requestLimit = remaining;
                
                if (!response.ok) {
                    const error = await this.handleError(response);
                    throw error;
                }
                
                const data = await response.json();
                
                // Cache'e kaydet
                if (useCache) {
                    this.setToCache(cacheKey, data);
                }
                
                return data;
                
            } catch (error) {
                console.error(`API isteği hatası (${attempt}/${this.retryAttempts}):`, error);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // Bekle ve tekrar dene
                await this.delay(this.retryDelay * attempt);
            }
        }
    }
    
    // Hata yönetimi
    async handleError(response) {
        const status = response.status;
        let message = Constants.ERROR_MESSAGES.DEFAULT;
        
        try {
            const errorData = await response.json();
            message = errorData.status_message || message;
        } catch (e) {
            // JSON parse hatası
        }
        
        switch (status) {
            case 401:
                message = 'Geçersiz API anahtarı. Lütfen API anahtarınızı kontrol edin.';
                break;
            case 404:
                message = 'İstenen kaynak bulunamadı.';
                break;
            case 429:
                message = 'Çok fazla istek gönderildi. Lütfen bekleyin.';
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                message = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
                break;
        }
        
        return new Error(`API Hatası (${status}): ${message}`);
    }
    
    // Gecikme fonksiyonu
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Cache key oluştur
    generateCacheKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }
    
    // Cache'i temizle
    clearCache() {
        this.cache.clear();
        console.log('API cache temizlendi.');
    }
    
    // Film ara
    async searchMovies(query, page = 1) {
        if (!query || query.trim().length === 0) {
            throw new Error('Arama sorgusu boş olamaz.');
        }
        
        return this.fetch('/search/movie', {
            query: query.trim(),
            page: page,
            include_adult: false
        });
    }
    
    // Dizi ara
    async searchTV(query, page = 1) {
        if (!query || query.trim().length === 0) {
            throw new Error('Arama sorgusu boş olamaz.');
        }
        
        return this.fetch('/search/tv', {
            query: query.trim(),
            page: page,
            include_adult: false
        });
    }
    
    // Popüler filmler
    async getPopularMovies(page = 1) {
        return this.fetch('/movie/popular', {
            page: page,
            region: 'TR'
        });
    }
    
    // Vizyondaki filmler
    async getNowPlayingMovies(page = 1) {
        return this.fetch('/movie/now_playing', {
            page: page,
            region: 'TR'
        });
    }
    
    // Yakında vizyona girecek filmler
    async getUpcomingMovies(page = 1) {
        return this.fetch('/movie/upcoming', {
            page: page,
            region: 'TR'
        });
    }
    
    // En iyi puanlı filmler
    async getTopRatedMovies(page = 1) {
        return this.fetch('/movie/top_rated', {
            page: page
        });
    }
    
    // Film detayları
    async getMovieDetails(movieId, appendToResponse = '') {
        if (!movieId) {
            throw new Error('Film ID gereklidir.');
        }
        
        const params = {};
        if (appendToResponse) {
            params.append_to_response = appendToResponse;
        }
        
        return this.fetch(`/movie/${movieId}`, params);
    }
    
    // Film kredileri (oyuncular)
    async getMovieCredits(movieId) {
        if (!movieId) {
            throw new Error('Film ID gereklidir.');
        }
        
        return this.fetch(`/movie/${movieId}/credits`);
    }
    
    // Film videoları
    async getMovieVideos(movieId) {
        if (!movieId) {
            throw new Error('Film ID gereklidir.');
        }
        
        return this.fetch(`/movie/${movieId}/videos`);
    }
    
    // Benzer filmler
    async getSimilarMovies(movieId, page = 1) {
        if (!movieId) {
            throw new Error('Film ID gereklidir.');
        }
        
        return this.fetch(`/movie/${movieId}/similar`, { page });
    }
    
    // Önerilen filmler
    async getMovieRecommendations(movieId, page = 1) {
        if (!movieId) {
            throw new Error('Film ID gereklidir.');
        }
        
        return this.fetch(`/movie/${movieId}/recommendations`, { page });
    }
    
    // Film türleri
    async getMovieGenres() {
        return this.fetch('/genre/movie/list');
    }
    
    // Dizi türleri
    async getTVGenres() {
        return this.fetch('/genre/tv/list');
    }
    
    // Popüler diziler
    async getPopularTVShows(page = 1) {
        return this.fetch('/tv/popular', { page });
    }
    
    // Dizi detayları
    async getTVDetails(tvId, appendToResponse = '') {
        if (!tvId) {
            throw new Error('Dizi ID gereklidir.');
        }
        
        const params = {};
        if (appendToResponse) {
            params.append_to_response = appendToResponse;
        }
        
        return this.fetch(`/tv/${tvId}`, params);
    }
    
    // Oyuncu detayları
    async getPersonDetails(personId) {
        if (!personId) {
            throw new Error('Oyuncu ID gereklidir.');
        }
        
        return this.fetch(`/person/${personId}`, {
            append_to_response: 'combined_credits,external_ids'
        });
    }
    
    // Keşfet (filtreli arama)
    async discoverMovies(filters = {}, page = 1) {
        const params = {
            page: page,
            sort_by: filters.sortBy || 'popularity.desc',
            include_adult: false,
            include_video: false,
            with_watch_monetization_types: 'flatrate'
        };
        
        // Filtreleri ekle
        if (filters.genre) params.with_genres = filters.genre;
        if (filters.year) params.primary_release_year = filters.year;
        if (filters.rating) params['vote_average.gte'] = filters.rating;
        if (filters.language) params.with_original_language = filters.language;
        if (filters.region) params.region = filters.region;
        if (filters.runtime) {
            params['with_runtime.gte'] = filters.runtime.min;
            params['with_runtime.lte'] = filters.runtime.max;
        }
        
        return this.fetch('/discover/movie', params);
    }
    
    // Günlük trendler
    async getTrending(mediaType = 'all', timeWindow = 'day') {
        if (!['movie', 'tv', 'person', 'all'].includes(mediaType)) {
            throw new Error('Geçersiz medya tipi.');
        }
        
        if (!['day', 'week'].includes(timeWindow)) {
            throw new Error('Geçersiz zaman penceresi.');
        }
        
        return this.fetch(`/trending/${mediaType}/${timeWindow}`);
    }
    
    // Multi-search (film, dizi, oyuncu)
    async multiSearch(query, page = 1) {
        if (!query || query.trim().length === 0) {
            throw new Error('Arama sorgusu boş olamaz.');
        }
        
        return this.fetch('/search/multi', {
            query: query.trim(),
            page: page,
            include_adult: false
        });
    }
    
    // Resim URL'si oluştur
    getImageUrl(path, size = 'original', type = 'poster') {
        if (!path) return null;
        
        const sizes = Constants.IMAGE_SIZES[type.toUpperCase()];
        const imageSize = sizes ? sizes[size.toUpperCase()] : size;
        
        return `${this.imageBaseURL}/${imageSize}${path}`;
    }
    
    // API durumu kontrolü
    async checkAPIStatus() {
        try {
            const response = await fetch(`${this.baseURL}/configuration?api_key=${this.apiKey}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // İstatistikler
    getStats() {
        return {
            requestCount: this.requestCount,
            cacheSize: this.cache.size,
            requestLimit: this.requestLimit
        };
    }
}

// Global erişim için
window.TMDBService = TMDBService;