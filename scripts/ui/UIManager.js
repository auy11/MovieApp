// UI Yöneticisi
class UIManager {
    constructor(movieStore, searchManager) {
        this.movieStore = movieStore;
        this.searchManager = searchManager;
        
        // DOM elementleri
        this.elements = {};
        
        // UI durumu
        this.uiState = {
            currentModal: null,
            isScrolled: false,
            scrollPosition: 0,
            activeView: 'grid',
            animationsEnabled: true
        };
        
        // Başlangıç
        this.initialize();
    }
    
    // Başlangıç
    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.setupTheme();
        this.setupAnimations();
    }
    
    // DOM elementlerini cache'le
    cacheElements() {
        this.elements = {
            // Header
            header: document.querySelector('.header'),
            logo: document.querySelector('.logo'),
            searchInput: document.querySelector('#searchInput'),
            searchButton: document.querySelector('#searchButton'),
            clearSearch: document.querySelector('#clearSearch'),
            themeToggle: document.querySelector('#themeToggle'),
            favoritesBtn: document.querySelector('#favoritesBtn'),
            watchlistBtn: document.querySelector('#watchlistBtn'),
            favoritesCount: document.querySelector('#favoritesCount'),
            watchlistCount: document.querySelector('#watchlistCount'),
            
            // Filters
            genreFilter: document.querySelector('#genreFilter'),
            sortFilter: document.querySelector('#sortFilter'),
            yearFilter: document.querySelector('#yearFilter'),
            clearFilters: document.querySelector('#clearFilters'),
            gridView: document.querySelector('#gridView'),
            listView: document.querySelector('#listView'),
            
            // Main content
            moviesGrid: document.querySelector('#moviesGrid'),
            pagination: document.querySelector('#pagination'),
            
            // Modals
            movieModal: document.querySelector('#movieModal'),
            favoritesModal: document.querySelector('#favoritesModal'),
            watchlistModal: document.querySelector('#watchlistModal'),
            aboutModal: document.querySelector('#aboutModal'),
            
            // Modal buttons
            closeModal: document.querySelector('#closeModal'),
            closeFavoritesModal: document.querySelector('#closeFavoritesModal'),
            closeWatchlistModal: document.querySelector('#closeWatchlistModal'),
            closeAboutModal: document.querySelector('#closeAboutModal'),
            
            // Modal content
            modalBody: document.querySelector('#modalBody'),
            modalTitle: document.querySelector('#modalTitle'),
            favoritesList: document.querySelector('#favoritesList'),
            watchlistContent: document.querySelector('#watchlistContent'),
            
            // Footer
            aboutBtn: document.querySelector('#aboutBtn'),
            totalMovies: document.querySelector('#totalMovies'),
            totalFavorites: document.querySelector('#totalFavorites'),
            totalWatchlist: document.querySelector('#totalWatchlist'),
            
            // Loading
            loadingOverlay: document.querySelector('#loadingOverlay')
        };
    }
    
    // Event binding
    bindEvents() {
        // Arama
        this.elements.searchButton.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        this.elements.clearSearch.addEventListener('click', () => this.clearSearch());
        
        // Tema değiştirme
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listeler
        this.elements.favoritesBtn.addEventListener('click', () => this.showFavoritesModal());
        this.elements.watchlistBtn.addEventListener('click', () => this.showWatchlistModal());
        
        // Filtreler
        this.elements.genreFilter.addEventListener('change', (e) => {
            this.movieStore.setFilter('genre', e.target.value);
            this.searchManager.applyFilters({
                genre: e.target.value,
                sort: this.elements.sortFilter.value,
                year: this.elements.yearFilter.value
            });
        });
        
        this.elements.sortFilter.addEventListener('change', (e) => {
            this.movieStore.setFilter('sort', e.target.value);
            this.searchManager.applyFilters({
                genre: this.elements.genreFilter.value,
                sort: e.target.value,
                year: this.elements.yearFilter.value
            });
        });
        
        this.elements.yearFilter.addEventListener('change', (e) => {
            this.movieStore.setFilter('year', e.target.value);
            this.searchManager.applyFilters({
                genre: this.elements.genreFilter.value,
                sort: this.elements.sortFilter.value,
                year: e.target.value
            });
        });
        
        this.elements.clearFilters.addEventListener('click', () => this.clearFilters());
        
        // Görünüm değiştirme
        this.elements.gridView.addEventListener('click', () => this.setViewMode('grid'));
        this.elements.listView.addEventListener('click', () => this.setViewMode('list'));
        
        // Modal kapatma
        this.elements.closeModal?.addEventListener('click', () => this.closeModal());
        this.elements.closeFavoritesModal?.addEventListener('click', () => this.closeFavoritesModal());
        this.elements.closeWatchlistModal?.addEventListener('click', () => this.closeWatchlistModal());
        this.elements.closeAboutModal?.addEventListener('click', () => this.closeAboutModal());
        
        // Modal dışına tıklama
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.movieModal) this.closeModal();
            if (e.target === this.elements.favoritesModal) this.closeFavoritesModal();
            if (e.target === this.elements.watchlistModal) this.closeWatchlistModal();
            if (e.target === this.elements.aboutModal) this.closeAboutModal();
        });
        
        // ESC tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // About butonu
        this.elements.aboutBtn?.addEventListener('click', () => this.showAboutModal());
        
        // Logo tıklama
        this.elements.logo?.addEventListener('click', () => this.goHome());
        
        // Scroll event
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    // Temayı ayarla
    setupTheme() {
        const savedTheme = this.movieStore.storage.getTheme();
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        
        // Tema butonu ikonunu güncelle
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Animasyonları ayarla
    setupAnimations() {
        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        this.observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });
        }
    }
    
    // Arama işlemi
    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        if (query) {
            this.searchManager.searchMovies(query, 1);
            this.elements.clearSearch.style.display = 'block';
        }
    }
    
    // Arama input değişikliği
    handleSearchInput(value) {
        if (value.trim().length > 0) {
            this.elements.clearSearch.style.display = 'block';
        } else {
            this.elements.clearSearch.style.display = 'none';
            this.clearSearch();
        }
    }
    
    // Arama temizleme
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.clearSearch.style.display = 'none';
        this.searchManager.getPopularMovies(1);
        this.movieStore.setState({ searchQuery: '' });
    }
    
    // Tema değiştirme
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        
        document.body.classList.toggle('dark-theme', !isDark);
        this.movieStore.storage.saveTheme(newTheme);
        
        // İkonu güncelle
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Bildirim göster
        Helpers.showNotification(
            `${newTheme === 'dark' ? 'Karanlık' : 'Aydınlık'} tema etkin`,
            'info',
            2000
        );
    }
    
    // Görünüm modu değiştirme
    setViewMode(mode) {
        if (mode === this.uiState.activeView) return;
        
        this.uiState.activeView = mode;
        this.movieStore.setViewMode(mode);
        
        // Görünüm butonlarını güncelle
        this.elements.gridView.classList.toggle('active', mode === 'grid');
        this.elements.listView.classList.toggle('active', mode === 'list');
        
        // Film grid class'ını güncelle
        this.elements.moviesGrid.classList.toggle('grid-view', mode === 'grid');
        this.elements.moviesGrid.classList.toggle('list-view', mode === 'list');
        
        // Film kartlarını yeniden render et
        this.renderMovies();
    }
    
    // Filmleri render et
    renderMovies() {
        if (!this.elements.moviesGrid) return;
        
        const movies = this.movieStore.movies;
        const viewMode = this.movieStore.viewMode;
        const isLoading = this.movieStore.isLoading;
        
        if (isLoading) {
            this.showLoading();
            return;
        }
        
        if (movies.length === 0) {
            this.showNoResults();
            return;
        }
        
        // Film kartlarını oluştur
        const moviesHTML = movies.map(movie => this.createMovieCard(movie, viewMode)).join('');
        this.elements.moviesGrid.innerHTML = moviesHTML;
        
        // Lazy loading için observer ekle
        this.setupLazyLoading();
        
        // Event listener'ları ekle
        this.addMovieCardListeners();
    }
    
    // Film kartı oluştur
    createMovieCard(movie, viewMode = 'grid') {
        const isFavorite = this.movieStore.isFavorite(movie.id);
        const isInWatchlist = this.movieStore.isInWatchlist(movie.id);
        
        if (viewMode === 'list') {
            return `
                <div class="movie-card" data-id="${movie.id}">
                    <div class="movie-poster">
                        <img 
                            src="images/no-poster.jpg" 
                            data-src="${movie.getPosterUrl('medium')}" 
                            alt="${movie.title}" 
                            loading="lazy"
                            class="lazy-image"
                        >
                        <div class="movie-rating">
                            <span>${movie.getStarRating()}</span>
                            <i class="fas fa-star"></i>
                        </div>
                        <button class="favorite-btn" data-id="${movie.id}" title="${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.title}</h3>
                        <div class="movie-meta">
                            <span class="movie-year">${movie.releaseYear || 'Tarih Yok'}</span>
                            <div class="movie-genres">
                                ${movie.genreIds.slice(0, 2).map(genreId => {
                                    const genre = window.Constants.GENRES?.find(g => g.id === genreId);
                                    return genre ? `<span class="genre-tag">${genre.name}</span>` : '';
                                }).join('')}
                            </div>
                        </div>
                        <p class="movie-overview">${movie.getShortOverview(200)}</p>
                        <div class="movie-actions">
                            <button class="details-btn" data-id="${movie.id}">
                                Detayları Gör
                            </button>
                            <button class="watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}" data-id="${movie.id}" title="${isInWatchlist ? 'İzleneceklerden Çıkar' : 'İzleneceklere Ekle'}">
                                <i class="fas fa-bookmark"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Grid view (default)
        return `
            <div class="movie-card" data-id="${movie.id}">
                <div class="movie-poster">
                    <img 
                        src="images/no-poster.jpg" 
                        data-src="${movie.getPosterUrl('medium')}" 
                        alt="${movie.title}" 
                        loading="lazy"
                        class="lazy-image"
                    >
                    <div class="movie-rating">
                        <span>${movie.getStarRating()}</span>
                        <i class="fas fa-star"></i>
                    </div>
                    <button class="favorite-btn" data-id="${movie.id}" title="${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.releaseYear || 'Tarih Yok'}</span>
                        <div class="movie-genres">
                            ${movie.genreIds.slice(0, 2).map(genreId => {
                                const genre = window.Constants.GENRES?.find(g => g.id === genreId);
                                return genre ? `<span class="genre-tag">${genre.name}</span>` : '';
                            }).join('')}
                        </div>
                    </div>
                    <p class="movie-overview">${movie.getShortOverview(100)}</p>
                    <div class="movie-actions">
                        <button class="details-btn" data-id="${movie.id}">
                            Detayları Gör
                        </button>
                        <button class="watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}" data-id="${movie.id}" title="${isInWatchlist ? 'İzleneceklerden Çıkar' : 'İzleneceklere Ekle'}">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Sayfalama render et
    renderPagination() {
        if (!this.elements.pagination) return;
        
        const currentPage = this.movieStore.currentPage;
        const totalPages = this.movieStore.totalPages;
        
        if (totalPages <= 1) {
            this.elements.pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = `
            <div class="pagination">
                <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                        data-page="${currentPage - 1}" 
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Önceki
                </button>
                <div class="page-numbers">
        `;
        
        // Sayfa numaraları
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-number ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        paginationHTML += `
                </div>
                <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                        data-page="${currentPage + 1}" 
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    Sonraki <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        this.elements.pagination.innerHTML = paginationHTML;
        
        // Event listener'ları ekle
        this.addPaginationListeners();
    }
    
    // Film detay modalını göster
    async showMovieDetails(movieId) {
        try {
            this.showLoadingModal();
            
            const movie = await this.searchManager.getMovieDetails(movieId);
            
            if (!movie) {
                throw new Error('Film bulunamadı.');
            }
            
            const details = movie.toDetailData();
            
            // Modal içeriğini oluştur
            this.elements.modalTitle.textContent = movie.title;
            this.elements.modalBody.innerHTML = this.createMovieDetailsHTML(details);
            
            // Modalı göster
            this.openModal(this.elements.movieModal);
            
            // Modal içi event listener'ları ekle
            this.addModalListeners();
            
        } catch (error) {
            console.error('Film detayları yüklenemedi:', error);
            Helpers.showNotification('Film detayları yüklenemedi', 'error');
        } finally {
            this.hideLoadingModal();
        }
    }
    
    // Film detay HTML'i oluştur
    createMovieDetailsHTML(details) {
        const trailerHTML = details.trailerEmbedUrl ? `
            <div class="trailer-section">
                <h3><i class="fas fa-play-circle"></i> Fragman</h3>
                <div class="trailer-container">
                    <iframe 
                        src="${details.trailerEmbedUrl}" 
                        frameborder="0" 
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                </div>
            </div>
        ` : '';
        
        const castHTML = details.cast && details.cast.length > 0 ? `
            <div class="cast-section">
                <h3><i class="fas fa-users"></i> Oyuncular</h3>
                <div class="cast-grid">
                    ${details.cast.slice(0, 8).map(actor => `
                        <div class="cast-member" data-id="${actor.id}">
                            <img src="${actor.getProfileUrl('medium')}" alt="${actor.name}" loading="lazy">
                            <h4>${actor.name}</h4>
                            <p>${actor.character}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        const similarHTML = details.similar && details.similar.length > 0 ? `
            <div class="similar-section">
                <h3><i class="fas fa-film"></i> Benzer Filmler</h3>
                <div class="similar-grid">
                    ${details.similar.slice(0, 6).map(similarMovie => `
                        <div class="similar-movie" data-id="${similarMovie.id}">
                            <img src="${similarMovie.getPosterUrl('small')}" alt="${similarMovie.title}" loading="lazy">
                            <h4>${similarMovie.title}</h4>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        return `
            <div class="movie-details">
                <div class="movie-details-header">
                    <div class="movie-details-poster">
                        <img src="${details.poster}" alt="${details.title}" loading="lazy">
                    </div>
                    <div class="movie-details-info">
                        <div class="movie-details-title">
                            <h1>${details.title}</h1>
                            <span class="movie-year-large">(${details.year})</span>
                        </div>
                        
                        ${details.tagline ? `<p class="movie-tagline">${details.tagline}</p>` : ''}
                        
                        <div class="movie-rating-large">
                            <div class="stars">
                                ${details.stars}
                            </div>
                            <span class="rating-text">
                                ${details.rating.toFixed(1)}/10 (${details.voteCount} oy)
                            </span>
                        </div>
                        
                        <div class="movie-meta-details">
                            ${details.runtime ? `<span><i class="fas fa-clock"></i> ${details.runtime}</span>` : ''}
                            ${details.releaseDate ? `<span><i class="fas fa-calendar"></i> ${details.releaseDate}</span>` : ''}
                            ${details.status ? `<span style="color: ${details.statusColor}"><i class="fas fa-circle"></i> ${details.status}</span>` : ''}
                        </div>
                        
                        <div class="genres-container">
                            ${details.genres.map(genre => `
                                <span class="genre-tag-large">${genre.name}</span>
                            `).join('')}
                        </div>
                        
                        <div class="movie-actions">
                            <button class="btn-favorite" data-id="${details.id}">
                                <i class="${this.movieStore.isFavorite(details.id) ? 'fas' : 'far'} fa-heart"></i>
                                ${this.movieStore.isFavorite(details.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                            </button>
                            <button class="btn-watchlist" data-id="${details.id}">
                                <i class="fas fa-bookmark"></i>
                                ${this.movieStore.isInWatchlist(details.id) ? 'İzleneceklerden Çıkar' : 'İzleneceklere Ekle'}
                            </button>
                            ${details.imdbUrl ? `
                                <a href="${details.imdbUrl}" target="_blank" class="btn-imdb">
                                    <i class="fab fa-imdb"></i> IMDB
                                </a>
                            ` : ''}
                            ${details.homepage ? `
                                <a href="${details.homepage}" target="_blank" class="btn-website">
                                    <i class="fas fa-external-link-alt"></i> Website
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="movie-overview-section">
                    <h3><i class="fas fa-align-left"></i> Konu</h3>
                    <p>${details.overview}</p>
                </div>
                
                ${trailerHTML}
                ${castHTML}
                ${similarHTML}
            </div>
        `;
    }
    
    // Favoriler modalını göster
    showFavoritesModal() {
        const favorites = this.movieStore.favorites;
        
        if (favorites.length === 0) {
            this.elements.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart-broken"></i>
                    <h3>Favori filminiz yok</h3>
                    <p>Filmleri favorilere eklemek için kalp ikonuna tıklayın.</p>
                </div>
            `;
        } else {
            const favoritesHTML = favorites.map(movie => `
                <div class="favorite-item" data-id="${movie.id}">
                    <div class="favorite-poster">
                        <img src="${movie.getPosterUrl('medium')}" alt="${movie.title}">
                    </div>
                    <div class="favorite-info">
                        <h4 class="favorite-title">${movie.title}</h4>
                        <div class="favorite-actions">
                            <button class="details-btn" data-id="${movie.id}">
                                Detaylar
                            </button>
                            <button class="favorite-remove-btn" data-id="${movie.id}">
                                Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            this.elements.favoritesList.innerHTML = `
                <div class="favorites-grid">
                    ${favoritesHTML}
                </div>
            `;
        }
        
        this.openModal(this.elements.favoritesModal);
        this.addFavoritesModalListeners();
    }
    
    // İzlenecekler modalını göster
    showWatchlistModal() {
        const watchlist = this.movieStore.watchlist;
        
        if (watchlist.length === 0) {
            this.elements.watchlistContent.innerHTML = `
                <div class="empty-watchlist">
                    <i class="fas fa-bookmark"></i>
                    <h3>İzlenecekler listeniz boş</h3>
                    <p>Filmleri izleneceklere eklemek için kitap ayracı ikonuna tıklayın.</p>
                </div>
            `;
        } else {
            const watchlistHTML = watchlist.map(movie => `
                <div class="watchlist-item" data-id="${movie.id}">
                    <div class="watchlist-poster">
                        <img src="${movie.getPosterUrl('medium')}" alt="${movie.title}">
                    </div>
                    <div class="watchlist-info">
                        <h4 class="watchlist-title">${movie.title}</h4>
                        <span class="watchlist-year">${movie.releaseYear || 'Tarih Yok'}</span>
                        <div class="watchlist-actions">
                            <button class="details-btn" data-id="${movie.id}">
                                Detaylar
                            </button>
                            <button class="watchlist-remove-btn" data-id="${movie.id}">
                                Kaldır
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            this.elements.watchlistContent.innerHTML = `
                <div class="watchlist-grid">
                    ${watchlistHTML}
                </div>
            `;
        }
        
        this.openModal(this.elements.watchlistModal);
        this.addWatchlistModalListeners();
    }
    
    // Hakkında modalını göster
    showAboutModal() {
        this.openModal(this.elements.aboutModal);
    }
    
    // Modal aç
    openModal(modal) {
        if (this.uiState.currentModal) {
            this.closeModal();
        }
        
        this.uiState.currentModal = modal;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Scroll pozisyonunu kaydet
        this.uiState.scrollPosition = window.pageYOffset;
    }
    
    // Modal kapat
    closeModal() {
        if (!this.uiState.currentModal) return;
        
        this.uiState.currentModal.classList.remove('active');
        this.uiState.currentModal = null;
        document.body.style.overflow = '';
        
        // Scroll pozisyonunu geri yükle
        window.scrollTo(0, this.uiState.scrollPosition);
    }
    
    // Tüm modal'ları kapat
    closeAllModals() {
        this.closeModal();
        this.closeFavoritesModal();
        this.closeWatchlistModal();
        this.closeAboutModal();
    }
    
    // Favoriler modalını kapat
    closeFavoritesModal() {
        this.elements.favoritesModal.classList.remove('active');
        this.uiState.currentModal = null;
        document.body.style.overflow = '';
    }
    
    // İzlenecekler modalını kapat
    closeWatchlistModal() {
        this.elements.watchlistModal.classList.remove('active');
        this.uiState.currentModal = null;
        document.body.style.overflow = '';
    }
    
    // Hakkında modalını kapat
    closeAboutModal() {
        this.elements.aboutModal.classList.remove('active');
        this.uiState.currentModal = null;
        document.body.style.overflow = '';
    }
    
    // Filtreleri temizle
    clearFilters() {
        this.elements.genreFilter.value = '';
        this.elements.sortFilter.value = 'popularity.desc';
        this.elements.yearFilter.value = '';
        
        this.movieStore.clearFilters();
        this.searchManager.getPopularMovies(1);
    }
    
    // Ana sayfaya git
    goHome() {
        this.clearSearch();
        this.clearFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Loading göster
    showLoading() {
        this.elements.moviesGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Filmler yükleniyor...</p>
                </div>
            </div>
        `;
    }
    
    // Loading modal göster
    showLoadingModal() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('active');
        }
    }
    
    // Loading modal gizle
    hideLoadingModal() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }
    
    // Sonuç yok göster
    showNoResults() {
        this.elements.moviesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-film"></i>
                <h3>Film bulunamadı</h3>
                <p>Arama kriterlerinize uygun film bulunamadı.</p>
                <button class="clear-filters-btn" id="clearSearchResults">
                    <i class="fas fa-times"></i> Aramayı Temizle
                </button>
            </div>
        `;
        
        // Temizle butonu listener'ı
        const clearBtn = document.querySelector('#clearSearchResults');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSearch());
        }
    }
    
    // Event listener'ları ekle
    addMovieCardListeners() {
        // Detay butonları
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.showMovieDetails(movieId);
            });
        });
        
        // Favori butonları
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.toggleFavorite(movieId, btn);
            });
        });
        
        // İzlenecekler butonları
        document.querySelectorAll('.watchlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.toggleWatchlist(movieId, btn);
            });
        });
        
        // Film kartı tıklama
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const movieId = parseInt(card.dataset.id);
                    this.showMovieDetails(movieId);
                }
            });
        });
    }
    
    // Sayfalama listener'ları
    addPaginationListeners() {
        document.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                this.searchManager.changePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
        
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                this.searchManager.changePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }
    
    // Modal listener'ları
    addModalListeners() {
        // Modal içindeki favori butonu
        const favoriteBtn = this.elements.modalBody.querySelector('.btn-favorite');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => {
                const movieId = parseInt(favoriteBtn.dataset.id);
                this.toggleFavorite(movieId, favoriteBtn);
            });
        }
        
        // Modal içindeki izlenecekler butonu
        const watchlistBtn = this.elements.modalBody.querySelector('.btn-watchlist');
        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', () => {
                const movieId = parseInt(watchlistBtn.dataset.id);
                this.toggleWatchlist(movieId, watchlistBtn);
            });
        }
        
        // Benzer filmler
        this.elements.modalBody.querySelectorAll('.similar-movie').forEach(item => {
            item.addEventListener('click', () => {
                const movieId = parseInt(item.dataset.id);
                this.closeModal();
                setTimeout(() => {
                    this.showMovieDetails(movieId);
                }, 300);
            });
        });
        
        // Oyuncular
        this.elements.modalBody.querySelectorAll('.cast-member').forEach(item => {
            item.addEventListener('click', () => {
                const actorId = parseInt(item.dataset.id);
                this.showActorDetails(actorId);
            });
        });
    }
    
    // Favoriler modal listener'ları
    addFavoritesModalListeners() {
        // Detay butonları
        this.elements.favoritesList.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.closeFavoritesModal();
                setTimeout(() => {
                    this.showMovieDetails(movieId);
                }, 300);
            });
        });
        
        // Kaldır butonları
        this.elements.favoritesList.querySelectorAll('.favorite-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.movieStore.removeFavorite(movieId);
                this.updateFavoritesCount();
                this.showFavoritesModal(); // Modal'ı yenile
            });
        });
        
        // Film item tıklama
        this.elements.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const movieId = parseInt(item.dataset.id);
                    this.closeFavoritesModal();
                    setTimeout(() => {
                        this.showMovieDetails(movieId);
                    }, 300);
                }
            });
        });
    }
    
    // İzlenecekler modal listener'ları
    addWatchlistModalListeners() {
        // Detay butonları
        this.elements.watchlistContent.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.closeWatchlistModal();
                setTimeout(() => {
                    this.showMovieDetails(movieId);
                }, 300);
            });
        });
        
        // Kaldır butonları
        this.elements.watchlistContent.querySelectorAll('.watchlist-remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.id);
                this.movieStore.removeFromWatchlist(movieId);
                this.updateWatchlistCount();
                this.showWatchlistModal(); // Modal'ı yenile
            });
        });
        
        // Film item tıklama
        this.elements.watchlistContent.querySelectorAll('.watchlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const movieId = parseInt(item.dataset.id);
                    this.closeWatchlistModal();
                    setTimeout(() => {
                        this.showMovieDetails(movieId);
                    }, 300);
                }
            });
        });
    }
    
    // Favori durumunu değiştir
    toggleFavorite(movieId, button) {
        const movie = this.movieStore.getMovieFromCache(movieId);
        
        if (this.movieStore.isFavorite(movieId)) {
            this.movieStore.removeFavorite(movieId);
            if (button) {
                const icon = button.querySelector('i');
                if (icon) icon.className = 'far fa-heart';
                
                // Buton metnini güncelle
                if (button.classList.contains('btn-favorite')) {
                    button.innerHTML = '<i class="far fa-heart"></i> Favorilere Ekle';
                }
            }
        } else {
            if (movie) {
                this.movieStore.addFavorite(movie);
                if (button) {
                    const icon = button.querySelector('i');
                    if (icon) icon.className = 'fas fa-heart';
                    
                    // Buton metnini güncelle
                    if (button.classList.contains('btn-favorite')) {
                        button.innerHTML = '<i class="fas fa-heart"></i> Favorilerden Çıkar';
                    }
                }
            }
        }
        
        this.updateFavoritesCount();
    }
    
    // İzlenecekler durumunu değiştir
    toggleWatchlist(movieId, button) {
        const movie = this.movieStore.getMovieFromCache(movieId);
        
        if (this.movieStore.isInWatchlist(movieId)) {
            this.movieStore.removeFromWatchlist(movieId);
            if (button) {
                button.classList.remove('in-watchlist');
                
                // Buton metnini güncelle
                if (button.classList.contains('btn-watchlist')) {
                    button.innerHTML = '<i class="fas fa-bookmark"></i> İzleneceklere Ekle';
                }
            }
        } else {
            if (movie) {
                this.movieStore.addToWatchlist(movie);
                if (button) {
                    button.classList.add('in-watchlist');
                    
                    // Buton metnini güncelle
                    if (button.classList.contains('btn-watchlist')) {
                        button.innerHTML = '<i class="fas fa-bookmark"></i> İzleneceklerden Çıkar';
                    }
                }
            }
        }
        
        this.updateWatchlistCount();
    }
    
    // Oyuncu detaylarını göster
    async showActorDetails(actorId) {
        try {
            this.showLoadingModal();
            
            const data = await this.searchManager.tmdbService.getPersonDetails(actorId);
            const actor = new CastMember(data);
            
            // Oyuncu modalı oluştur
            const modalHTML = this.createActorModalHTML(actor);
            
            // Geçici modal oluştur
            const tempModal = document.createElement('div');
            tempModal.className = 'modal actor-modal';
            tempModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-user"></i> Oyuncu Detayları</h2>
                        <button class="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${modalHTML}
                    </div>
                </div>
            `;
            
            document.body.appendChild(tempModal);
            
            // Modal'ı göster
            setTimeout(() => {
                tempModal.classList.add('active');
                
                // Kapatma butonu
                tempModal.querySelector('.close-modal').addEventListener('click', () => {
                    tempModal.classList.remove('active');
                    setTimeout(() => tempModal.remove(), 300);
                });
                
                // Dışarı tıklama
                tempModal.addEventListener('click', (e) => {
                    if (e.target === tempModal) {
                        tempModal.classList.remove('active');
                        setTimeout(() => tempModal.remove(), 300);
                    }
                });
                
                // Film tıklamaları
                tempModal.querySelectorAll('.actor-movie').forEach(item => {
                    item.addEventListener('click', () => {
                        const movieId = parseInt(item.dataset.id);
                        tempModal.classList.remove('active');
                        setTimeout(() => {
                            tempModal.remove();
                            this.showMovieDetails(movieId);
                        }, 300);
                    });
                });
            }, 10);
            
        } catch (error) {
            console.error('Oyuncu detayları yüklenemedi:', error);
            Helpers.showNotification('Oyuncu detayları yüklenemedi', 'error');
        } finally {
            this.hideLoadingModal();
        }
    }
    
    // Oyuncu modal HTML'i
    createActorModalHTML(actor) {
        const details = actor.toDetailData();
        
        // Bilinen filmleri al
        const knownFor = actor.combined_credits?.cast?.slice(0, 8) || [];
        
        return `
            <div class="actor-details">
                <div class="actor-header">
                    <div class="actor-profile">
                        <img src="${details.profile}" alt="${details.name}">
                    </div>
                    <div class="actor-info">
                        <h1>${details.name}</h1>
                        ${details.originalName !== details.name ? 
                            `<p class="actor-original-name">${details.originalName}</p>` : ''}
                        
                        <div class="actor-meta">
                            ${details.birthday ? `<p><strong>Doğum:</strong> ${details.birthday}${details.age ? ` (${details.age} yaşında)` : ''}</p>` : ''}
                            ${details.placeOfBirth ? `<p><strong>Doğum Yeri:</strong> ${details.placeOfBirth}</p>` : ''}
                            ${details.gender ? `<p><strong>Cinsiyet:</strong> ${details.gender}</p>` : ''}
                            ${details.knownForDepartment ? `<p><strong>Departman:</strong> ${details.knownForDepartment}</p>` : ''}
                        </div>
                        
                        <div class="actor-links">
                            ${details.imdbUrl ? `
                                <a href="${details.imdbUrl}" target="_blank" class="btn-imdb">
                                    <i class="fab fa-imdb"></i> IMDB
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                ${details.biography ? `
                    <div class="actor-biography">
                        <h3><i class="fas fa-book"></i> Biyografi</h3>
                        <p>${details.biography}</p>
                    </div>
                ` : ''}
                
                ${knownFor.length > 0 ? `
                    <div class="actor-known-for">
                        <h3><i class="fas fa-film"></i> Bilinen Filmler</h3>
                        <div class="known-for-grid">
                            ${knownFor.map(movie => `
                                <div class="actor-movie" data-id="${movie.id}">
                                    <img src="${movie.poster_path ? 
                                        `${Constants.IMAGE_BASE_URL}/w92${movie.poster_path}` : 
                                        'images/no-poster.jpg'}" 
                                         alt="${movie.title || movie.name}">
                                    <h4>${movie.title || movie.name}</h4>
                                    ${movie.character ? `<p>${movie.character}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Lazy loading ayarla
    setupLazyLoading() {
        if (!this.observer) return;
        
        document.querySelectorAll('.lazy-image').forEach(img => {
            this.observer.observe(img);
        });
    }
    
    // Scroll event'i
    handleScroll() {
        const scrollPosition = window.pageYOffset;
        const header = this.elements.header;
        
        if (scrollPosition > 100 && !this.uiState.isScrolled) {
            this.uiState.isScrolled = true;
            header.classList.add('scrolled');
        } else if (scrollPosition <= 100 && this.uiState.isScrolled) {
            this.uiState.isScrolled = false;
            header.classList.remove('scrolled');
        }
    }
    
    // Favori sayısını güncelle
    updateFavoritesCount() {
        const count = this.movieStore.favorites.length;
        if (this.elements.favoritesCount) {
            this.elements.favoritesCount.textContent = count;
            this.elements.favoritesCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // İzlenecekler sayısını güncelle
    updateWatchlistCount() {
        const count = this.movieStore.watchlist.length;
        if (this.elements.watchlistCount) {
            this.elements.watchlistCount.textContent = count;
            this.elements.watchlistCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // İstatistikleri güncelle
    updateStats() {
        const stats = this.movieStore.stats;
        
        if (this.elements.totalMovies) {
            this.elements.totalMovies.textContent = stats.totalMovies;
        }
        
        if (this.elements.totalFavorites) {
            this.elements.totalFavorites.textContent = stats.totalFavorites;
        }
        
        if (this.elements.totalWatchlist) {
            this.elements.totalWatchlist.textContent = stats.totalWatchlist;
        }
    }
    
    // Tür filtresini doldur
    populateGenreFilter(genres) {
        if (!this.elements.genreFilter) return;
        
        // Mevcut seçili değeri sakla
        const currentValue = this.elements.genreFilter.value;
        
        // Türleri ekle
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            this.elements.genreFilter.appendChild(option);
        });
        
        // Seçili değeri geri yükle
        this.elements.genreFilter.value = currentValue;
    }
    
    // Yıl filtresini doldur
    populateYearFilter() {
        if (!this.elements.yearFilter) return;
        
        const years = this.searchManager.getYears();
        
        // Dinamik datalist oluştur
        const datalist = document.createElement('datalist');
        datalist.id = 'yearList';
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            datalist.appendChild(option);
        });
        
        // Eğer datalist yoksa ekle
        if (!document.querySelector('#yearList')) {
            this.elements.yearFilter.parentNode.appendChild(datalist);
            this.elements.yearFilter.setAttribute('list', 'yearList');
        }
    }
    
    // UI'yi güncelle
    updateUI() {
        this.renderMovies();
        this.renderPagination();
        this.updateFavoritesCount();
        this.updateWatchlistCount();
        this.updateStats();
        
        // Tür ve yıl filtrelerini doldur
        const genres = this.searchManager.getGenres();
        if (genres.length > 0) {
            this.populateGenreFilter(genres);
        }
        
        this.populateYearFilter();
    }
    
    // Hata göster
    showError(message) {
        Helpers.showNotification(message, 'error');
    }
    
    // Başarı mesajı göster
    showSuccess(message) {
        Helpers.showNotification(message, 'success');
    }
}

// Global erişim için
window.UIManager = UIManager;