import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroDownloader from './components/HeroDownloader';
import ExtractorPanel from './components/ExtractorPanel';
import DownloadQueue from './components/DownloadQueue';
import DownloadHistory from './components/DownloadHistory';
import FeatureGrid from './components/FeatureGrid';
import FaqSection from './components/FaqSection';
import SupportedPlatforms from './components/SupportedPlatforms';
import Footer from './components/Footer';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('downloader');
  const [videoData, setVideoData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inisialisasi tema light/dark mode
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('aerograb_theme');
    return savedTheme || 'dark'; // default menggunakan dark mode
  });

  // Sinkronisasi class body dengan tema terpilih
  useEffect(() => {
    localStorage.setItem('aerograb_theme', theme);
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load history dari LocalStorage saat startup
  useEffect(() => {
    const savedHistory = localStorage.getItem('aerograb_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Gagal memuat riwayat:', e);
      }
    }
  }, []);

  // Menyimpan riwayat ke LocalStorage setiap ada perubahan
  const saveHistoryToStorage = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('aerograb_history', JSON.stringify(newHistory));
  };

  // Tambah entri ke riwayat (functional update agar tidak memakai state usang)
  const addToHistory = (historyItem) => {
    setHistory((prev) => {
      const updated = [historyItem, ...prev];
      localStorage.setItem('aerograb_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Analisis link video NYATA melalui backend yt-dlp
  const handleAnalyze = async (url) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const message = await res.text().catch(() => '');
        throw new Error(message || `Gagal menganalisis (HTTP ${res.status})`);
      }
      const data = await res.json();
      setVideoData(data);
    } catch (e) {
      setError(
        `Gagal menganalisis tautan: ${e.message}. Pastikan tautan valid, publik, dan didukung yt-dlp.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Util unduhan ----------

  const helperUpdateQueueItem = (id, patch) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const triggerBrowserDownload = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  // Membaca nama berkas dari header Content-Disposition (mendukung unicode RFC5987)
  const parseFilename = (disposition) => {
    if (!disposition) return null;
    const star = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (star) {
      try { return decodeURIComponent(star[1]); } catch { /* noop */ }
    }
    const plain = disposition.match(/filename="?([^";]+)"?/i);
    return plain ? plain[1] : null;
  };

  const buildFilename = (item) => {
    const safe = (item.videoTitle || 'AeroGrab').replace(/[/\\?%*:|"<>]/g, '').trim() || 'AeroGrab';
    const label = item.resolution || item.bitrate || '';
    const ext = item.type === 'audio' ? 'mp3' : 'mp4';
    return `${safe} [AeroGrab ${label}].${ext}`;
  };

  const buildDownloadUrl = (item) => {
    const params = new URLSearchParams({
      url: item.videoUrl,
      type: item.type,
      title: item.videoTitle || 'AeroGrab',
      label: item.resolution || item.bitrate || '',
    });
    if (item.type === 'audio') params.set('abr', String(item.abr ?? 'best'));
    else params.set('height', String(item.height ?? 1080));
    return `/api/download?${params.toString()}`;
  };

  // Mengeksekusi unduhan nyata dengan progres byte sebenarnya dari server
  const startRealDownload = async (item) => {
    try {
      helperUpdateQueueItem(item.id, {
        status: 'processing',
        progress: 0,
        speed: 'Memproses di server...',
        eta: 'Mohon tunggu',
      });

      const res = await fetch(buildDownloadUrl(item), { signal: item.controller.signal });
      if (!res.ok) {
        const message = await res.text().catch(() => '');
        throw new Error(message || `Gagal mengunduh (HTTP ${res.status})`);
      }

      const total = parseInt(res.headers.get('Content-Length') || '0', 10);
      const filename = parseFilename(res.headers.get('Content-Disposition')) || buildFilename(item);
      const contentType = res.headers.get('Content-Type') || 'application/octet-stream';

      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      const startT = performance.now();

      helperUpdateQueueItem(item.id, { status: 'downloading' });

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;

        const elapsed = Math.max((performance.now() - startT) / 1000, 0.001);
        const speed = received / elapsed; // byte/detik
        const progress = total
          ? Math.min(99, (received / total) * 100)
          : Math.min(99, (received / (1024 * 1024)) * 12);
        const etaSec = total && speed ? Math.max(0, (total - received) / speed) : null;

        helperUpdateQueueItem(item.id, {
          progress,
          speed: `${(speed / 1024 / 1024).toFixed(1)} MB/s`,
          eta: etaSec != null ? `${Math.ceil(etaSec)}s` : '—',
        });
      }

      const blob = new Blob(chunks, { type: contentType });
      triggerBrowserDownload(blob, filename);
      onDownloadSuccess(item, blob, filename);
    } catch (err) {
      if (err.name === 'AbortError') return; // dibatalkan pengguna; item sudah dihapus
      console.error('Unduhan gagal:', err);
      helperUpdateQueueItem(item.id, {
        status: 'failed',
        speed: 'Gagal',
        eta: '-',
        errorMessage: err.message || 'Berkas gagal diunduh.',
      });
    }
  };

  const onDownloadSuccess = (item, blob, filename) => {
    helperUpdateQueueItem(item.id, {
      status: 'completed',
      progress: 100,
      speed: '0 KB/s',
      eta: 'Selesai',
      errorMessage: null,
      blob,
      filename,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5a2b', '#b8860b', '#d2b48c', '#10b981'],
    });

    addToHistory({
      id: item.id,
      videoTitle: item.videoTitle,
      videoAuthor: item.videoAuthor,
      platform: item.platform,
      thumbnail: item.thumbnail,
      resolution: item.resolution,
      bitrate: item.bitrate,
      size: item.size,
      type: item.type,
      videoUrl: item.videoUrl,
      height: item.height,
      abr: item.abr,
      timestamp: Date.now(),
    });

    // Hapus otomatis dari queue setelah 5 detik
    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
    }, 5000);
  };

  // Memulai proses unduhan
  const handleDownload = (formatDetails) => {
    const queueId = Date.now() + Math.random();
    const controller = new AbortController();
    const newQueueItem = {
      id: queueId,
      videoTitle: formatDetails.videoTitle,
      videoAuthor: formatDetails.videoAuthor,
      platform: formatDetails.platform,
      thumbnail: formatDetails.thumbnail,
      resolution: formatDetails.resolution,
      bitrate: formatDetails.bitrate,
      size: formatDetails.size,
      type: formatDetails.type,
      videoUrl: formatDetails.videoUrl,
      height: formatDetails.height,
      abr: formatDetails.abr,
      progress: 0,
      speed: 'Menghubungkan...',
      eta: '-',
      status: 'connecting',
      controller,
    };

    setQueue((prev) => [...prev, newQueueItem]);
    setActiveTab('downloader');
    startRealDownload(newQueueItem);
  };

  // Mencoba kembali unduhan yang gagal
  const handleRetrySave = (item) => {
    const controller = new AbortController();
    const fresh = { ...item, controller, blob: undefined };
    helperUpdateQueueItem(item.id, {
      status: 'connecting',
      progress: 0,
      errorMessage: null,
      speed: 'Menghubungkan...',
      eta: '-',
      controller,
    });
    startRealDownload(fresh);
  };

  // Simpan/unduh ulang manual (tombol "Simpan" pada item selesai atau dari riwayat)
  const handleManualSave = (item) => {
    // Jika blob masih tersimpan (item selesai di queue), simpan langsung tanpa unduh ulang
    if (item.blob) {
      triggerBrowserDownload(item.blob, item.filename || buildFilename(item));
      return;
    }
    // Item riwayat: unduh ulang nyata melalui backend
    const queueId = Date.now() + Math.random();
    const controller = new AbortController();
    const dlItem = {
      ...item,
      id: queueId,
      progress: 0,
      speed: 'Menghubungkan...',
      eta: '-',
      status: 'connecting',
      controller,
      blob: undefined,
    };
    setQueue((prev) => [...prev, dlItem]);
    setActiveTab('downloader');
    startRealDownload(dlItem);
  };

  // Membatalkan unduhan yang sedang berjalan
  const handleCancelDownload = (queueId) => {
    const itemToCancel = queue.find((q) => q.id === queueId);
    if (itemToCancel && itemToCancel.controller) {
      try { itemToCancel.controller.abort(); } catch { /* noop */ }
    }
    setQueue((prev) => prev.filter((q) => q.id !== queueId));
  };

  // Menghapus satu item riwayat
  const handleDeleteHistoryItem = (historyId) => {
    const updatedHistory = history.filter((item) => item.id !== historyId);
    saveHistoryToStorage(updatedHistory);
  };

  // Menghapus semua riwayat
  const handleClearHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat unduhan?')) {
      saveHistoryToStorage([]);
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        queueCount={queue.filter((q) => q.status !== 'completed').length}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area dengan Animasi Framer Motion */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {activeTab === 'downloader' && (
              <div className="container downloader-container">
                {/* Form Input Downloader */}
                <HeroDownloader onAnalyze={handleAnalyze} isLoading={isLoading} error={error} />

                {/* Extractor Resolusi Panel */}
                <ExtractorPanel videoData={videoData} onDownload={handleDownload} />

                {/* Queue Antrean Download */}
                <DownloadQueue
                  queue={queue}
                  onCancel={handleCancelDownload}
                  onSaveFile={handleManualSave}
                  onRetry={handleRetrySave}
                />

                {/* Grid Fitur Pendukung */}
                <FeatureGrid />
              </div>
            )}

            {activeTab === 'platforms' && <SupportedPlatforms />}

            {activeTab === 'faq' && <FaqSection />}

            {activeTab === 'history' && (
              <DownloadHistory
                history={history}
                onDeleteItem={handleDeleteHistoryItem}
                onClearAll={handleClearHistory}
                onSaveFile={handleManualSave}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
