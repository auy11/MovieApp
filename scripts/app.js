// Ana Uygulama Sınıfı
class MovieApp {
    constructor() {
        // API anahtarını kontrol et
        this.checkAPIKey();
        
        // Servisleri başlat
        this.initializeServices();
        
        // State yönetimi
        this.initializeState();
        
        // UI yönetimi
        this.initializeUI();
        
        // Event listener'ları başlat
        this.initializeEventListeners();
        
        // Uygulamayı başlat
        this.startApp();
    }
    
    // API anahtarını kontrol et
    checkAPIKey() {
        if (Constants.API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            const errorMessage = `
                ⚠️ API Anahtarı Eksik!
                
                Film arama uygulamasını kullanabilmek için TMDB API anahtarına ihtiyacınız var.
                
                Lütfen aşağıdaki adımları takip edin:
                1. https://www.themoviedb.org/settings/api adresine gidin
                2. Hesap oluşturun veya giriş yapın
                3. API anahtarı alın
                4. scripts/utils/constants.js dosyasını açın
                5. API_KEY değerini kendi anahtarınızla değiştirin
                
                Alternatif olarak, demo için aşağıdaki örnek anahtarı kullanabilirsiniz:
                (Not: Bu anahtar sınırlı sayıda istek için geçerlidir)
                
                API_KEY: 'c4b4c79d8c5c4c4c4c4c4c4c4c4c4c4c'
            `;
            
            console.error(errorMessage);
            
            // Kullanıcıya bildir
            this.showAPIKeyError();
            
            throw new Error('API anahtarı bulunamadı.');
        }
    }
    
    // API anahtarı hatası göster
    showAPIKeyError() {
        const errorHTML = `
            <div class="api-error-overlay">
                <div class="api-error-modal">
                    <div class="api-error-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h2>API Anahtarı Eksik</h2>
                    </div>
                    <div class="api-error-content">
                        <p>Film arama uygulamasını kullanabilmek için TMDB API anahtarı gereklidir.</p>
                        
                        <div class="api-error-steps">
                            <h3>Adımlar:</h3>
                            <ol>
                                <li>
                                    <a href="https://www.themoviedb.org/settings/api" target="_blank">
                                        TMDB API Sayfasına Git
                                        <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </li>
                                <li>Hesap oluşturun veya giriş yapın</li>
                                <li>API anahtarı alın</li>
                                <li><code>scripts/utils/constants.js</code> dosyasını açın</li>
                                <li><code>API_KEY</code> değerini kendi anahtarınızla değiştirin</li>
                            </ol>
                        </div>
                        
                        <div class="api-error-demo">
                            <h3>Demo İçin Örnek Anahtar:</h3>
                            <code>c4b4c79d8c5c4c4c4c4c4c4c4c4c4c</code>
                            <small>(Sınırlı istek hakkı vardır)</small>
                        </div>
                        
                        <div class="api-error-actions">
                            <button id="useDemoKey" class="btn-demo">
                                <i class="fas fa-play-circle"></i> Demo Anahtarla Başlat
                            </button>
                            <button id="reloadPage" class="btn-reload">
                                <i class="fas fa-redo"></i> Sayfayı Yenile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Stilleri ekle
        const styles = `
            .api-error-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                padding: 20px;
                backdrop-filter: blur(10px);
            }
            
