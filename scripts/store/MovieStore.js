// Film Store - State Management
class MovieStore {
    constructor() {
        // Durumlar
        this.state = {
            // Film listesi
            movies: [],
            filteredMovies: [],
            
            // Seçili film
            selectedMovie: null,
            movieDetails: null,
            
            // Listeler
            favorites: [],
            watchlist: [],
            
            // Arama ve filtreler
            searchQuery: '',
            currentGenre: '',
            currentSort: 'popularity.desc',
            currentYear: '',
            
            // Sayfalama
            currentPage: 1,
            totalPages: 1,
            totalResults: 0,
            
            // Görünüm
            viewMode: 'grid',
            isLoading: false,
            error: null,
            
            // İstatistikler
            stats: {
                totalMovies: 0,
                totalFavorites: 0,
                totalWatchlist: 0,
                totalViews: 0
            },
            
            // Cache
            cache: {
                movies: new Map(),
                details: new Map(),
                genres: null
            }
        };
        
        // Aboneler (observer pattern)
        this.subscribers = new Set();
        
        // LocalStorage Manager
        this.storage = new LocalStorageManager();
        
        // Başlangıç durumunu yükle
        this.loadInitialState();
    }
    
    // Durum yükleme
    loadInitialState() {
        // LocalStorage'dan verileri yükle
        this.state.favorites = this.storage.getFavorites();
        this.state.watchlist = this.storage.getWatchlist();
        this.state.viewMode = this.storage.getViewMode() || 'grid';
        this.state.searchQuery = this.storage.getLastSearch() || '';
        
        // İstatistikleri güncelle
        this.updateStats();
        
        // Abonelere bildir
        this.notify();
    }
    
