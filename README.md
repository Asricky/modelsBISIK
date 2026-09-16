# BISIK – Sistem Cerdas Multimodal untuk Pembelajaran Inklusif

## Menjalankan repo ini

Isi project disinkronkan dari [Fansaa/bisik-project](https://github.com/Fansaa/bisik-project)
commit `6c4735163a1114cc48f1986cf1231d94279bab65`, dengan perbaikan instalasi,
startup produksi, pemeriksaan TypeScript, dan konfigurasi layanan untuk repo ini.

Gunakan Node.js 22 dan pnpm 10:

```sh
npx --yes pnpm@10 install --frozen-lockfile
```

Salin `.env.example` ke `.env.local`, lalu isi:

- `GEMINI_API_KEY`: API key Gemini di server, tidak dikirim ke browser.
- `GEMINI_MODEL`: nama model Gemini yang tersedia pada akun API kamu.
- `UNSPLASH_ACCESS_KEY`: access key untuk pencarian gambar.
- `NEXT_PUBLIC_TTS_URL`: URL lengkap endpoint `/tts` milikmu. Layanan harus menerima
  POST JSON `{ "text": "...", "language": "id" }` dan mengembalikan audio.
  Gunakan HTTPS saat deployment dan izinkan origin website melalui CORS.
  Implementasi server TTS tidak disertakan dalam repo sumber.

```sh
npm run dev
```

Buka `http://localhost:3000`. Untuk pemeriksaan dan produksi:

```sh
npm run typecheck
npm run build
npm start
```

Halaman `/`, `/about`, dan `/bisik` dapat dibuka tanpa API key. Analisis gambar,
pencarian gambar, dan audio memerlukan layanan di atas. Akses kamera dan mikrofon
memerlukan izin browser serta HTTPS atau localhost. Build memerlukan akses Google Fonts.
File `.htaccess` berasal dari konfigurasi hosting sumber; sesuaikan path Passenger
jika memakai cPanel/CloudLinux pada akun hosting berbeda.

---

> **Catatan**
> Repositori ini berfungsi sebagai **arsip dan referensi pengembangan**.
> Implementasi pada repositori ini **tidak sepenuhnya sama** dengan konsep awal BISIK.
> Kode dan struktur yang ada merupakan hasil iterasi teknis dan eksplorasi implementasi.

---

## 🌱 Gambaran Umum

**BISIK (Bantu Interaksi Siswa Inklusif dengan Komunikasi)** adalah konsep sistem pembelajaran cerdas berbasis **multimodal (suara dan gambar)** yang dirancang untuk mendukung proses belajar siswa berkebutuhan khusus (ABK), khususnya di **SLB Negeri Djojonegoro, Kabupaten Temanggung, Jawa Tengah**, yang memiliki keterbatasan sumber daya dan infrastruktur teknologi.

Konsep utama BISIK dapat dilihat pada website resmi:
👉 https://www.bisik-ai.com

Sistem ini menekankan pada:
- Interaksi dua arah antara siswa dan sistem
- Aksesibilitas tinggi untuk berbagai hambatan sensorik dan kognitif
- Pendekatan teknologi ringan (low-resource approach)
- Fleksibilitas penggunaan pada lingkungan dengan keterbatasan infrastruktur

---

## 🎯 Latar Belakang

Pembelajaran inklusif di Indonesia masih menghadapi tantangan besar, terutama bagi siswa ABK di sekolah luar biasa yang berada di wilayah non-perkotaan. Media pembelajaran yang dominan berbasis teks atau visual statis sering kali tidak efektif bagi siswa dengan:
- Hambatan penglihatan
- Hambatan bicara atau pendengaran
- Disleksia atau hambatan kognitif ringan

Di **SLB Negeri Djojonegoro Temanggung**, keterbatasan perangkat, konektivitas, dan media ajar interaktif mendorong perlunya solusi pembelajaran yang lebih adaptif, empatik, dan mudah dioperasikan oleh guru.

---

## 💡 Konsep BISIK

Secara konseptual, BISIK dirancang sebagai sistem pembelajaran **multimodal**, di mana:

- Siswa dapat memberikan **input berupa suara atau gambar**
- Sistem memberikan **output berupa teks, gambar, dan/atau audio**
- Modalitas interaksi dapat disesuaikan dengan kebutuhan siswa

Pendekatan ini memungkinkan pengalaman belajar yang lebih inklusif dan partisipatif, terutama bagi siswa dengan keterbatasan sensorik atau kognitif.

---

## 🧩 Implementasi pada Repositori Ini

Penting untuk dicatat bahwa:

- Repositori ini **tidak melatih atau membangun model AI sendiri**
- Seluruh kapabilitas analisis cerdas diperoleh melalui **integrasi API eksternal**
- Implementasi di repo ini adalah **hasil eksplorasi teknis**, bukan produk final BISIK

Repo ini berfungsi sebagai:
- Arsip ide dan implementasi
- Referensi teknis
- Dokumentasi evolusi konsep ke bentuk implementasi berbasis web

---

## 🔄 Alur Sistem (Implementasi)

Alur utama sistem pada repositori ini adalah sebagai berikut:

1. **Input Gambar**
   - Pengguna mengunggah atau memilih gambar

2. **Analisis Gambar**
   - Gambar dianalisis menggunakan **Google Gemini API**
   - Sistem menghasilkan deskripsi tekstual dari gambar

3. **Pengambilan Gambar Pendukung**
   - Deskripsi teks digunakan sebagai query ke **Unsplash API**
   - Sistem mengambil gambar ilustratif yang relevan

4. **Output Audio**
   - Deskripsi teks dikonversi menjadi suara menggunakan **Google Text-to-Speech (gTTS)**

Alur ini merepresentasikan pendekatan multimodal tanpa pelatihan model AI lokal.

---

## 🛠️ Teknologi yang Digunakan

Repositori ini menggunakan pendekatan **API-based AI integration**, bukan model training.

Teknologi utama:
- **Google Gemini API**
  - Analisis gambar
  - Pembuatan deskripsi teks dari visual

- **Unsplash API**
  - Pengambilan gambar berdasarkan deskripsi teks
  - Penyedia ilustrasi visual kontekstual

- **Google Text-to-Speech (gTTS)**
  - Konversi teks menjadi audio narasi

- **Web Framework**: Next.js
- **Frontend**: React, TypeScript
- **Styling**: CSS / PostCSS

Pendekatan ini dipilih untuk:
- Mempercepat pengembangan prototipe
- Menghindari kompleksitas pelatihan dan deployment model
- Memanfaatkan layanan AI yang sudah matang dan stabil

---

## 🌍 Dampak yang Diharapkan (Konseptual)

Berdasarkan konsep awal BISIK:
- Meningkatkan partisipasi aktif siswa ABK
- Menyediakan fleksibilitas gaya belajar (audio, visual, multimodal)
- Membantu guru menyediakan media ajar adaptif tanpa kompleksitas teknis
- Mengurangi kesenjangan akses teknologi pembelajaran di sekolah luar biasa

---

## 📌 Status Proyek

- ✅ Konsep: berbasis riset kebutuhan lapangan
- ⚠️ Implementasi di repo ini: **eksperimental**
- 🚧 Pengembangan lanjutan: bergantung pada kebutuhan riset dan implementasi berikutnya

---

## 📎 Referensi

- Website resmi BISIK: https://www.bisik-ai.com
- Dokumen perancangan dan proposal BISIK
- Studi kasus: SLB Negeri Djojonegoro, Temanggung

---

## ✨ Penutup

Repositori ini disimpan sebagai **jejak pengembangan dan referensi teknis** dari konsep BISIK.
Perbedaan antara konsep awal dan implementasi merupakan bagian dari proses iteratif dalam
pengembangan sistem cerdas yang kontekstual dan berkelanjutan.
