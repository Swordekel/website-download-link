# AeroGrab — Video & Audio Downloader

Pengunduh video/audio dari YouTube, TikTok, Facebook, dan Instagram. Frontend
React + Vite, backend Node/Express yang memakai **yt-dlp** + **ffmpeg** untuk
mengekstrak dan mengunduh berkas media asli.

## Menjalankan secara lokal

Prasyarat: **Node.js 18+**, serta **yt-dlp** dan **ffmpeg** terpasang dan ada di PATH.

```bash
npm install
npm run dev
```

`npm run dev` menyalakan backend (port 5174) dan frontend (port 5173) sekaligus.
Buka **http://localhost:5173**.

- `npm run build` — build frontend produksi ke `dist/`
- `npm start` — jalankan backend saja (mode produksi: menyajikan `dist/` + API)

## Deploy gratis (Docker)

Repo ini sudah berisi `Dockerfile` yang membungkus Node + yt-dlp + ffmpeg,
mem-build frontend, lalu menyajikan UI dan API dari **satu service**. Bisa
dijalankan di host mana pun yang mendukung Docker.

### Render (gratis, tanpa kartu kredit) — direkomendasikan

1. Push repo ini ke GitHub (sudah).
2. Buka [render.com](https://render.com) → **New** → **Blueprint** → hubungkan
   repo ini. Render membaca `render.yaml` dan membuat web service Docker gratis.
   (Alternatif manual: **New → Web Service → Docker**, pilih plan **Free**.)
3. Tunggu build selesai, lalu buka URL `*.onrender.com` yang diberikan.

Catatan plan gratis Render: service "tidur" setelah ~15 menit menganggur, jadi
permintaan pertama bisa lambat (~1 menit) saat bangun. RAM 512MB cukup untuk
muxing, tetapi resolusi sangat tinggi (4K) bisa lambat.

### Host gratis lain

Karena memakai Docker, setup yang sama jalan di **Koyeb**, **Fly.io**, atau
**Google Cloud Run** (free tier). Cukup arahkan ke `Dockerfile`.

### Menjalankan image Docker secara lokal

```bash
docker build -t aerograb .
docker run -p 5174:5174 aerograb
# buka http://localhost:5174
```

## ⚠️ Penting: pembatasan di server cloud

yt-dlp bekerja paling andal dari **IP rumahan** (seperti komputer Anda). Banyak
platform — terutama **YouTube** — sering **memblokir IP datacenter/cloud** dengan
pesan seperti *"Sign in to confirm you're not a bot"*. Akibatnya, di hosting
gratis, unduhan YouTube bisa gagal walau berjalan mulus secara lokal.

Solusi (di luar cakupan gratis sederhana): menyuplai **cookies** akun ke yt-dlp
(`--cookies`) atau memakai **proxy** berbasis IP rumahan. Platform selain
YouTube umumnya lebih toleran.

## Catatan hukum

Gunakan hanya untuk konten yang Anda miliki haknya. Mengunduh dari sebagian
platform dapat melanggar Ketentuan Layanan mereka.