            .api-error-modal {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .api-error-header {
                background: linear-gradient(135deg, #f72585, #4361ee);
                color: white;
                padding: 25px 30px;
                border-radius: 12px 12px 0 0;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .api-error-header i {
                font-size: 2.5rem;
            }
            
            .api-error-header h2 {
                margin: 0;
                font-size: 1.8rem;
            }
            
            .api-error-content {
                padding: 30px;
                color: #333;
            }
            
            .api-error-content p {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            
            .api-error-steps {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
                border-left: 4px solid #4361ee;
            }
            
            .api-error-steps h3 {
                color: #4361ee;
                margin-top: 0;
                margin-bottom: 15px;
            }
            
            .api-error-steps ol {
                padding-left: 20px;
                margin: 0;
            }
            
            .api-error-steps li {
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .api-error-steps a {
                color: #4361ee;
                text-decoration: none;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                transition: color 0.2s;
            }
            
            .api-error-steps a:hover {
                color: #f72585;
            }
            
            .api-error-demo {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 25px;
            }
            
            .api-error-demo h3 {
                color: #856404;
                margin-top: 0;
                margin-bottom: 10px;
            }
            
            .api-error-demo code {
                display: block;
                background: white;
                padding: 10px 15px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                margin-bottom: 10px;
                border: 1px solid #ddd;
            }
            
            .api-error-demo small {
                color: #666;
                font-size: 0.9rem;
            }
            
            .api-error-actions {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .btn-demo, .btn-reload {
                flex: 1;
                padding: 15px 25px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                min-width: 200px;
            }
            
            .btn-demo {
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                color: white;
            }
            
            .btn-demo:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3);
            }
            
            .btn-reload {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #dee2e6;
            }
            
            .btn-reload:hover {
                background: #e9ecef;
                transform: translateY(-2px);
            }
        `;
        
        // Stilleri ekle
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // HTML'i ekle
        document.body.insertAdjacentHTML('beforeend', errorHTML);
        
        // Event listener'ları ekle
        document.getElementById('useDemoKey').addEventListener('click', () => {
            // Demo anahtarını kullan
            Constants.API_KEY = 'c4b4c79d8c5c4c4c4c4c4c4c4c4c4c';
            localStorage.setItem('demo_key_used', 'true');
            
            // Hata ekranını kaldır
            document.querySelector('.api-error-overlay').remove();
            
            // Uygulamayı yeniden başlat
            this.initializeServices();
            this.initializeState();
            this.initializeUI();
            this.startApp();
        });
        
        document.getElementById('reloadPage').addEventListener('click', () => {
            location.reload();
        });
    }
    
    // Servisleri başlat
    initializeServices() {
        try {
            // TMDB Servisi
            this.tmdbService = new TMDBService(Constants.API_KEY);
            
            // LocalStorage Manager
            this.storageManager = new LocalStorageManager();
            this.storageManager.initialize();
            
        } catch (error) {
            console.error('Servisler başlatılamadı:', error);
            throw error;
        }
    }
    
    // State yönetimini başlat
    initializeState() {
        try {
            // Film Store
            this.movieStore = new MovieStore();
            
            // Arama Yöneticisi
            this.searchManager = new SearchManager(this.tmdbService, this.movieStore);
            
            // Store'daki değişiklikleri dinle
            this.unsubscribe = this.movieStore.subscribe((state) => {
                this.handleStateChange(state);
            });
            
        } catch (error) {
            console.error('State yönetimi başlatılamadı:', error);
            throw error;
        }
    }
    
    // UI yönetimini başlat
    initializeUI() {
        try {
            // UI Manager
            this.uiManager = new UIManager(this.movieStore, this.searchManager);
            
        } catch (error) {
            console.error('UI yönetimi başlatılamadı:', error);
            throw error;
        }
    }
    
    // Event listener'ları başlat
    initializeEventListeners() {
        // Global event listener'lar
        this.setupGlobalListeners();
        
        // Online/offline durumu
        this.setupNetworkListeners();
        
        // Service Worker (PWA için)
        this.setupServiceWorker();
        
        // Beforeunload (sayfadan çıkarken)
        this.setupBeforeUnload();
    }
    
    // Global event listener'lar
    setupGlobalListeners() {
        // ESC tuşu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.uiManager.closeAllModals();
            }
            
            // Ctrl/Cmd + K ile arama kutusuna odaklan
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.uiManager.elements.searchInput.focus();
            }
        });
        
        // Resize event'i
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Click outside modals
        document.addEventListener('click', (e) => {
            // Herhangi bir modal açıksa ve dışarı tıklanmışsa
            if (this.uiManager.uiState.currentModal && 
                !e.target.closest('.modal-content') && 
                e.target.classList.contains('modal')) {
                this.uiManager.closeAllModals();
            }
        });
    }
    
    // Network listener'ları
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            Helpers.showNotification('İnternet bağlantısı sağlandı', 'success', 3000);
            this.checkConnection();
        });
        
        window.addEventListener('offline', () => {
            Helpers.showNotification('İnternet bağlantısı kesildi', 'error', 3000);
        });
    }
    
    // Service Worker (PWA)
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('ServiceWorker kayıt başarılı:', registration.scope);
                    },
                    (error) => {
                        console.log('ServiceWorker kayıt başarısız:', error);
                    }
                );
            });
        }
    }
    
    // Beforeunload event'i
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            // Değişiklikler kaydedilebilir
            this.saveAppState();
        });
    }
    
    // Uygulamayı başlat
    async startApp() {
        try {
            // API durumunu kontrol et
            const isAPIReady = await this.checkAPIStatus();
            
            if (!isAPIReady) {
                throw new Error('API servisine bağlanılamadı.');
            }
            
            // Başlangıç yükleniyor ekranı
            this.showAppLoading();
            
            // Film türlerini yükle
            await this.loadGenres();
            
            // İlk filmleri yükle
            await this.loadInitialMovies();
            
            // UI'yi güncelle
            this.uiManager.updateUI();
            
            // Başarılı başlangıç
            this.hideAppLoading();
            
            // Hoş geldin mesajı
            this.showWelcomeMessage();
            
            // Performans izleme
            this.startPerformanceMonitoring();
            
        } catch (error) {
            console.error('Uygulama başlatılamadı:', error);
            this.handleStartupError(error);
        }
    }
    
    // API durumunu kontrol et
    async checkAPIStatus() {
        try {
            const isOnline = await this.tmdbService.checkAPIStatus();
            
            if (!isOnline) {
                Helpers.showNotification(
                    'TMDB API servisine bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
                    'warning'
                );
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('API durum kontrolü başarısız:', error);
            return false;
        }
    }
    
    // Film türlerini yükle
    async loadGenres() {
        try {
            const genres = await this.searchManager.loadGenres();
            console.log(`${genres.length} film türü yüklendi.`);
            return genres;
        } catch (error) {
            console.error('Film türleri yüklenemedi:', error);
            return [];
        }
    }
    
    // İlk filmleri yükle
    async loadInitialMovies() {
        try {
            // Son aramayı kontrol et
            const lastSearch = this.storageManager.getLastSearch();
            
            if (lastSearch && lastSearch.trim().length > 0) {
                // Son aramayı yeniden yükle
                await this.searchManager.searchMovies(lastSearch, 1);
            } else {
                // Popüler filmleri yükle
                await this.searchManager.getPopularMovies(1);
            }
            
            return true;
        } catch (error) {
            console.error('İlk filmler yüklenemedi:', error);
            throw error;
        }
    }
    
    // State değişikliklerini yönet
    handleStateChange(state) {
        // Loading durumu
        if (state.isLoading) {
            this.uiManager.showLoading();
        }
        
        // Filmler değişti
        if (state.filteredMovies.length > 0) {
            this.uiManager.renderMovies();
            this.uiManager.renderPagination();
        }
        
        // Favoriler değişti
        if (state.favorites.length !== this.lastFavoriteCount) {
            this.lastFavoriteCount = state.favorites.length;
            this.uiManager.updateFavoritesCount();
        }
        
        // İzlenecekler değişti
        if (state.watchlist.length !== this.lastWatchlistCount) {
            this.lastWatchlistCount = state.watchlist.length;
            this.uiManager.updateWatchlistCount();
        }
        
        // İstatistikler değişti
        this.uiManager.updateStats();
        
        // Hata durumu
        if (state.error) {
            this.uiManager.showError(state.error);
        }
    }
    
    // Resize event'ini yönet
    handleResize() {
        const width = window.innerWidth;
        
        // Mobil için optimizasyon
        if (width < 768 && this.uiManager.uiState.activeView === 'list') {
            this.uiManager.setViewMode('grid');
        }
        
        // Modal boyutlarını ayarla
        this.adjustModalSizes();
    }
    
    // Modal boyutlarını ayarla
    adjustModalSizes() {
        if (this.uiManager.uiState.currentModal) {
            const modal = this.uiManager.uiState.currentModal;
            const content = modal.querySelector('.modal-content');
            
            if (content) {
                const windowHeight = window.innerHeight;
                content.style.maxHeight = `${windowHeight * 0.9}px`;
            }
        }
    }
    
    // Bağlantı kontrolü
    async checkConnection() {
        try {
            const isOnline = await this.tmdbService.checkAPIStatus();
            
            if (isOnline) {
                // Yeniden bağlandığında verileri tazele
                await this.refreshData();
            }
            
            return isOnline;
        } catch (error) {
            return false;
        }
    }
    
    // Verileri tazele
    async refreshData() {
        try {
            const currentPage = this.movieStore.currentPage;
            const searchQuery = this.movieStore.searchQuery;
            
            if (searchQuery) {
                await this.searchManager.searchMovies(searchQuery, currentPage);
            } else {
                await this.searchManager.getPopularMovies(currentPage);
            }
            
            Helpers.showNotification('Veriler tazelendi', 'success', 2000);
        } catch (error) {
            console.error('Veri tazeleme başarısız:', error);
        }
    }
    
    // Uygulama durumunu kaydet
    saveAppState() {
        try {
            // Arama geçmişini kaydet
            this.storageManager.saveLastSearch(this.movieStore.searchQuery);
            
            // Ayarları kaydet
            const settings = {
                theme: this.storageManager.getTheme(),
                viewMode: this.movieStore.viewMode,
                lastUpdate: Date.now()
            };
            
            this.storageManager.saveSettings(settings);
            
        } catch (error) {
            console.error('Uygulama durumu kaydedilemedi:', error);
        }
    }
    
    // Uygulama yükleniyor ekranı
    showAppLoading() {
        const loadingHTML = `
            <div id="appLoading" class="app-loading">
                <div class="app-loading-content">
                    <div class="app-loading-logo">
                        <i class="fas fa-film"></i>
                        <h1>FilmArama</h1>
                    </div>
                    <div class="app-loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p class="app-loading-text">Uygulama yükleniyor...</p>
                    <div class="app-loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;
        
        const styles = `
            .app-loading {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                color: white;
            }
            
            .app-loading-content {
                text-align: center;
                max-width: 400px;
                padding: 40px;
            }
            
            .app-loading-logo {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 40px;
            }
            
            .app-loading-logo i {
                font-size: 3.5rem;
                color: white;
                animation: pulse 2s infinite;
            }
            
            .app-loading-logo h1 {
                font-size: 2.5rem;
                margin: 0;
                background: linear-gradient(45deg, #fff, #f72585);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
            
            .app-loading-spinner {
                margin: 30px auto;
            }
            
            .app-loading-spinner .spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            .app-loading-text {
                font-size: 1.2rem;
                margin: 20px 0;
                opacity: 0.9;
            }
            
            .app-loading-progress {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 30px;
            }
            
            .progress-bar {
                height: 100%;
                width: 0%;
                background: white;
                animation: loading 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            @keyframes loading {
                0% { width: 0%; }
                50% { width: 100%; }
                100% { width: 0%; }
            }
        `;
        
        // Stilleri ekle
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        styleSheet.id = 'app-loading-styles';
        document.head.appendChild(styleSheet);
        
        // HTML'i ekle
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }
    
    // Uygulama yükleniyor ekranını gizle
    hideAppLoading() {
        const loadingElement = document.getElementById('appLoading');
        const loadingStyles = document.getElementById('app-loading-styles');
        
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            loadingElement.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                loadingElement.remove();
                if (loadingStyles) {
                    loadingStyles.remove();
                }
            }, 300);
        }
    }
    