    // Abone ekle
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback); // Unsubscribe fonksiyonu
    }
    
    // Abonelere bildir
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }
    
    // State güncelle
    setState(updates) {
        // Derin birleştirme
        const deepMerge = (target, source) => {
            for (const key in source) {
                if (source[key] instanceof Object && key in target) {
                    Object.assign(source[key], deepMerge(target[key], source[key]));
                }
            }
            Object.assign(target, source);
            return target;
        };
        
        deepMerge(this.state, updates);
        this.notify();
    }
    
    // Filmleri ayarla
    setMovies(movies, totalPages = 1, totalResults = 0) {
        const movieObjects = movies.map(movieData => new Movie(movieData));
        
        this.setState({
            movies: movieObjects,
            filteredMovies: movieObjects,
            totalPages: Math.min(totalPages, Constants.PAGINATION.MAX_TOTAL_PAGES),
            totalResults: totalResults,
            isLoading: false,
            error: null
        });
        
        // Cache'e ekle
        movieObjects.forEach(movie => {
            this.state.cache.movies.set(movie.id, movie);
        });
    }
    
    // Filtrele
    filterMovies() {
        let filtered = [...this.state.movies];
        
        // Tür filtresi
        if (this.state.currentGenre) {
            filtered = filtered.filter(movie => 
                movie.genreIds.includes(parseInt(this.state.currentGenre))
            );
        }
        
        // Yıl filtresi
        if (this.state.currentYear) {
            filtered = filtered.filter(movie => 
                movie.releaseYear === parseInt(this.state.currentYear)
            );
        }
        
        // Sıralama
        filtered.sort((a, b) => {
            switch (this.state.currentSort) {
                case 'vote_average.desc':
                    return b.voteAverage - a.voteAverage;
                case 'release_date.desc':
                    return new Date(b.releaseDate) - new Date(a.releaseDate);
                case 'revenue.desc':
                    return b.revenue - a.revenue;
                case 'popularity.desc':
                default:
                    return b.popularity - a.popularity;
            }
        });
        
        this.setState({ filteredMovies: filtered });
    }
    
    // Arama
    async searchMovies(query, page = 1) {
        this.setState({
            searchQuery: query,
            currentPage: page,
            isLoading: true,
            error: null
        });
        
        // LocalStorage'a kaydet
        this.storage.saveLastSearch(query);
    }
    
    // Sayfa değiştir
    setPage(page) {
        const validPage = Math.max(1, Math.min(page, this.state.totalPages));
        this.setState({ currentPage: validPage });
    }
    
    // Favori ekle
    addFavorite(movie) {
        const favorites = [...this.state.favorites];
        const exists = favorites.some(fav => fav.id === movie.id);
        
        if (!exists) {
            favorites.push(movie);
            
            this.setState({ favorites });
            this.storage.saveFavorites(favorites);
            this.updateStats();
            
            Helpers.showNotification(
                Constants.SUCCESS_MESSAGES.ADDED_TO_FAVORITES,
                'success'
            );
            
            return true;
        }
        
        return false;
    }
    
    // Favori çıkar
    removeFavorite(movieId) {
        const favorites = this.state.favorites.filter(fav => fav.id !== movieId);
        
        this.setState({ favorites });
        this.storage.saveFavorites(favorites);
        this.updateStats();
        
        Helpers.showNotification(
            Constants.SUCCESS_MESSAGES.REMOVED_FROM_FAVORITES,
            'info'
        );
        
        return true;
    }
    
    // Favori mi kontrol et
    isFavorite(movieId) {
        return this.state.favorites.some(fav => fav.id === movieId);
    }
    
    // İzleneceklere ekle
    addToWatchlist(movie) {
        const watchlist = [...this.state.watchlist];
        const exists = watchlist.some(item => item.id === movie.id);
        
        if (!exists) {
            watchlist.push(movie);
            
            this.setState({ watchlist });
            this.storage.saveWatchlist(watchlist);
            this.updateStats();
            
            Helpers.showNotification(
                Constants.SUCCESS_MESSAGES.ADDED_TO_WATCHLIST,
                'success'
            );
            
            return true;
        }
        
        return false;
    }
    
    // İzleneceklerden çıkar
    removeFromWatchlist(movieId) {
        const watchlist = this.state.watchlist.filter(item => item.id !== movieId);
        
        this.setState({ watchlist });
        this.storage.saveWatchlist(watchlist);
        this.updateStats();
        
        Helpers.showNotification(
            Constants.SUCCESS_MESSAGES.REMOVED_FROM_WATCHLIST,
            'info'
        );
        
        return true;
    }
    
    // İzleneceklerde mi kontrol et
    isInWatchlist(movieId) {
        return this.state.watchlist.some(item => item.id === movieId);
    }
    
    // Film detaylarını ayarla
    setMovieDetails(movie) {
        // Görüntülenme sayacını artır
        movie.incrementViewCount();
        
        // Cache'e ekle
        this.state.cache.details.set(movie.id, movie);
        
        this.setState({
            selectedMovie: movie,
            movieDetails: movie.toDetailData(),
            isLoading: false,
            error: null
        });
    }
    
    // Cache'ten film getir
    getMovieFromCache(movieId) {
        return this.state.cache.movies.get(movieId) || 
               this.state.cache.details.get(movieId);
    }
    
    // Tüm verileri temizle
    clearAllData() {
        this.storage.clear();
        
        this.setState({
            movies: [],
            filteredMovies: [],
            favorites: [],
            watchlist: [],
            searchQuery: '',
            currentGenre: '',
            currentYear: '',
            currentPage: 1,
            totalPages: 1,
            totalResults: 0,
            selectedMovie: null,
            movieDetails: null
        });
        
        this.state.cache.movies.clear();
        this.state.cache.details.clear();
        
        this.updateStats();
    }
    
    // İstatistikleri güncelle
    updateStats() {
        const totalViews = [...this.state.cache.details.values()]
            .reduce((sum, movie) => sum + (movie.viewCount || 0), 0);
        
        this.setState({
            stats: {
                totalMovies: this.state.cache.movies.size,
                totalFavorites: this.state.favorites.length,
                totalWatchlist: this.state.watchlist.length,
                totalViews: totalViews
            }
        });
    }
    
    // Durumu export et
    exportState() {
        const exportData = {
            favorites: this.state.favorites,
            watchlist: this.state.watchlist,
            lastSearch: this.state.searchQuery,
            viewMode: this.state.viewMode,
            stats: this.state.stats,
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Durumu import et
    importState(data) {
        try {
            const parsed = JSON.parse(data);
            
            if (parsed.favorites) {
                this.state.favorites = parsed.favorites.map(fav => new Movie(fav));
                this.storage.saveFavorites(this.state.favorites);
            }
            
            if (parsed.watchlist) {
                this.state.watchlist = parsed.watchlist.map(item => new Movie(item));
                this.storage.saveWatchlist(this.state.watchlist);
            }
            
            if (parsed.lastSearch) {
                this.state.searchQuery = parsed.lastSearch;
                this.storage.saveLastSearch(parsed.lastSearch);
            }
            
            if (parsed.viewMode) {
                this.state.viewMode = parsed.viewMode;
                this.storage.saveViewMode(parsed.viewMode);
            }
            
            this.updateStats();
            this.notify();
            
            return true;
        } catch (error) {
            console.error('State import hatası:', error);
            return false;
        }
    }
    
    // Hata ayarla
    setError(error) {
        this.setState({
            isLoading: false,
            error: error instanceof Error ? error.message : String(error)
        });
        
        Helpers.showNotification(
            error instanceof Error ? error.message : String(error),
            'error'
        );
    }
    
    // Yükleniyor durumu
    setLoading(isLoading) {
        this.setState({ isLoading });
    }
    
    // Görünüm modu değiştir
    setViewMode(mode) {
        if (['grid', 'list'].includes(mode)) {
            this.setState({ viewMode: mode });
            this.storage.saveViewMode(mode);
        }
    }
    
    // Filtre ayarla
    setFilter(type, value) {
        const updates = {};
        
        switch (type) {
            case 'genre':
                updates.currentGenre = value;
                break;
            case 'sort':
                updates.currentSort = value;
                break;
            case 'year':
                updates.currentYear = value;
                break;
        }
        
        this.setState(updates);
        this.filterMovies();
    }
    
    // Filtreleri temizle
    clearFilters() {
        this.setState({
            currentGenre: '',
            currentYear: '',
            currentSort: 'popularity.desc'
        });
        
        this.filterMovies();
    }
    
    // Getter'lar
    get movies() { return this.state.filteredMovies; }
    get selectedMovie() { return this.state.selectedMovie; }
    get movieDetails() { return this.state.movieDetails; }
    get favorites() { return this.state.favorites; }
    get watchlist() { return this.state.watchlist; }
    get searchQuery() { return this.state.searchQuery; }
    get currentPage() { return this.state.currentPage; }
    get totalPages() { return this.state.totalPages; }
    get totalResults() { return this.state.totalResults; }
    get viewMode() { return this.state.viewMode; }
    get isLoading() { return this.state.isLoading; }
    get error() { return this.state.error; }
    get stats() { return this.state.stats; }
    get currentGenre() { return this.state.currentGenre; }
    get currentSort() { return this.state.currentSort; }
    get currentYear() { return this.state.currentYear; }
}

// Global erişim için
window.MovieStore = MovieStore;