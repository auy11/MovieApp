// Yerel Depolama Yöneticisi
class LocalStorageManager {
    constructor() {
        this.keys = Constants.STORAGE_KEYS;
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB
    }
    
    // Temel işlemler
    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            
            // Depolama sınırı kontrolü
            if (this.getStorageUsage() + serializedValue.length > this.maxStorageSize) {
                console.warn('Yerel depolama sınırına yaklaşıldı');
                this.cleanupOldData();
            }
            
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('LocalStorage kayıt hatası:', error);
            this.showStorageError();
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('LocalStorage okuma hatası:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage silme hatası:', error);
            return false;
        }
    }
    
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('LocalStorage temizleme hatası:', error);
            return false;
        }
    }
    
    // Uygulama özel işlemler
    // Favoriler
    saveFavorites(favorites) {
        return this.set(this.keys.FAVORITES, favorites);
    }
    
    getFavorites() {
        return this.get(this.keys.FAVORITES, []);
    }
    
    // İzlenecekler
    saveWatchlist(watchlist) {
        return this.set(this.keys.WATCHLIST, watchlist);
    }
    
    getWatchlist() {
        return this.get(this.keys.WATCHLIST, []);
    }
    
    // Tema
    saveTheme(theme) {
        return this.set(this.keys.THEME, theme);
    }
    
    getTheme() {
        return this.get(this.keys.THEME, 'light');
    }
    
    // Görünüm modu
    saveViewMode(viewMode) {
        return this.set(this.keys.VIEW_MODE, viewMode);
    }
    
    getViewMode() {
        return this.get(this.keys.VIEW_MODE, 'grid');
    }
    
    // Son arama
    saveLastSearch(query) {
        return this.set(this.keys.LAST_SEARCH, query);
    }
    
    getLastSearch() {
        return this.get(this.keys.LAST_SEARCH, '');
    }
    
    // Ayarlar
    saveSettings(settings) {
        return this.set(this.keys.SETTINGS, settings);
    }
    
    getSettings() {
        return this.get(this.keys.SETTINGS, {
            language: 'tr-TR',
            adultContent: false,
            notifications: true,
            autoPlayTrailers: false
        });
    }
    
    // Favori ekle
    addFavorite(movie) {
        const favorites = this.getFavorites();
        const exists = favorites.some(fav => fav.id === movie.id);
        
        if (!exists) {
            favorites.push(movie);
            this.saveFavorites(favorites);
            return true;
        }
        return false;
    }
    
    // Favoriden çıkar
    removeFavorite(movieId) {
        const favorites = this.getFavorites();
        const newFavorites = favorites.filter(fav => fav.id !== movieId);
        this.saveFavorites(newFavorites);
        return newFavorites.length !== favorites.length;
    }
    
    // Favoride mi kontrol et
    isFavorite(movieId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.id === movieId);
    }
    
    // İzleneceklere ekle
    addToWatchlist(movie) {
        const watchlist = this.getWatchlist();
        const exists = watchlist.some(item => item.id === movie.id);
        
        if (!exists) {
            watchlist.push(movie);
            this.saveWatchlist(watchlist);
            return true;
        }
        return false;
    }
    
    // İzleneceklerden çıkar
    removeFromWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        const newWatchlist = watchlist.filter(item => item.id !== movieId);
        this.saveWatchlist(newWatchlist);
        return newWatchlist.length !== watchlist.length;
    }
    
    // İzleneceklerde mi kontrol et
    isInWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        return watchlist.some(item => item.id === movieId);
    }
    
    // Favori sayısı
    getFavoritesCount() {
        return this.getFavorites().length;
    }
    
    // İzlenecekler sayısı
    getWatchlistCount() {
        return this.getWatchlist().length;
    }
    
    // Depolama kullanımı
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return total;
    }
    
    getStoragePercentage() {
        return (this.getStorageUsage() / this.maxStorageSize) * 100;
    }
    
    getStorageInfo() {
        return {
            used: this.getStorageUsage(),
            max: this.maxStorageSize,
            percentage: this.getStoragePercentage(),
            free: this.maxStorageSize - this.getStorageUsage()
        };
    }
    
    // Eski verileri temizle
    cleanupOldData() {
        try {
            // 30 günden eski verileri temizle
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!Object.values(this.keys).includes(key)) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (item && item.timestamp && item.timestamp < thirtyDaysAgo) {
                            keysToRemove.push(key);
                        }
                    } catch (e) {
                        // Geçersiz JSON, temizle
                        keysToRemove.push(key);
                    }
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`${keysToRemove.length} eski öğe temizlendi.`);
            return keysToRemove.length;
        } catch (error) {
            console.error('Veri temizleme hatası:', error);
            return 0;
        }
    }
    
    // Veri yedekleme
    exportData() {
        const data = {};
        Object.values(this.keys).forEach(key => {
            data[key] = this.get(key);
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movie-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Veri geri yükleme
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Geçerlilik kontrolü
                    const validKeys = Object.values(this.keys);
                    const importedKeys = Object.keys(data);
                    
                    const isValid = importedKeys.every(key => 
                        validKeys.includes(key) || 
                        key.startsWith('movieApp_')
                    );
                    
                    if (!isValid) {
                        reject('Geçersiz yedek dosyası');
                        return;
                    }
                    
                    // Verileri geri yükle
                    importedKeys.forEach(key => {
                        if (validKeys.includes(key)) {
                            this.set(key, data[key]);
                        }
                    });
                    
                    resolve('Veriler başarıyla geri yüklendi');
                } catch (error) {
                    reject('Dosya okuma hatası: ' + error.message);
                }
            };
            
            reader.onerror = () => {
                reject('Dosya okuma hatası');
            };
            
            reader.readAsText(file);
        });
    }
    
    // Hata gösterimi
    showStorageError() {
        Helpers.showNotification(
            'Yerel depolama hatası. Veriler kaydedilemedi.',
            'error'
        );
    }
    
    // Başlangıç kontrolü
    initialize() {
        // Depolama kontrolü
        if (!this.isLocalStorageAvailable()) {
            console.error('LocalStorage kullanılamıyor');
            Helpers.showNotification(
                'Tarayıcınız LocalStorage desteklemiyor. Bazı özellikler çalışmayabilir.',
                'warning'
            );
            return false;
        }
        
        // Temel verileri oluştur
        if (!this.getFavorites()) {
            this.saveFavorites([]);
        }
        
        if (!this.getWatchlist()) {
            this.saveWatchlist([]);
        }
        
        if (!this.getTheme()) {
            this.saveTheme('light');
        }
        
        // Eski verileri temizle
        this.cleanupOldData();
        
        return true;
    }
    
    // LocalStorage kontrolü
    isLocalStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Global erişim için
window.LocalStorageManager = LocalStorageManager;