    // Hoş geldin mesajı
    showWelcomeMessage() {
        // İlk ziyaret kontrolü
        const firstVisit = !localStorage.getItem('app_visited');
        
        if (firstVisit) {
            localStorage.setItem('app_visited', 'true');
            
            setTimeout(() => {
                Helpers.showNotification(
                    '🎬 FilmArama uygulamasına hoş geldiniz!',
                    'info',
                    5000
                );
            }, 1000);
        }
        
        // Günlük ipucu
        this.showDailyTip();
    }
    
    // Günlük ipucu
    showDailyTip() {
        const tips = [
            '💡 İpucu: Ctrl/Cmd + K ile hızlı arama yapabilirsiniz.',
            '💡 İpucu: Film kartlarına tıklayarak detayları görüntüleyebilirsiniz.',
            '💡 İpucu: Kalp ikonuna tıklayarak filmleri favorilere ekleyebilirsiniz.',
            '💡 İpucu: Filtrelerle arama sonuçlarını daraltabilirsiniz.',
            '💡 İpucu: Karanlık mod için sağ üstteki tema butonunu kullanın.'
        ];
        
        const today = new Date().toDateString();
        const lastTipDate = localStorage.getItem('last_tip_date');
        
        if (lastTipDate !== today) {
            localStorage.setItem('last_tip_date', today);
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            
            setTimeout(() => {
                Helpers.showNotification(randomTip, 'info', 6000);
            }, 2000);
        }
    }
    
