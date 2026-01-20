// Arama Yöneticisi
class SearchManager {
    constructor(tmdbService, movieStore) {
        this.tmdbService = tmdbService;
        this.movieStore = movieStore;
        
        // Arama durumu
        this.searchState = {
            query: '',
            type: 'movie', // 'movie', 'tv', 'multi'
            isSearching: false,
            lastSearchTime: null,
            searchHistory: [],
            autoCompleteResults: []
        };
        
        // Debounce için
        this.searchDebounce = null;
        this.debounceDelay = 500;
        
        // İlk başlatma
        this.initialize();
    }
    
    // Başlangıç
    initialize() {
        // Arama geçmişini yükle
        this.loadSearchHistory();
        
        // Türleri yükle
        this.loadGenres();
    }
    
    // Türleri yükle
    async loadGenres() {
        try {
            const movieGenres = await this.tmdbService.getMovieGenres();
            const tvGenres = await this.tmdbService.getTVGenres();
            
            // Türleri birleştir ve benzersiz yap
            const allGenres = [...movieGenres.genres, ...tvGenres.genres];
            const uniqueGenres = Array.from(
                new Map(allGenres.map(genre => [genre.id, genre])).values()
            );
            
            // Store'a kaydet veya global erişim için
            window.Constants.GENRES = uniqueGenres.sort((a, b) => 
                a.name.localeCompare(b.name)
            );
            
            return uniqueGenres;
        } catch (error) {
            console.error('Türler yüklenemedi:', error);
            return [];
        }
    }
    
    // Arama geçmişini yükle
    loadSearchHistory() {
        const history = localStorage.getItem('searchHistory');
        if (history) {
            this.searchState.searchHistory = JSON.parse(history);
        }
    }
    
    // Arama geçmişini kaydet
    saveSearchHistory() {
        localStorage.setItem(
            'searchHistory', 
            JSON.stringify(this.searchState.searchHistory.slice(0, 20)) // Son 20 arama
        );
    }
    
    // Arama geçmişine ekle
    addToSearchHistory(query) {
        if (!query || query.trim().length === 0) return;
        
        const cleanQuery = query.trim();
        
        // Zaten varsa, en üste taşı
        const existingIndex = this.searchState.searchHistory.findIndex(
            item => item.query.toLowerCase() === cleanQuery.toLowerCase()
        );
        
        if (existingIndex !== -1) {
            this.searchState.searchHistory.splice(existingIndex, 1);
        }
        
        // En üste ekle
        this.searchState.searchHistory.unshift({
            query: cleanQuery,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('tr-TR')
        });
        
        // Sınırla
        if (this.searchState.searchHistory.length > 20) {
            this.searchState.searchHistory = this.searchState.searchHistory.slice(0, 20);
        }
        
        this.saveSearchHistory();
    }
    
    // Arama geçmişini temizle
    clearSearchHistory() {
        this.searchState.searchHistory = [];
        localStorage.removeItem('searchHistory');
    }
    
    // Film ara
    async searchMovies(query, page = 1) {
        try {
            this.movieStore.setLoading(true);
            this.searchState.isSearching = true;
            this.searchState.lastSearchTime = Date.now();
            
            const data = await this.tmdbService.searchMovies(query, page);
            
            // Store'a kaydet
            this.movieStore.setMovies(
                data.results,
                data.total_pages,
                data.total_results
            );
            
            // Geçmişe ekle
            this.addToSearchHistory(query);
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        } finally {
            this.searchState.isSearching = false;
        }
    }
    
    // Popüler filmleri getir
    async getPopularMovies(page = 1) {
        try {
            this.movieStore.setLoading(true);
            
            const data = await this.tmdbService.getPopularMovies(page);
            
            this.movieStore.setMovies(
                data.results,
                data.total_pages,
                data.total_results
            );
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
    
    // Film detaylarını getir
    async getMovieDetails(movieId) {
        try {
            this.movieStore.setLoading(true);
            
            // Önce cache'ten kontrol et
            const cached = this.movieStore.getMovieFromCache(movieId);
            if (cached) {
                this.movieStore.setMovieDetails(cached);
                return cached;
            }
            
            // API'den detayları getir
            const data = await this.tmdbService.getMovieDetails(
                movieId,
                'credits,videos,similar,recommendations'
            );
            
            const movie = new Movie(data);
            this.movieStore.setMovieDetails(movie);
            
            return movie;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
    
    // Filtreli keşfet
    async discoverMovies(filters = {}, page = 1) {
        try {
            this.movieStore.setLoading(true);
            
            const data = await this.tmdbService.discoverMovies(filters, page);
            
            this.movieStore.setMovies(
                data.results,
                data.total_pages,
                data.total_results
            );
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
    
    // Trendleri getir
    async getTrending(timeWindow = 'day') {
        try {
            this.movieStore.setLoading(true);
            
            const data = await this.tmdbService.getTrending('movie', timeWindow);
            
            this.movieStore.setMovies(
                data.results,
                data.total_pages,
                data.total_results
            );
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
    
    // Otomatik tamamlama
    async getAutoComplete(query) {
        if (!query || query.trim().length < 2) {
            this.searchState.autoCompleteResults = [];
            return [];
        }
        
        try {
            // Debounce
            clearTimeout(this.searchDebounce);
            
            return new Promise((resolve) => {
                this.searchDebounce = setTimeout(async () => {
                    try {
                        const data = await this.tmdbService.searchMovies(query, 1);
                        
                        // İlk 5 sonucu al
                        const results = data.results.slice(0, 5).map(movie => ({
                            id: movie.id,
                            title: movie.title,
                            year: movie.release_date ? 
                                new Date(movie.release_date).getFullYear() : '',
                            poster: movie.poster_path ? 
                                `${Constants.IMAGE_BASE_URL}/w92${movie.poster_path}` : null,
                            type: 'movie'
                        }));
                        
                        this.searchState.autoCompleteResults = results;
                        resolve(results);
                    } catch (error) {
                        console.error('Otomatik tamamlama hatası:', error);
                        this.searchState.autoCompleteResults = [];
                        resolve([]);
                    }
                }, this.debounceDelay);
            });
        } catch (error) {
            console.error('Otomatik tamamlama hatası:', error);
            return [];
        }
    }
    
    // Sayfa değiştir
    async changePage(page) {
        const currentQuery = this.movieStore.searchQuery;
        
        if (currentQuery && currentQuery.trim().length > 0) {
            // Arama sonuçlarında sayfa değiştir
            await this.searchMovies(currentQuery, page);
        } else {
            // Popüler filmlerde sayfa değiştir
            await this.getPopularMovies(page);
        }
        
        this.movieStore.setPage(page);
    }
    
    // Filtre uygula
    async applyFilters(filters = {}) {
        try {
            this.movieStore.setLoading(true);
            
            // Store'daki filtreleri güncelle
            if (filters.genre) {
                this.movieStore.setFilter('genre', filters.genre);
            }
            if (filters.sort) {
                this.movieStore.setFilter('sort', filters.sort);
            }
            if (filters.year) {
                this.movieStore.setFilter('year', filters.year);
            }
            
            // Keşfet API'sini kullan
            const discoverFilters = {
                sortBy: filters.sort || 'popularity.desc',
                genre: filters.genre || '',
                year: filters.year || '',
                rating: filters.rating || 0,
                language: filters.language || 'tr'
            };
            
            const data = await this.discoverMovies(discoverFilters, 1);
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
    
    // Film türlerini getir
    getGenres() {
        return window.Constants.GENRES || [];
    }
    
    // Yılları getir (son 30 yıl)
    getYears() {
        const currentYear = new Date().getFullYear();
        const years = [];
        
        for (let year = currentYear; year >= currentYear - 30; year--) {
            years.push(year);
        }
        
        return years;
    }
    
    // Sıralama seçeneklerini getir
    getSortOptions() {
        return [
            { value: 'popularity.desc', label: 'Popülerlik (Azalan)' },
            { value: 'vote_average.desc', label: 'Puan (Yüksekten Düşüğe)' },
            { value: 'release_date.desc', label: 'Yayın Tarihi (Yeniden Eskiye)' },
            { value: 'revenue.desc', label: 'Gişe Hasılatı (Yüksekten Düşüğe)' },
            { value: 'original_title.asc', label: 'İsim (A-Z)' }
        ];
    }
    
    // Arama durumu bilgisi
    getSearchInfo() {
        const query = this.movieStore.searchQuery;
        const totalResults = this.movieStore.totalResults;
        const currentPage = this.movieStore.currentPage;
        const totalPages = this.movieStore.totalPages;
        
        if (query && query.trim().length > 0) {
            return {
                type: 'search',
                query: query,
                results: totalResults,
                page: currentPage,
                totalPages: totalPages,
                message: `"${query}" için ${totalResults} sonuç bulundu`
            };
        } else {
            return {
                type: 'popular',
                results: totalResults,
                page: currentPage,
                totalPages: totalPages,
                message: `Popüler filmler (${totalResults} film)`
            };
        }
    }
    
    // Arama performansı
    getPerformanceMetrics() {
        if (!this.searchState.lastSearchTime) return null;
        
        const now = Date.now();
        const searchDuration = now - this.searchState.lastSearchTime;
        
        return {
            lastSearchTime: this.searchState.lastSearchTime,
            searchDuration: searchDuration,
            isSearching: this.searchState.isSearching,
            searchHistoryCount: this.searchState.searchHistory.length
        };
    }
    
    // Öneriler getir (benzer filmler)
    async getRecommendations(movieId, limit = 6) {
        try {
            const data = await this.tmdbService.getMovieRecommendations(movieId);
            return data.results.slice(0, limit).map(movie => new Movie(movie));
        } catch (error) {
            console.error('Öneriler getirilemedi:', error);
            return [];
        }
    }
    
    // Çoklu arama (film, dizi, oyuncu)
    async multiSearch(query, page = 1) {
        try {
            this.movieStore.setLoading(true);
            
            const data = await this.tmdbService.multiSearch(query, page);
            
            // Sadece filmleri filtrele
            const movies = data.results.filter(item => item.media_type === 'movie');
            
            this.movieStore.setMovies(
                movies,
                data.total_pages,
                data.total_results
            );
            
            return data;
        } catch (error) {
            this.movieStore.setError(error);
            throw error;
        }
    }
}

// Global erişim için
window.SearchManager = SearchManager;