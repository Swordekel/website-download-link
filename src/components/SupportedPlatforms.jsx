import React from 'react';
import { Video, CheckCircle2, AlertCircle } from 'lucide-react';
import { YoutubeIcon, FacebookIcon, InstagramIcon } from './BrandIcons';

export default function SupportedPlatforms() {
  const platforms = [
    {
      name: 'YouTube',
      icon: <YoutubeIcon className="platform-icon" style={{ color: 'var(--color-youtube)' }} size={32} />,
      badgeClass: 'badge-youtube',
      formats: ['Video HD (1080p, 720p)', 'Video SD (480p, 360p)', 'Audio MP3 (320kbps, 192kbps)', 'YouTube Shorts'],
      example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      tip: 'Mendukung penggabungan audio-video resolusi tinggi secara otomatis.',
    },
    {
      name: 'TikTok',
      icon: <Video className="platform-icon" style={{ color: 'var(--color-tiktok-cyan)' }} size={32} />,
      badgeClass: 'badge-tiktok',
      formats: ['Video Tanpa Watermark', 'Video Original (Dengan Watermark)', 'Audio MP3', 'TikTok Slideshow (MP4)'],
      example: 'https://www.tiktok.com/@username/video/1234567890',
      tip: 'Hasil unduhan video TikTok bersih dari logo mengambang.',
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon className="platform-icon" style={{ color: 'var(--color-instagram)' }} size={32} />,
      badgeClass: 'badge-instagram',
      formats: ['Instagram Reels', 'Instagram Video Posts', 'Instagram Photos/Carousel', 'IGTV Video'],
      example: 'https://www.instagram.com/p/CgK7HhHjP1d/',
      tip: 'Mendukung pengunduhan post gambar maupun post video Reel.',
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon className="platform-icon" style={{ color: 'var(--color-facebook)' }} size={32} />,
      badgeClass: 'badge-facebook',
      formats: ['Facebook Videos (HD)', 'Facebook Watch Videos', 'Facebook Lite Videos', 'FB Live Replays'],
      example: 'https://www.facebook.com/watch/?v=10158283482848284',
      tip: 'Pastikan status post video Facebook diatur untuk Publik.',
    },
  ];

  return (
    <section className="platforms-section container mt-8 slide-up">
      <div className="section-title-wrapper text-center mb-8">
        <h1 className="section-main-title mb-2">Platform yang Didukung</h1>
        <p className="text-secondary">Kami mendukung pengunduhan media dengan kualitas terbaik dari berbagai jejaring sosial terpopuler.</p>
      </div>

      <div className="grid-2 mb-8">
        {platforms.map((plat, idx) => (
          <div key={idx} className="platform-card glass-panel flex-column">
            <div className="platform-card-header mb-4">
              <div className="flex-center" style={{ gap: '1rem' }}>
                {plat.icon}
                <h3 className="platform-card-name">{plat.name}</h3>
              </div>
              <span className={`platform-badge ${plat.badgeClass}`}>{plat.name}</span>
            </div>

            <div className="platform-card-body flex-grow-1">
              <h4 className="meta-title mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Format yang Didukung:</h4>
              <ul className="format-checklist mb-4">
                {plat.formats.map((f, i) => (
                  <li key={i} className="checklist-item">
                    <CheckCircle2 size={14} className="check-icon" style={{ color: 'var(--success)' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="url-example-box mb-4">
                <span className="example-title">Contoh Format Link:</span>
                <code className="example-code mt-1">{plat.example}</code>
              </div>
            </div>

            <div className="platform-card-footer mt-2">
              <div className="tip-box flex-center">
                <AlertCircle size={14} className="tip-icon text-indigo" />
                <span className="tip-text">{plat.tip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