    // Performans izleme
    startPerformanceMonitoring() {
        // Performans metriklerini topla
        const perfData = {
            loadTime: Date.now() - performance.timing.navigationStart,
            memory: performance.memory ? performance.memory.usedJSHeapSize : 0,
            filmCount: this.movieStore.movies.length,
            cacheSize: this.tmdbService.cache.size
        };
        
        console.log('📊 Performans Metrikleri:', perfData);
        
        // Uzun süreli izleme
        setInterval(() => {
            this.monitorPerformance();
        }, 60000); // Her dakika
    }
    
    // Performans izle
    monitorPerformance() {
        const stats = {
            apiRequests: this.tmdbService.requestCount,
            cacheHitRatio: this.calculateCacheHitRatio(),
            memoryUsage: performance.memory ? 
                Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A',
            filmCache: this.movieStore.state.cache.movies.size,
            detailCache: this.movieStore.state.cache.details.size
        };
        
        // Eğer cache hit oranı düşükse, cache'i temizle
        if (stats.cacheHitRatio < 0.3 && this.tmdbService.cache.size > 50) {
            console.log('🔄 Düşük cache hit oranı, cache temizleniyor...');
            this.tmdbService.clearCache();
        }
    }
    
    // Cache hit oranını hesapla
    calculateCacheHitRatio() {
        // Basit bir hesaplama
        const totalRequests = this.tmdbService.requestCount;
        const cacheHits = this.tmdbService.cache.size;
        
        if (totalRequests === 0) return 0;
        return Math.min(cacheHits / totalRequests, 1);
    }
    
