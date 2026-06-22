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

  // Fungsi pembuat SVG placeholder gradient beresolusi tinggi secara offline dengan tema Brown/Cokelat
  const getMockThumbnail = (plat, title) => {
    let color1 = '';
    let color2 = '';
    
    switch (plat) {
      case 'youtube':
        color1 = '%23b45309'; // Warm Amber/Orange-Brown
        color2 = '%2378350f'; // Dark Brown
        break;
      case 'tiktok':
        color1 = '%23a16207'; // Yellow-Brown
        color2 = '%23451a03'; // Deep Espresso
        break;
      case 'facebook':
        color1 = '%23b45309'; // Bronze-Brown
        color2 = '%23451a03';
        break;
      case 'instagram':
        color1 = '%23d97706'; // Golden Amber
        color2 = '%2378350f';
        break;
      default:
        color1 = '%238b5a2b';
        color2 = '%234a2c11';
    }

    // SVG sederhana dengan gradient platform dan overlay tombol play yang manis
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><rect width="640" height="360" fill="url(%23g)"/><circle cx="320" cy="180" r="42" fill="white" fill-opacity="0.15" stroke="white" stroke-width="2.5"/><polygon points="312,165 312,195 335,180" fill="white"/></svg>`;
  };

  // Simulasi analisis link video
  const handleAnalyze = (url, detectedPlatform) => {
    if (!detectedPlatform) {
      setError(
        'Maaf, tautan tidak dikenali. AeroGrab mendukung link dari YouTube, TikTok, Facebook, dan Instagram yang valid.'
      );
      setVideoData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    // Simulasi respons ekstraksi
    setTimeout(() => {
      let title = '';
      let author = '';
      let duration = '';
      let formats = { video: [], audio: [] };

      if (detectedPlatform === 'youtube') {
        title = 'Relaxing Lofi Hip Hop Beats 2026 🎧 Music to Study, Work or Relax';
        author = 'Lofi Cafe Broadcast';
        duration = '10:45';
        formats = {
          video: [
            { resolution: '1080p (Full HD)', quality: 'High', size: '124.5 MB', type: 'video' },
            { resolution: '720p (HD)', quality: 'Medium', size: '68.2 MB', type: 'video' },
            { resolution: '480p (SD)', quality: 'Low', size: '32.1 MB', type: 'video' },
          ],
          audio: [
            { bitrate: '320 kbps', quality: 'HQ Audio', size: '9.8 MB', type: 'audio' },
            { bitrate: '192 kbps', quality: 'Normal', size: '5.9 MB', type: 'audio' },
          ],
        };
      } else if (detectedPlatform === 'tiktok') {
        title = 'Life is simple when you stop complicating things! 🤫 #comedy #tiktok #lifehacks';
        author = '@khaby.lame';
        duration = '00:45';
        formats = {
          video: [
            { resolution: 'Original (HD)', quality: 'No Watermark', size: '12.4 MB', type: 'video' },
            { resolution: 'Original (SD)', quality: 'With Watermark', size: '11.8 MB', type: 'video' },
          ],
          audio: [
            { bitrate: '320 kbps', quality: 'Original Audio', size: '1.2 MB', type: 'audio' },
          ],
        };
      } else if (detectedPlatform === 'facebook') {
        title = 'Beautiful Norway Landscapes - 10 Magical Places You Must Visit 🇳🇴';
        author = 'Travel Planet';
        duration = '03:20';
        formats = {
          video: [
            { resolution: 'HD 720p', quality: 'High Quality', size: '48.7 MB', type: 'video' },
            { resolution: 'SD 360p', quality: 'Standard', size: '18.4 MB', type: 'video' },
          ],
          audio: [
            { bitrate: '256 kbps', quality: 'HD Audio', size: '3.4 MB', type: 'audio' },
          ],
        };
      } else if (detectedPlatform === 'instagram') {
        title = 'Delicious chocolate volcano cake recipe! 🌋🍫 #baking #desserts #reels';
        author = '@chef.tasty';
        duration = '01:00';
        formats = {
          video: [
            { resolution: 'HD 1080p', quality: 'Original Quality', size: '15.6 MB', type: 'video' },
            { resolution: 'SD 480p', quality: 'Mobile Optimized', size: '6.2 MB', type: 'video' },
          ],
          audio: [
            { bitrate: '320 kbps', quality: 'HQ Audio', size: '1.4 MB', type: 'audio' },
          ],
        };
      }

      setVideoData({
        title,
        author,
        duration,
        platform: detectedPlatform,
        thumbnail: getMockThumbnail(detectedPlatform, title),
        url,
        formats,
      });
      setIsLoading(false);
    }, 1500);
  };

  // Fungsi pengunduh fisik file (menghasilkan Blob palsu berkualitas tinggi)
  const saveFileToDevice = (item) => {
    const formatLabel = item.resolution || item.bitrate || 'MP4';
    const extension = item.type === 'audio' ? 'mp3' : 'mp4';
    const filename = `${item.videoTitle.replace(/[/\\?%*:|"<>]/g, '')} [AeroGrab ${formatLabel}].${extension}`;

    // Buat dummy content text didalam blob. 
    // Browser akan melihat ini sebagai file unduhan yang valid sesuai nama filenya.
    const dummyContent = `AeroGrab Downloader File\nPlatform: ${item.platform}\nTitle: ${item.videoTitle}\nQuality: ${formatLabel}\nThis is a mock multimedia container simulated successfully by AeroGrab.`;
    const mimeType = item.type === 'audio' ? 'audio/mpeg' : 'video/mp4';
    const blob = new Blob([dummyContent], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup URL
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  };

  // Memulai proses download simulasi
  const handleDownload = (formatDetails) => {
    const queueId = Date.now();
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
      progress: 0,
      speed: 'Connecting...',
      eta: 'Menghitung...',
      status: 'connecting',
    };

    setQueue((prevQueue) => [...prevQueue, newQueueItem]);
    setActiveTab('downloader'); // Arahkan ke tab downloader agar antrean terlihat

    // Logika simulasi download menggunakan interval progres
    let currentProgress = 0;
    const isAudio = formatDetails.type === 'audio';
    const sizeNumber = parseFloat(formatDetails.size.split(' ')[0]);

    const interval = setInterval(() => {
      currentProgress += Math.random() * 8 + 4; // Pertambahan progres bervariasi

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        // Update ke completed
        setQueue((prevQueue) =>
          prevQueue.map((qItem) =>
            qItem.id === queueId
              ? { ...qItem, progress: 100, status: 'completed', speed: '0 KB/s', eta: 'Selesai' }
              : qItem
          )
        );

        // Trigger Efek Konfeti untuk memuaskan visual user
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8b5a2b', '#b8860b', '#d2b48c', '#10b981'], // Warm bronze confetti tones
        });

        // Simpan otomatis ke perangkat
        const completedItem = { ...newQueueItem, id: queueId };
        saveFileToDevice(completedItem);

        // Tambah ke riwayat (history)
        const historyItem = {
          ...completedItem,
          timestamp: Date.now(),
        };
        const updatedHistory = [historyItem, ...history];
        saveHistoryToStorage(updatedHistory);

        // Hapus otomatis dari queue setelah 5 detik
        setTimeout(() => {
          setQueue((prevQueue) => prevQueue.filter((qItem) => qItem.id !== queueId));
        }, 5000);

      } else {
        // Progres berjalan
        let status = 'downloading';
        let speedStr = '';
        let etaStr = '';

        if (currentProgress < 85) {
          // Fase download streaming
          status = 'downloading';
          // Kecepatan download dinamis
          const minSpeed = isAudio ? 0.8 : 4.5;
          const maxSpeed = isAudio ? 1.5 : 8.2;
          const currentSpeed = (Math.random() * (maxSpeed - minSpeed) + minSpeed).toFixed(1);
          speedStr = `${currentSpeed} MB/s`;

          // Estimasi sisa waktu
          const remainingMB = (sizeNumber * (100 - currentProgress)) / 100;
          const remainingSeconds = Math.max(1, Math.ceil(remainingMB / parseFloat(currentSpeed)));
          etaStr = `${remainingSeconds}s`;
        } else {
          // Fase Muxing audio & video (ffmpeg) di 15% terakhir
          status = 'muxing';
          speedStr = 'Muxing...';
          etaStr = 'Beberapa saat lagi...';
        }

        setQueue((prevQueue) =>
          prevQueue.map((qItem) =>
            qItem.id === queueId
              ? { ...qItem, progress: currentProgress, status, speed: speedStr, eta: etaStr }
              : qItem
          )
        );
      }
    }, 300);

    // Simpan reference interval di queue item agar bisa dibatalkan
    newQueueItem.intervalRef = interval;
  };

  // Membatalkan download yang sedang berjalan
  const handleCancelDownload = (queueId) => {
    const itemToCancel = queue.find((q) => q.id === queueId);
    if (itemToCancel && itemToCancel.intervalRef) {
      clearInterval(itemToCancel.intervalRef);
    }
    setQueue((prevQueue) => prevQueue.filter((q) => q.id !== queueId));
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
                  onSaveFile={saveFileToDevice}
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
                onSaveFile={saveFileToDevice}
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
