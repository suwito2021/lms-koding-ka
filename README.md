# AI Coding LMS - Platform Pembelajaran Koding & AI

Platform pembelajaran interaktif untuk menguasai keterampilan koding dan kecerdasan artificial.

## 🚀 Fitur

- ✅ Sistem login dan registrasi
- ✅ Dashboard admin dengan statistik pengguna
- ✅ Modul pembelajaran interaktif
- ✅ Tracking progress pembelajaran
- ✅ Sumber belajar tambahan untuk guru
- ✅ Responsive design dengan Tailwind CSS

## 📁 Struktur Proyek

```
/
├── Index.html          # Halaman utama aplikasi
├── css/
│   └── style.css       # Styling kustom
├── js/
│   └── script.js       # Logika aplikasi
├── assets/             # Folder untuk asset tambahan
├── vercel.json         # Konfigurasi Vercel
└── README.md           # Dokumentasi ini
```

## 🔧 Teknologi yang Digunakan

- **HTML5** - Struktur aplikasi
- **CSS3 + Tailwind CSS** - Styling dan desain
- **JavaScript (ES6+)** - Interaktivitas dan logika
- **Google Sheets API** - Penyimpanan data pengguna
- **Vercel** - Platform deployment

## 🚀 Deployment ke Vercel

### Langkah 1: Persiapan
1. Pastikan semua file sudah di-commit ke Git repository
2. Buat akun di [Vercel](https://vercel.com) jika belum punya

### Langkah 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy proyek
vercel

# Untuk production deployment
vercel --prod
```

### Langkah 3: Deploy via GitHub
1. Push kode ke repository GitHub
2. Connect repository ke Vercel:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik "New Project"
   - Import repository GitHub Anda
   - Konfigurasi build settings (default sudah cukup)
   - Deploy!

### Langkah 4: Konfigurasi Environment Variables (jika diperlukan)
Jika ada environment variables yang dibutuhkan, tambahkan di Vercel dashboard:
- Buka project settings
- Environment Variables
- Tambahkan variables yang diperlukan

## 🔍 Troubleshooting

### Masalah Login
Jika login tidak berfungsi:
1. Periksa konsol browser untuk error messages
2. Pastikan Google Sheet dapat diakses secara publik
3. Verifikasi URL Google Sheets API
4. Periksa nama kolom di spreadsheet

### CORS Issues
Jika mengalami masalah CORS saat development lokal:
- Gunakan browser dengan CORS disabled
- Deploy ke Vercel untuk testing production
- Gunakan CORS proxy untuk development

## 📊 Data Pengguna

Data pengguna disimpan di Google Sheets dengan kolom:
- `username` - Nama pengguna
- `nama_lengkap` - Nama lengkap
- `email` - Alamat email
- `nama_sekolah` - Nama sekolah
- `peran` - Role (admin/user)

## 🎯 Modul Pembelajaran

Aplikasi menyediakan 5 modul pembelajaran:
1. **Modul 1**: Mata Pelajaran Koding dan KA
2. **Modul 2**: Literasi Algoritma dan Konten Digital
3. **Modul 3**: Etika dan Resiko KA
4. **Modul 4**: Komunikasi Melalui Tools KA
5. **Modul 5**: Pedagogik Koding dan KA

## 📞 Dukungan

Untuk pertanyaan atau dukungan teknis, silakan hubungi tim development.

---

**Dikembangkan dengan ❤️ untuk pendidikan koding dan AI di Indonesia**