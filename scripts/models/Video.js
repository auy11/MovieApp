// Video Model Sınıfı
class Video {
    constructor(data) {
        this.id = data.id || null;
        this.key = data.key || null;
        this.name = data.name || 'İsimsiz Video';
        this.site = data.site || 'YouTube';
        this.type = data.type || 'Trailer';
        this.official = data.official || false;
        this.publishedAt = data.published_at || null;
        this.size = data.size || 0;
        this.iso_639_1 = data.iso_639_1 || 'en';
        this.iso_3166_1 = data.iso_3166_1 || 'US';
        
        // Video boyutları için sabitler
        this.VIDEO_SIZES = {
            'SD': 360,
            'HD': 720,
            'FHD': 1080
        };
    }
    
    // YouTube embed URL'si
    getEmbedUrl() {
        if (this.site !== 'YouTube') return null;
        return `https://www.youtube.com/embed/${this.key}`;
    }
    
    // YouTube watch URL'si
    getWatchUrl() {
        if (this.site !== 'YouTube') return null;
        return `https://www.youtube.com/watch?v=${this.key}`;
    }
    
    // Vimeo embed URL'si
    getVimeoEmbedUrl() {
        if (this.site !== 'Vimeo') return null;
        return `https://player.vimeo.com/video/${this.key}`;
    }
    
    // Vimeo watch URL'si
    getVimeoWatchUrl() {
        if (this.site !== 'Vimeo') return null;
        return `https://vimeo.com/${this.key}`;
    }
    
    // Video thumbnail URL'si
    getThumbnailUrl(quality = 'hqdefault') {
        if (this.site !== 'YouTube') return null;
        
        const thumbnails = {
            'default': `https://img.youtube.com/vi/${this.key}/default.jpg`,
            'mqdefault': `https://img.youtube.com/vi/${this.key}/mqdefault.jpg`,
            'hqdefault': `https://img.youtube.com/vi/${this.key}/hqdefault.jpg`,
            'sddefault': `https://img.youtube.com/vi/${this.key}/sddefault.jpg`,
            'maxresdefault': `https://img.youtube.com/vi/${this.key}/maxresdefault.jpg`
        };
        
        return thumbnails[quality] || thumbnails.hqdefault;
    }
    
    // Video boyutu metni
    getSizeText() {
        if (!this.size) return 'Bilinmiyor';
        
        const sizes = {
            360: 'SD',
            480: 'SD',
            720: 'HD',
            1080: 'Full HD',
            1440: '2K',
            2160: '4K'
        };
        
        return sizes[this.size] || `${this.size}p`;
    }
    
    // Video tipi metni
    getTypeText() {
        const types = {
            'Trailer': 'Fragman',
            'Teaser': 'Tanıtım',
            'Clip': 'Klip',
            'Featurette': 'Belgesel',
            'Behind the Scenes': 'Kamera Arkası',
            'Bloopers': 'Şakalar',
            'Opening Credits': 'Jenerik',
            'Recap': 'Özet'
        };
        
        return types[this.type] || this.type;
    }
    
    // Video tipi ikonu
    getTypeIcon() {
        const icons = {
            'Trailer': 'fas fa-film',
            'Teaser': 'fas fa-play-circle',
            'Clip': 'fas fa-cut',
            'Featurette': 'fas fa-video',
            'Behind the Scenes': 'fas fa-theater-masks',
            'Bloopers': 'fas fa-laugh',
            'Opening Credits': 'fas fa-ticket-alt',
            'Recap': 'fas fa-history'
        };
        
        return icons[this.type] || 'fas fa-video';
    }
    
    // Yayın tarihi formatlı
    getFormattedDate() {
        if (!this.publishedAt) return 'Tarih Yok';
        return Helpers.formatDate(this.publishedAt, 'short');
    }
    
    // Resmi video mı?
    isOfficial() {
        return this.official;
    }
    
    // Video dil kodu
    getLanguage() {
        const languages = {
            'en': 'İngilizce',
            'tr': 'Türkçe',
            'de': 'Almanca',
            'fr': 'Fransızca',
            'es': 'İspanyolca',
            'it': 'İtalyanca',
            'ru': 'Rusça',
            'ja': 'Japonca',
            'ko': 'Korece',
            'zh': 'Çince'
        };
        
        return languages[this.iso_639_1] || this.iso_639_1.toUpperCase();
    }
    
    // Ülke kodu
    getCountry() {
        const countries = {
            'US': 'Amerika',
            'GB': 'İngiltere',
            'TR': 'Türkiye',
            'DE': 'Almanya',
            'FR': 'Fransa',
            'ES': 'İspanya',
            'IT': 'İtalya',
            'RU': 'Rusya',
            'JP': 'Japonya',
            'KR': 'Güney Kore',
            'CN': 'Çin'
        };
        
        return countries[this.iso_3166_1] || this.iso_3166_1;
    }
    
    // Video kartı verisi
    toCardData() {
        return {
            id: this.id,
            key: this.key,
            name: this.name,
            site: this.site,
            type: this.type,
            typeText: this.getTypeText(),
            typeIcon: this.getTypeIcon(),
            thumbnail: this.getThumbnailUrl(),
            embedUrl: this.getEmbedUrl(),
            watchUrl: this.getWatchUrl(),
            official: this.official,
            date: this.getFormattedDate(),
            language: this.getLanguage(),
            country: this.getCountry(),
            size: this.getSizeText()
        };
    }
    
    // JSON'a çevir
    toJSON() {
        return {
            id: this.id,
            key: this.key,
            name: this.name,
            site: this.site,
            type: this.type,
            official: this.official,
            publishedAt: this.publishedAt
        };
    }
    
    // Video oynatıcı HTML'i
    getPlayerHTML(width = '100%', height = '400') {
        if (this.site === 'YouTube') {
            return `
                <iframe 
                    width="${width}" 
                    height="${height}" 
                    src="${this.getEmbedUrl()}?rel=0&amp;showinfo=0&amp;autoplay=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else if (this.site === 'Vimeo') {
            return `
                <iframe 
                    width="${width}" 
                    height="${height}" 
                    src="${this.getVimeoEmbedUrl()}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
        
        return `<p>Bu video sitesi desteklenmiyor: ${this.site}</p>`;
    }
}

// Global erişim için
window.Video = Video;