    // Başlangıç hatası yönetimi
    handleStartupError(error) {
        console.error('Uygulama başlatma hatası:', error);
        
        const errorHTML = `
            <div class="startup-error">
                <div class="error-content">
                    <i class="fas fa-exclamation-circle"></i>
                    <h2>Uygulama Yüklenemedi</h2>
                    <p>${error.message || 'Bilinmeyen bir hata oluştu.'}</p>
                    
                    <div class="error-actions">
                        <button id="retryStartup" class="btn-retry">
                            <i class="fas fa-redo"></i> Tekrar Dene
                        </button>
                        <button id="resetApp" class="btn-reset">
                            <i class="fas fa-trash-alt"></i> Uygulamayı Sıfırla
                        </button>
                    </div>
                    
                    <div class="error-details">
                        <button id="showErrorDetails" class="btn-details">
                            <i class="fas fa-code"></i> Hata Detaylarını Göster
                        </button>
                        <div id="errorDetails" class="details-content" style="display: none;">
                            <pre>${error.stack || 'Hata detayı bulunamadı.'}</pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Mevcut loading ekranını kaldır
        this.hideAppLoading();
        
        // Hata ekranını göster
        document.body.insertAdjacentHTML('beforeend', errorHTML);
        
        // Event listener'ları ekle
        document.getElementById('retryStartup').addEventListener('click', () => {
            location.reload();
        });
        
        document.getElementById('resetApp').addEventListener('click', () => {
            if (confirm('Tüm verileriniz silinecek. Emin misiniz?')) {
                localStorage.clear();
                location.reload();
            }
        });
        
        document.getElementById('showErrorDetails').addEventListener('click', (e) => {
            const details = document.getElementById('errorDetails');
            const isVisible = details.style.display === 'block';
            
            details.style.display = isVisible ? 'none' : 'block';
            e.target.innerHTML = isVisible ? 
                '<i class="fas fa-code"></i> Hata Detaylarını Göster' :
                '<i class="fas fa-code"></i> Hata Detaylarını Gizle';
        });
    }
    
    // Uygulamayı durdur
    destroy() {
        // Event listener'ları temizle
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        // State'i temizle
        if (this.movieStore) {
            this.movieStore.clearAllData();
        }
        
        // Cache'i temizle
        if (this.tmdbService) {
            this.tmdbService.clearCache();
        }
        
        // UI'yi temizle
        if (this.uiManager) {
            // UI Manager'ı temizleme işlemleri
        }
        
        console.log('🎬 Uygulama durduruldu.');
    }
    
    // Uygulama bilgisi
    getAppInfo() {
        return {
            version: '1.0.0',
            apiKey: Constants.API_KEY ? '✅ Ayarlı' : '❌ Eksik',
            services: {
                tmdb: this.tmdbService ? '✅ Başlatıldı' : '❌ Başlatılamadı',
                storage: this.storageManager ? '✅ Başlatıldı' : '❌ Başlatılamadı',
                state: this.movieStore ? '✅ Başlatıldı' : '❌ Başlatılamadı',
                ui: this.uiManager ? '✅ Başlatıldı' : '❌ Başlatılamadı'
            },
            stats: this.movieStore ? this.movieStore.stats : {},
            performance: {
                cacheSize: this.tmdbService ? this.tmdbService.cache.size : 0,
                requestCount: this.tmdbService ? this.tmdbService.requestCount : 0,
                memory: performance.memory ? 
                    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
            }
        };
    }
    
    // Debug modu
    enableDebugMode() {
        console.log('🐛 Debug modu etkinleştirildi.');
        
        // Global değişkenlere erişim
        window.app = this;
        window.store = this.movieStore;
        window.tmdb = this.tmdbService;
        window.ui = this.uiManager;
        
        // Debug fonksiyonları
        window.debug = {
            clearCache: () => {
                this.tmdbService.clearCache();
                console.log('🗑️ API cache temizlendi.');
            },
            clearStorage: () => {
                localStorage.clear();
                console.log('🗑️ LocalStorage temizlendi.');
            },
            showStats: () => {
                const info = this.getAppInfo();
                console.table(info);
            },
            reloadData: async () => {
                console.log('🔄 Veriler yeniden yükleniyor...');
                await this.refreshData();
            },
            testAPI: async () => {
                console.log('🧪 API test ediliyor...');
                try {
                    const data = await this.tmdbService.getPopularMovies(1);
                    console.log('✅ API çalışıyor:', data.page, 'sayfa yüklendi');
                } catch (error) {
                    console.error('❌ API hatası:', error);
                }
            }
        };
        
        // Debug kısayolları
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                console.log('🔧 Debug Menüsü:', window.debug);
            }
            
            // Ctrl/Cmd + Shift + S
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                window.debug.showStats();
            }
        });
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 FilmArama uygulaması başlatılıyor...');
    
    // Uygulama instance'ını oluştur
    window.movieApp = new MovieApp();
    
    // Debug modu (sadece geliştirme ortamında)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            window.movieApp.enableDebugMode();
        }, 1000);
    }
    
    // Uygulama bilgisini konsola yaz
    setTimeout(() => {
        const appInfo = window.movieApp.getAppInfo();
        console.log('🚀 Uygulama başlatıldı:', appInfo);
    }, 2000);
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('📛 Global hata:', event.error);
    
    // Kullanıcıya bildir (spam'den kaçınmak için)
    if (event.error.message && !event.error.message.includes('API')) {
        Helpers.showNotification(
            'Bir hata oluştu. Lütfen sayfayı yenileyin.',
            'error',
            5000
        );
    }
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('📛 İşlenmemiş promise hatası:', event.reason);
});