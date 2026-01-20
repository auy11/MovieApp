// Film Model Sınıfı
class Movie {
    constructor(data) {
        // Temel bilgiler
        this.id = data.id || null;
        this.title = data.title || data.name || 'İsimsiz';
        this.originalTitle = data.original_title || data.original_name || this.title;
        this.overview = data.overview || 'Açıklama bulunamadı.';
        this.tagline = data.tagline || '';
        
        // Görsel yolları
        this.posterPath = data.poster_path;
        this.backdropPath = data.backdrop_path;
        
        // Tarih bilgileri
        this.releaseDate = data.release_date || data.first_air_date || null;
        this.releaseYear = this.extractYear(this.releaseDate);
        
        // Puanlama ve popülerlik
        this.voteAverage = data.vote_average || 0;
        this.voteCount = data.vote_count || 0;
        this.popularity = data.popularity || 0;
        
        // Süre ve türler
        this.runtime = data.runtime || null;
        this.genres = data.genres || [];
        this.genreIds = data.genre_ids || this.genres.map(g => g.id);
        
        // Ek bilgiler
        this.status = data.status || 'Unknown';
        this.budget = data.budget || 0;
        this.revenue = data.revenue || 0;
        this.homepage = data.homepage || null;
        this.imdbId = data.imdb_id || null;
        
        // Tip (film/dizi)
        this.mediaType = data.media_type || 'movie';
        this.isMovie = this.mediaType === 'movie';
        this.isTV = this.mediaType === 'tv';
        
        // Detaylı bilgiler (append_to_response ile gelen)
        this.credits = data.credits || null;
        this.cast = data.cast || [];
        this.crew = data.crew || [];
        this.videos = data.videos ? data.videos.results || [] : [];
        this.similar = data.similar ? data.similar.results || [] : [];
        this.recommendations = data.recommendations ? data.recommendations.results || [] : [];
        
        // Ek alanlar
        this.createdAt = Date.now();
        this.lastViewed = null;
        this.viewCount = 0;
    }
    
    // Yıl çıkar
    extractYear(dateString) {
        if (!dateString) return null;
        const year = parseInt(dateString.split('-')[0]);
        return isNaN(year) ? null : year;
    }
    
    // Poster URL'si
    getPosterUrl(size = 'medium') {
        if (!this.posterPath) {
            return 'images/no-poster.jpg';
        }
        
        const sizes = Constants.IMAGE_SIZES.POSTER;
        const sizeKey = size.toUpperCase();
        const imageSize = sizes[sizeKey] || sizes.MEDIUM;
        
        return `${Constants.IMAGE_BASE_URL}/${imageSize}${this.posterPath}`;
    }
    
    // Backdrop URL'si
    getBackdropUrl(size = 'large') {
        if (!this.backdropPath) {
            return 'images/no-backdrop.jpg';
        }
        
        const sizes = Constants.IMAGE_SIZES.BACKDROP;
        const sizeKey = size.toUpperCase();
        const imageSize = sizes[sizeKey] || sizes.LARGE;
        
        return `${Constants.IMAGE_BASE_URL}/${imageSize}${this.backdropPath}`;
    }
    
    // Yıldız puanı (0-5)
    getStarRating() {
        return (this.voteAverage / 2).toFixed(1);
    }
    
    // Yıldız HTML'i
    getStarsHTML() {
        return Helpers.generateStars(this.voteAverage, 10);
    }
    
    // Formatlı tarih
    getFormattedDate(format = 'long') {
        return Helpers.formatDate(this.releaseDate, format);
    }
    
    // Formatlı süre
    getFormattedRuntime() {
        return Helpers.formatRuntime(this.runtime);
    }
    
    // Formatlı bütçe
    getFormattedBudget() {
        if (!this.budget) return 'Bilinmiyor';
        return Helpers.formatCurrency(this.budget, 'USD');
    }
    
    // Formatlı gelir
    getFormattedRevenue() {
        if (!this.revenue) return 'Bilinmiyor';
        return Helpers.formatCurrency(this.revenue, 'USD');
    }
    
    // Tür isimleri
    getGenreNames() {
        return this.genres.map(genre => genre.name).join(', ');
    }
    
    // Kısa açıklama
    getShortOverview(maxLength = 150) {
        return Helpers.truncateText(this.overview, maxLength);
    }
    
    // IMDB URL'si
    getImdbUrl() {
        if (!this.imdbId) return null;
        return `https://www.imdb.com/title/${this.imdbId}`;
    }
    
    // YouTube trailer'ı
    getTrailer() {
        if (!this.videos || this.videos.length === 0) return null;
        
        // Önce resmi trailer'ları bul
        const trailers = this.videos.filter(video => 
            video.type === 'Trailer' && video.site === 'YouTube' && video.official
        );
        
        if (trailers.length > 0) {
            return trailers[0];
        }
        
        // Sonra herhangi bir trailer
        const anyTrailer = this.videos.find(video => 
            video.type === 'Trailer' && video.site === 'YouTube'
        );
        
        if (anyTrailer) {
            return anyTrailer;
        }
        
        // Sonra teaser
        const teaser = this.videos.find(video => 
            video.type === 'Teaser' && video.site === 'YouTube'
        );
        
        return teaser || this.videos[0] || null;
    }
    
