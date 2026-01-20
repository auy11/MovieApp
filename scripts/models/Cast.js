// Oyuncu Model Sınıfı
class CastMember {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || 'İsimsiz';
        this.character = data.character || 'Bilinmeyen Karakter';
        this.profilePath = data.profile_path || null;
        this.order = data.order || 999;
        this.gender = data.gender || 0;
        this.knownForDepartment = data.known_for_department || 'Acting';
        this.popularity = data.popularity || 0;
        this.creditId = data.credit_id || null;
        this.adult = data.adult || false;
        this.originalName = data.original_name || this.name;
        this.castId = data.cast_id || null;
        
        // Ek bilgiler (detay sayfası için)
        this.biography = data.biography || null;
        this.birthday = data.birthday || null;
        this.placeOfBirth = data.place_of_birth || null;
        this.deathday = data.deathday || null;
        this.imdbId = data.imdb_id || null;
        this.homepage = data.homepage || null;
    }
    
    // Profil fotoğrafı URL'si
    getProfileUrl(size = 'medium') {
        if (!this.profilePath) {
            return 'images/no-avatar.png';
        }
        
        const sizes = Constants.IMAGE_SIZES.PROFILE;
        const sizeKey = size.toUpperCase();
        const imageSize = sizes[sizeKey] || sizes.MEDIUM;
        
        return `${Constants.IMAGE_BASE_URL}/${imageSize}${this.profilePath}`;
    }
    
    // Cinsiyet metni
    getGenderText() {
        const genders = {
            0: 'Bilinmiyor',
            1: 'Kadın',
            2: 'Erkek',
            3: 'Diğer'
        };
        return genders[this.gender] || 'Bilinmiyor';
    }
    
    // Doğum tarihi formatlı
    getFormattedBirthday() {
        if (!this.birthday) return 'Bilinmiyor';
        return Helpers.formatDate(this.birthday, 'long');
    }
    
    // Yaş hesaplama
    getAge() {
        if (!this.birthday) return null;
        
        const birthDate = new Date(this.birthday);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Biyografi kısa
    getShortBiography(maxLength = 200) {
        if (!this.biography) return 'Biyografi bulunamadı.';
        return Helpers.truncateText(this.biography, maxLength);
    }
    
    // IMDB URL'si
    getImdbUrl() {
        if (!this.imdbId) return null;
        return `https://www.imdb.com/name/${this.imdbId}`;
    }
    
    // Kart verisi
    toCardData() {
        return {
            id: this.id,
            name: this.name,
            character: this.character,
            profile: this.getProfileUrl('medium'),
            department: this.knownForDepartment,
            gender: this.getGenderText()
        };
    }
    
    // Detay verisi
    toDetailData() {
        return {
            id: this.id,
            name: this.name,
            originalName: this.originalName,
            character: this.character,
            profile: this.getProfileUrl('large'),
            biography: this.biography,
            shortBiography: this.getShortBiography(300),
            birthday: this.getFormattedBirthday(),
            age: this.getAge(),
            placeOfBirth: this.placeOfBirth,
            gender: this.getGenderText(),
            knownForDepartment: this.knownForDepartment,
            popularity: this.popularity,
            imdbUrl: this.getImdbUrl(),
            homepage: this.homepage
        };
    }
    
    // JSON'a çevir
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            character: this.character,
            profilePath: this.profilePath,
            gender: this.gender,
            knownForDepartment: this.knownForDepartment
        };
    }
}

// Global erişim için
window.CastMember = CastMember;