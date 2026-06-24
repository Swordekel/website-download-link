# ===== Tahap 1: build frontend =====
FROM node:20-slim AS build
WORKDIR /app

# Install dependensi (termasuk devDependencies untuk proses build Vite)
COPY package*.json ./
RUN npm ci

# Build frontend → menghasilkan folder dist/
COPY . .
RUN npm run build

# ===== Tahap 2: runtime (backend + yt-dlp + ffmpeg) =====
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install ffmpeg (untuk muxing video & ekstraksi audio) dan yt-dlp (binary standalone resmi)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates curl \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && apt-get purge -y curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Hanya install dependensi runtime (tanpa devDependencies)
COPY package*.json ./
RUN npm ci --omit=dev

# Salin backend + frontend hasil build
COPY server ./server
COPY --from=build /app/dist ./dist

# Render/Cloud Run akan mengeset PORT secara otomatis
EXPOSE 5174
CMD ["node", "server/index.js"]