    // YouTube embed URL'si
    getTrailerEmbedUrl() {
        const trailer = this.getTrailer();
        if (!trailer) return null;
        return `https://www.youtube.com/embed/${trailer.key}`;
    }
    
    // YouTube thumbnail URL'si
    getTrailerThumbnailUrl() {
        const trailer = this.getTrailer();
        if (!trailer) return null;
        return `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
    }
    
    // Yönetmen bilgisi
    getDirectors() {
        if (!this.crew) return [];
        return this.crew.filter(person => 
            person.job === 'Director' || person.department === 'Directing'
        );
    }
    
    // Yazarlar
    getWriters() {
        if (!this.crew) return [];
        return this.crew.filter(person => 
            person.job === 'Writer' || person.department === 'Writing'
        );
    }
    
    // Başroldeki oyuncular (ilk 5)
    getMainCast(limit = 5) {
        if (!this.cast) return [];
        return this.cast.slice(0, limit);
    }
    
    // Benzer filmler (ilk 6)
    getSimilarMovies(limit = 6) {
        if (!this.similar) return [];
        return this.similar.slice(0, limit);
    }
    
    // Önerilen filmler (ilk 6)
    getRecommendations(limit = 6) {
        if (!this.recommendations) return [];
        return this.recommendations.slice(0, limit);
    }
    
    // Durum rengi
    getStatusColor() {
        const statusColors = {
            'Released': '#4CAF50',
            'In Production': '#FF9800',
            'Post Production': '#9C27B0',
            'Planned': '#2196F3',
            'Canceled': '#F44336',
            'Rumored': '#607D8B',
            'Unknown': '#9E9E9E'
        };
        return statusColors[this.status] || '#9E9E9E';
    }
    
    // Kısa bilgi kartı için veri
    toCardData() {
        return {
            id: this.id,
            title: this.title,
            year: this.releaseYear,
            rating: this.voteAverage,
            poster: this.getPosterUrl('medium'),
            backdrop: this.getBackdropUrl('small'),
            overview: this.getShortOverview(100),
            genres: this.genreIds,
            type: this.mediaType
        };
    }
    
    // Detay sayfası için veri
    toDetailData() {
        return {
            id: this.id,
            title: this.title,
            originalTitle: this.originalTitle,
            overview: this.overview,
            tagline: this.tagline,
            poster: this.getPosterUrl('large'),
            backdrop: this.getBackdropUrl('original'),
            releaseDate: this.getFormattedDate('long'),
            year: this.releaseYear,
            runtime: this.getFormattedRuntime(),
            rating: this.voteAverage,
            voteCount: this.voteCount,
            stars: this.getStarsHTML(),
            genres: this.genres,
            budget: this.getFormattedBudget(),
            revenue: this.getFormattedRevenue(),
            status: this.status,
            statusColor: this.getStatusColor(),
            homepage: this.homepage,
            imdbUrl: this.getImdbUrl(),
            trailer: this.getTrailer(),
            trailerEmbedUrl: this.getTrailerEmbedUrl(),
            directors: this.getDirectors(),
            writers: this.getWriters(),
            cast: this.getMainCast(10),
            similar: this.getSimilarMovies(6),
            recommendations: this.getRecommendations(6)
        };
    }
    
    // JSON'a çevir (depolama için)
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            originalTitle: this.originalTitle,
            posterPath: this.posterPath,
            backdropPath: this.backdropPath,
            releaseDate: this.releaseDate,
            voteAverage: this.voteAverage,
            overview: this.overview,
            mediaType: this.mediaType,
            genres: this.genres,
            createdAt: this.createdAt,
            lastViewed: this.lastViewed,
            viewCount: this.viewCount
        };
    }
    
    // Görüntülenme sayacını artır
    incrementViewCount() {
        this.viewCount++;
        this.lastViewed = Date.now();
    }
    
    // Görüntülenme bilgisi
    getViewInfo() {
        if (this.viewCount === 0) return 'Henüz görüntülenmedi';
        
        const lastViewed = new Date(this.lastViewed);
        const now = new Date();
        const diffDays = Math.floor((now - lastViewed) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return `Bugün görüntülendi (${this.viewCount} kez)`;
        if (diffDays === 1) return `Dün görüntülendi (${this.viewCount} kez)`;
        if (diffDays < 7) return `${diffDays} gün önce görüntülendi (${this.viewCount} kez)`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce görüntülendi (${this.viewCount} kez)`;
        return `${Math.floor(diffDays / 30)} ay önce görüntülendi (${this.viewCount} kez)`;
    }
}

// Global erişim için
window.Movie = Movie;