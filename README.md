# 🎬 Movie Finder App

Modern ve kullanıcı dostu bir film arama uygulaması. TMDB (The Movie Database) API'sini kullanarak filmler hakkında detaylı bilgi sunar.

## ✨ Özellikler

- 🔍 **Gelişmiş Film Arama**: Gerçek zamanlı arama sonuçları
- 🎭 **Detaylı Film Bilgileri**: Oyuncu kadrosu, fragmanlar, puanlar ve daha fazlası
- 🌓 **Tema Desteği**: Açık/Koyu tema seçenekleri
- 📱 **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- ⭐ **Favori Listesi**: Beğendiğiniz filmleri kaydedin
- 🎥 **Video Fragmanlar**: YouTube entegrasyonu ile fragman izleme
- 💾 **Yerel Depolama**: Favorileriniz ve tercihleriniz güvenle saklanır

## 🚀 Kurulum

### Gereksinimler

- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)
- TMDB API Key ([buradan alabilirsiniz](https://www.themoviedb.org/settings/api))

### Adımlar

1. Projeyi klonlayın veya indirin:
```bash
git clone https://github.com/kullanici-adi/movie-finder-app.git
cd movie-finder-app
```

2. `scripts/utils/constants.js` dosyasını açın ve API anahtarınızı ekleyin:
```javascript
export const API_KEY = 'YOUR_TMDB_API_KEY_HERE';
```

3. Projeyi bir yerel sunucuda çalıştırın:
```bash
# Python ile
python -m http.server 8000

# Node.js ile (http-server paketi gerekli)
npx http-server
```

4. Tarayıcınızda açın:
```
http://localhost:8000
```

## 📁 Proje Yapısı

```
movie-finder-app/
├── index.html                 # Ana HTML dosyası
├── styles/                    # Stil dosyaları
│   ├── main.css              # Ana stiller
│   ├── components.css        # Component stilleri
│   ├── responsive.css        # Responsive tasarım
│   └── themes.css            # Tema stilleri
├── scripts/                   # JavaScript dosyaları
│   ├── app.js                # Uygulama giriş noktası
│   ├── services/             # API servisleri
│   │   └── TMDBService.js    # TMDB API entegrasyonu
│   ├── models/               # Veri modelleri
│   │   ├── Movie.js          # Film modeli
│   │   ├── Cast.js           # Oyuncu modeli
│   │   └── Video.js          # Video modeli
│   ├── store/                # State yönetimi
│   │   └── MovieStore.js     # Film veri deposu
│   ├── ui/                   # UI yönetimi
│   │   └── UIManager.js      # Arayüz yöneticisi
│   ├── managers/             # İş mantığı
│   │   └── SearchManager.js  # Arama yöneticisi
│   └── utils/                # Yardımcı araçlar
│       ├── constants.js      # Sabit değerler
│       ├── helpers.js        # Yardımcı fonksiyonlar
│       └── LocalStorageManager.js # Yerel depolama
└── README.md                 # Bu dosya
```

## 🎨 Özellik Detayları

### Film Arama
- Gerçek zamanlı arama önerileri
- Popüler filmler listesi
- Gelişmiş filtreleme seçenekleri
- Sayfalama desteği

### Film Detayları
- Yüksek çözünürlüklü posterler
- Oyuncu kadrosu ve ekip bilgileri
- Kullanıcı puanları ve yorumları
- Benzer film önerileri
- Fragman videoları

### Kullanıcı Deneyimi
- Hızlı ve akıcı animasyonlar
- Sezgisel kullanıcı arayüzü
- Klavye kısayol desteği
- Hata yönetimi ve bilgilendirme

## 🛠️ Kullanılan Teknolojiler

- **Vanilla JavaScript**: Modern ES6+ özellikleri
- **CSS3**: Flexbox, Grid, Custom Properties
- **TMDB API**: Film verileri
- **LocalStorage**: Veri kalıcılığı
- **Responsive Design**: Mobile-first yaklaşım

## 📖 Kullanım

### Film Arama
1. Ana sayfadaki arama çubuğuna film adını yazın
2. Önerilerden birini seçin veya Enter'a basın
3. Sonuçlar arasından istediğiniz filme tıklayın

### Favorilere Ekleme
1. Film detay sayfasında kalp ikonuna tıklayın
2. Favori filmlerinize "Favorilerim" menüsünden erişebilirsiniz

### Tema Değiştirme
- Sağ üst köşedeki ay/güneş ikonuna tıklayarak tema değiştirebilirsiniz

## 🔑 API Anahtarı Alma

1. [TMDB](https://www.themoviedb.org/) sitesine gidin
2. Ücretsiz bir hesap oluşturun
3. Ayarlar > API bölümünden API anahtarınızı alın
4. `constants.js` dosyasına ekleyin

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun

