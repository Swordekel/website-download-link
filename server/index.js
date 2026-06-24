// Backend AeroGrab: mengekstrak & mengunduh video asli memakai yt-dlp + ffmpeg.
// Menggantikan data tiruan di frontend dengan ekstraksi nyata.
import express from 'express';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const app = express();
const PORT = process.env.AEROGRAB_PORT || 5174;
const YTDLP = process.env.YTDLP_PATH || 'yt-dlp';

// ---------- Util ----------

const isValidUrl = (u) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const humanSize = (bytes) => {
  if (!bytes || bytes <= 0) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

// Estimasi ukuran dari bitrate (kbps) x durasi (detik)
const estimateSize = (kbps, durSec) => (kbps && durSec ? Math.round(kbps * 125 * durSec) : 0);

const formatDuration = (sec) => {
  if (!sec && sec !== 0) return '—';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
};

const platformFromExtractor = (key = '') => {
  const k = key.toLowerCase();
  if (k.includes('youtube')) return 'youtube';
  if (k.includes('tiktok')) return 'tiktok';
  if (k.includes('facebook')) return 'facebook';
  if (k.includes('instagram')) return 'instagram';
  return 'other';
};

const sanitizeFilename = (name) =>
  (name || 'AeroGrab').replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, ' ').trim() || 'AeroGrab';

// Header Content-Disposition yang aman untuk nama berkas unicode (emoji dll.)
const contentDisposition = (filename) => {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
};

const rmDir = (dir) => fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});

// Menjalankan yt-dlp dan mengumpulkan stdout (untuk -J / dump JSON)
const runYtdlpJson = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(YTDLP, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => reject(new Error(`Gagal menjalankan yt-dlp: ${err.message}`)));
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim().split('\n').slice(-1)[0] || `yt-dlp keluar dengan kode ${code}`));
        return;
      }
      resolve(stdout);
    });
  });

// ---------- Membangun daftar format dari JSON yt-dlp ----------

const buildFormats = (info) => {
  const all = Array.isArray(info.formats) ? info.formats : [];
  const dur = info.duration || 0;

  // Format audio-only (untuk estimasi ukuran audio terbaik)
  const audioOnly = all.filter(
    (f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
  );
  const bestAudio = [...audioOnly].sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
  const bestAudioSize = bestAudio
    ? bestAudio.filesize || bestAudio.filesize_approx || estimateSize(bestAudio.abr, dur)
    : 0;

  // ----- Video -----
  const videoFormats = all.filter((f) => f.vcodec && f.vcodec !== 'none' && f.height);
  const availHeights = [...new Set(videoFormats.map((f) => f.height))];
  const standardHeights = [2160, 1440, 1080, 720, 480, 360, 240];

  const tag = (h) =>
    h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 1080 ? 'Full HD' : h >= 720 ? 'HD' : 'SD';

  const video = standardHeights
    .filter((h) => availHeights.includes(h))
    .map((h) => {
      const candidates = videoFormats.filter((f) => f.height === h);
      // Pilih representasi: utamakan mp4, lalu tbr tertinggi
      candidates.sort((a, b) => {
        const am = a.ext === 'mp4' ? 1 : 0;
        const bm = b.ext === 'mp4' ? 1 : 0;
        if (bm !== am) return bm - am;
        return (b.tbr || 0) - (a.tbr || 0);
      });
      const rep = candidates[0];
      const isProgressive = rep.acodec && rep.acodec !== 'none';
      const vidSize =
        rep.filesize || rep.filesize_approx || estimateSize(rep.tbr, dur);
      const total = isProgressive ? vidSize : vidSize + bestAudioSize;
      return {
        resolution: `${h}p (${tag(h)})`,
        quality: 'MP4',
        size: humanSize(total),
        type: 'video',
        height: h,
      };
    });

  // Fallback jika tidak ada height terdeteksi (sebagian extractor)
  if (video.length === 0) {
    video.push({ resolution: 'Kualitas Terbaik', quality: 'MP4', size: '—', type: 'video', height: 1080 });
  }

  // ----- Audio -----
  const seen = new Set();
  const audio = [...audioOnly]
    .filter((f) => f.abr)
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))
    .map((f) => Math.round(f.abr))
    .filter((abr) => {
      if (seen.has(abr)) return false;
      seen.add(abr);
      return true;
    })
    .slice(0, 3)
    .map((abr) => ({
      bitrate: `${abr} kbps`,
      quality: 'MP3',
      size: humanSize(estimateSize(abr, dur)),
      type: 'audio',
      abr,
    }));

  if (audio.length === 0) {
    audio.push({ bitrate: 'Audio Terbaik', quality: 'MP3', size: humanSize(bestAudioSize), type: 'audio', abr: 'best' });
  }

  return { video, audio };
};

// ---------- Endpoint: info ----------

app.get('/api/info', async (req, res) => {
  const { url } = req.query;
  if (!isValidUrl(url)) {
    res.status(400).send('URL tidak valid. Tempel tautan video yang benar (http/https).');
    return;
  }
  try {
    const out = await runYtdlpJson([
      '-J',
      '--no-playlist',
      '--no-warnings',
      '--no-call-home',
      url,
    ]);
    const info = JSON.parse(out);
    res.json({
      title: info.title || 'Tanpa Judul',
      author: info.uploader || info.channel || info.uploader_id || 'Tidak diketahui',
      duration: formatDuration(info.duration),
      platform: platformFromExtractor(info.extractor_key || info.extractor),
      thumbnail: info.thumbnail || '',
      url,
      formats: buildFormats(info),
    });
  } catch (err) {
    res.status(502).send(err.message || 'Gagal mengekstrak informasi video.');
  }
});

// ---------- Endpoint: download ----------

app.get('/api/download', async (req, res) => {
  const { url, type } = req.query;
  if (!isValidUrl(url)) {
    res.status(400).send('URL tidak valid.');
    return;
  }

  const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'aerograb-'));
  const outTpl = path.join(tmp, 'out.%(ext)s');
  const common = ['--no-playlist', '--no-warnings', '--no-call-home', '-o', outTpl];

  let args;
  if (type === 'audio') {
    args = ['-f', 'bestaudio/best', '-x', '--audio-format', 'mp3'];
    const abr = req.query.abr;
    if (abr && abr !== 'best') args.push('--audio-quality', `${parseInt(abr, 10)}K`);
    args = [...args, ...common, url];
  } else {
    const h = parseInt(req.query.height, 10) || 1080;
    const selector = `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
    args = ['-f', selector, '--merge-output-format', 'mp4', ...common, url];
  }

  const child = spawn(YTDLP, args, { windowsHide: true });
  let stderr = '';
  child.stderr.on('data', (d) => (stderr += d));

  // Bersihkan jika klien membatalkan (menutup koneksi)
  res.on('close', () => {
    if (!res.writableEnded) {
      try { child.kill(); } catch { /* noop */ }
      rmDir(tmp);
    }
  });

  child.on('error', (err) => {
    rmDir(tmp);
    if (!res.headersSent) res.status(500).send(`Gagal menjalankan yt-dlp: ${err.message}`);
  });

  child.on('close', async (code) => {
    if (code !== 0) {
      rmDir(tmp);
      if (!res.headersSent) {
        res.status(502).send(stderr.trim().split('\n').slice(-1)[0] || 'Proses unduhan gagal.');
      }
      return;
    }
    try {
      const files = await fs.promises.readdir(tmp);
      const outFile = files.find((f) => f.startsWith('out.'));
      if (!outFile) {
        rmDir(tmp);
        if (!res.headersSent) res.status(500).send('Berkas hasil tidak ditemukan.');
        return;
      }
      const filePath = path.join(tmp, outFile);
      const stat = await fs.promises.stat(filePath);
      const ext = path.extname(outFile).slice(1).toLowerCase();
      const mime =
        ext === 'mp3' ? 'audio/mpeg'
        : ext === 'm4a' ? 'audio/mp4'
        : ext === 'webm' ? 'video/webm'
        : 'video/mp4';

      const safe = sanitizeFilename(req.query.title);
      const label = req.query.label ? ` [AeroGrab ${req.query.label}]` : ' [AeroGrab]';
      const filename = `${safe}${label}.${ext}`;

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', contentDisposition(filename));

      const stream = fs.createReadStream(filePath);
      stream.on('error', () => { rmDir(tmp); });
      stream.on('close', () => rmDir(tmp));
      stream.pipe(res);
    } catch (err) {
      rmDir(tmp);
      if (!res.headersSent) res.status(500).send(`Kesalahan server: ${err.message}`);
    }
  });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`AeroGrab backend berjalan di http://localhost:${PORT}`);
});
