import React, { useState, useEffect } from 'react';
import { Clipboard, ArrowRight, X, Sparkles, Video } from 'lucide-react';
import { YoutubeIcon, FacebookIcon, InstagramIcon } from './BrandIcons';

export default function HeroDownloader({ onAnalyze, isLoading, error }) {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState(null);

  // Deteksi platform berdasarkan URL secara real-time
  useEffect(() => {
    const trimmedUrl = url.trim().toLowerCase();
    if (!trimmedUrl) {
      setDetectedPlatform(null);
      return;
    }

    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
      setDetectedPlatform('youtube');
    } else if (trimmedUrl.includes('tiktok.com')) {
      setDetectedPlatform('tiktok');
    } else if (trimmedUrl.includes('facebook.com') || trimmedUrl.includes('fb.watch') || trimmedUrl.includes('fb.com')) {
      setDetectedPlatform('facebook');
    } else if (trimmedUrl.includes('instagram.com')) {
      setDetectedPlatform('instagram');
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Gagal membaca clipboard:', err);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze(url.trim(), detectedPlatform);
    }
  };

  const fillExample = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  // Class tambahan untuk membungkus input berdasarkan platform yang terdeteksi
  const getGlowClass = () => {
    if (!detectedPlatform) return '';
    return `glow-wrapper-${detectedPlatform}`;
  };

  return (
    <section className="hero-section">
      <div className="hero-content text-center">
        <div className="badge-featured mb-4 fade-in">
          <Sparkles size={14} className="sparkle-icon" />
          <span>All-in-One Downloader Tercepat</span>
        </div>

        <h1 className="hero-title mb-4 slide-up">
          Unduh Video & Audio <br />
          <span className="gradient-text">Tanpa Batas, Kualitas HD</span>
        </h1>

        <p className="hero-subtitle mb-8 slide-up" style={{ animationDelay: '0.1s' }}>
          Simpan video favorit Anda dari YouTube, TikTok, Facebook, dan Instagram dalam satu platform elegan dengan pilihan berbagai resolusi secara instan.
        </p>

        {/* Input Card */}
        <div className="downloader-card glass-panel mb-6 slide-up" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit}>
            <div className={`glass-input-wrapper ${getGlowClass()}`}>
              <div className="input-prefix-icon">
                {detectedPlatform === 'youtube' && <YoutubeIcon className="platform-icon text-red" style={{ color: 'var(--color-youtube)' }} size={20} />}
                {detectedPlatform === 'tiktok' && <Video className="platform-icon text-tiktok" style={{ color: 'var(--color-tiktok-cyan)' }} size={20} />}
                {detectedPlatform === 'facebook' && <FacebookIcon className="platform-icon text-fb" style={{ color: 'var(--color-facebook)' }} size={20} />}
                {detectedPlatform === 'instagram' && <InstagramIcon className="platform-icon text-ig" style={{ color: 'var(--color-instagram)' }} size={20} />}
                {!detectedPlatform && <Video className="platform-icon text-muted" size={20} />}
              </div>

              <input
                type="text"
                className="glass-input"
                placeholder="Tempel atau ketik link video di sini..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />

              {url && (
                <button
                  type="button"
                  className="input-action-btn clear-btn flex-center"
                  onClick={handleClear}
                  disabled={isLoading}
                  title="Hapus"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                className="input-action-btn paste-btn flex-center"
                onClick={handlePaste}
                disabled={isLoading}
                title="Tempel dari Clipboard"
              >
                <Clipboard size={16} />
                <span className="btn-label-desktop">Tempel</span>
              </button>

              <button
                type="submit"
                className="btn-primary input-submit-btn flex-center"
                disabled={!url.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="spinner-small"></div>
                ) : (
                  <>
                    <span className="btn-label-desktop">Analisis</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && <div className="error-message mt-4 fade-in">{error}</div>}

          {/* Platform Status Indicator */}
          <div className="platform-indicators mt-6">
            <span className={`indicator-badge ${detectedPlatform === 'youtube' ? 'active youtube' : ''}`}>
              <YoutubeIcon size={16} />
              <span>YouTube</span>
            </span>
            <span className={`indicator-badge ${detectedPlatform === 'tiktok' ? 'active tiktok' : ''}`}>
              <Video size={16} />
              <span>TikTok</span>
            </span>
            <span className={`indicator-badge ${detectedPlatform === 'facebook' ? 'active facebook' : ''}`}>
              <FacebookIcon size={16} />
              <span>Facebook</span>
            </span>
            <span className={`indicator-badge ${detectedPlatform === 'instagram' ? 'active instagram' : ''}`}>
              <InstagramIcon size={16} />
              <span>Instagram</span>
            </span>
          </div>
        </div>

        {/* Contoh Tautan Cepat */}
        <div className="examples-area fade-in" style={{ animationDelay: '0.3s' }}>
          <span className="text-muted">Klik untuk mencoba link contoh:</span>
          <div className="example-links mt-2">
            <button
              className="example-link-btn"
              onClick={() => fillExample('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            >
              YouTube Video
            </button>
            <button
              className="example-link-btn"
              onClick={() => fillExample('https://www.tiktok.com/@khaby.lame/video/7034828135892348166')}
            >
              TikTok Video
            </button>
            <button
              className="example-link-btn"
              onClick={() => fillExample('https://www.instagram.com/p/CgK7HhHjP1d/')}
            >
              Instagram Reel
            </button>
            <button
              className="example-link-btn"
              onClick={() => fillExample('https://www.facebook.com/watch/?v=10158283482848284')}
            >
              Facebook Video
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
