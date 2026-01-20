// API ve Uygulama Sabitleri
const Constants = {
    // TMDB API Anahtarı (kendi anahtarınızı eklemelisiniz)
    // https://www.themoviedb.org/settings/api adresinden alabilirsiniz
    API_KEY: 'your_api_key_here',
    
    // API Base URL
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    
    // Varsayılan dil
    LANGUAGE: 'tr-TR',
    
    // Resim boyutları
    IMAGE_SIZES: {
        BACKDROP: {
            SMALL: 'w300',
            MEDIUM: 'w780',
            LARGE: 'w1280',
            ORIGINAL: 'original'
        },
        POSTER: {
            SMALL: 'w185',
            MEDIUM: 'w342',
            LARGE: 'w500',
            XLARGE: 'w780',
            ORIGINAL: 'original'
        },
        PROFILE: {
            SMALL: 'w45',
            MEDIUM: 'w185',
            LARGE: 'h632',
            ORIGINAL: 'original'
        }
    },
    
    // Varsayılan ayarlar
    DEFAULT_SETTINGS: {
        PAGE: 1,
        ITEMS_PER_PAGE: 20,
        SORT_BY: 'popularity.desc',
        VIEW_MODE: 'grid'
    },
    
    // Yerel depolama anahtarları
    STORAGE_KEYS: {
        FAVORITES: 'movieApp_favorites',
        WATCHLIST: 'movieApp_watchlist',
        THEME: 'movieApp_theme',
        VIEW_MODE: 'movieApp_viewMode',
        LAST_SEARCH: 'movieApp_lastSearch',
        SETTINGS: 'movieApp_settings'
    },
    
    // Film türleri (genres) - API'den gelecek
    GENRES: [],
    
    // Hata mesajları
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'API anahtarı bulunamadı. Lütfen settings.js dosyasına API anahtarınızı ekleyin.',
        NETWORK_ERROR: 'Ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin.',
        NOT_FOUND: 'Aradığınız film bulunamadı.',
        SERVER_ERROR: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
        DEFAULT: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    },
    
    // Başarı mesajları
    SUCCESS_MESSAGES: {
        ADDED_TO_FAVORITES: 'Favorilere eklendi.',
        REMOVED_FROM_FAVORITES: 'Favorilerden çıkarıldı.',
        ADDED_TO_WATCHLIST: 'İzleneceklere eklendi.',
        REMOVED_FROM_WATCHLIST: 'İzleneceklerden çıkarıldı.'
    },
    
    // Renkler
    COLORS: {
        PRIMARY: '#4361ee',
        SECONDARY: '#3a0ca3',
        ACCENT: '#f72585',
        SUCCESS: '#4cc9f0',
        WARNING: '#f8961e',
        DANGER: '#e63946',
        INFO: '#4895ef',
        DARK: '#212529',
        LIGHT: '#f8f9fa'
    },
    
    // Animasyon süreleri
    ANIMATION_DURATIONS: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500
    },
    
    // Breakpoints
    BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1024,
        LARGE_DESKTOP: 1200
    },
    
    // Sayfalama sınırları
    PAGINATION: {
        MAX_VISIBLE_PAGES: 5,
        MAX_TOTAL_PAGES: 500 // TMDB API limiti
    }
};

// Eğer API anahtarı ayarlanmamışsa uyar
if (Constants.API_KEY === 'your_api_key_here') {
    console.warn(
        '%c⚠️ UYARI: API anahtarı ayarlanmamış!',
        'color: #ff9900; font-weight: bold; font-size: 14px;'
    );
    console.warn('Lütfen scripts/utils/constants.js dosyasındaki API_KEY değerini kendi TMDB API anahtarınızla değiştirin.');
    console.warn('API anahtarını buradan alabilirsiniz: https://www.themoviedb.org/settings/api');
}

// Global erişim için
window.Constants = Constants;