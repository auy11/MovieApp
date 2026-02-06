// ============================================================
// MY LIST MANAGER - CRUD İşlemleri için LocalStorage Yönetimi
// scripts/managers/MyListManager.js - Bu dosyayı projeye ekleyin
// ============================================================

export class MyListManager {
    constructor() {
        this.STORAGE_KEY = 'myMovieList';
        this.list = this.loadFromStorage();
    }

    // ============================================================
    // CREATE - Film Ekleme
    // ============================================================
    addMovie(movieData) {
        const movie = {
            id: Date.now(), // Unique ID
            tmdbId: movieData.id, // TMDB'den gelen ID
            title: movieData.title,
            poster: movieData.poster_path,
            rating: movieData.vote_average,
            year: movieData.release_date?.split('-')[0],
            addedDate: new Date().toISOString(),
            // Kullanıcı verileri
            myRating: null,
            myNotes: '',
            watchStatus: 'want-to-watch', // want-to-watch, watching, watched
            isFavorite: false
        };

        // Duplicate kontrolü
        const exists = this.list.find(m => m.tmdbId === movieData.id);
        if (exists) {
            throw new Error('Bu film zaten listenizde!');
        }

        this.list.unshift(movie); // Başa ekle
        this.saveToStorage();
        return movie;
    }

    // ============================================================
    // READ - Listeleme ve Filtreleme
    // ============================================================
    getAllMovies() {
        return this.list;
    }

    getMovieById(id) {
        return this.list.find(movie => movie.id === id);
    }

    getByStatus(status) {
        return this.list.filter(movie => movie.watchStatus === status);
    }

    getFavorites() {
        return this.list.filter(movie => movie.isFavorite);
    }

    searchInList(query) {
        const lowerQuery = query.toLowerCase();
        return this.list.filter(movie => 
            movie.title.toLowerCase().includes(lowerQuery)
        );
    }

    // ============================================================
    // UPDATE - Film Güncelleme
    // ============================================================
    updateMovie(id, updates) {
        const index = this.list.findIndex(movie => movie.id === id);
        if (index === -1) {
            throw new Error('Film bulunamadı!');
        }

        this.list[index] = {
            ...this.list[index],
            ...updates,
            updatedDate: new Date().toISOString()
        };

        this.saveToStorage();
        return this.list[index];
    }

    updateRating(id, rating) {
        return this.updateMovie(id, { myRating: rating });
    }

    updateNotes(id, notes) {
        return this.updateMovie(id, { myNotes: notes });
    }

    updateStatus(id, status) {
        return this.updateMovie(id, { watchStatus: status });
    }

    toggleFavorite(id) {
        const movie = this.getMovieById(id);
        return this.updateMovie(id, { isFavorite: !movie.isFavorite });
    }

    // ============================================================
    // DELETE - Film Silme
    // ============================================================
    deleteMovie(id) {
        const index = this.list.findIndex(movie => movie.id === id);
        if (index === -1) {
            throw new Error('Film bulunamadı!');
        }

        const deleted = this.list.splice(index, 1)[0];
        this.saveToStorage();
        return deleted;
    }

    clearList() {
        if (confirm('Tüm listeyi silmek istediğinize emin misiniz?')) {
            this.list = [];
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // ============================================================
    // STORAGE İşlemleri
    // ============================================================
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.list));
        } catch (error) {
            console.error('LocalStorage kayıt hatası:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('LocalStorage okuma hatası:', error);
            return [];
        }
    }

    // ============================================================
    // İSTATİSTİKLER
    // ============================================================
    getStats() {
        return {
            total: this.list.length,
            wantToWatch: this.getByStatus('want-to-watch').length,
            watching: this.getByStatus('watching').length,
            watched: this.getByStatus('watched').length,
            favorites: this.getFavorites().length,
            averageRating: this.calculateAverageRating()
        };
    }

    calculateAverageRating() {
        const rated = this.list.filter(m => m.myRating !== null);
        if (rated.length === 0) return 0;
        
        const sum = rated.reduce((acc, m) => acc + m.myRating, 0);
        return (sum / rated.length).toFixed(1);
    }

    // ============================================================
    // EXPORT / IMPORT
    // ============================================================
    exportAsJSON() {
        const dataStr = JSON.stringify(this.list, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-movie-list-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (!Array.isArray(imported)) {
                        throw new Error('Geçersiz dosya formatı!');
                    }
                    
                    this.list = imported;
                    this.saveToStorage();
                    resolve(imported.length);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Dosya okuma hatası!'));
            reader.readAsText(file);
        });
    }
}

// Singleton pattern
export const myListManager = new MyListManager();