import React, { useState, useEffect } from 'react';
import { Video, Music, Download, Clock, User, Play, X } from 'lucide-react';

export default function ExtractorPanel({ videoData, onDownload }) {
  const [activeFormatTab, setActiveFormatTab] = useState('video'); // 'video' atau 'audio'
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset status pemutar saat data video baru dimuat
  useEffect(() => {
    setIsPlaying(false);
  }, [videoData]);

  if (!videoData) return null;

  const { title, author, duration, thumbnail, platform, url, formats } = videoData;

  const getPlatformBadgeClass = () => {
    switch (platform) {
      case 'youtube': return 'badge-youtube';
      case 'tiktok': return 'badge-tiktok';
      case 'facebook': return 'badge-facebook';
      case 'instagram': return 'badge-instagram';
      default: return '';
    }
  };

  const handleDownloadClick = (format) => {
    onDownload({
      ...format,
      videoTitle: title,
      videoAuthor: author,
      platform: platform,
      thumbnail: thumbnail,
    });
  };

  // Fungsi pengambil ID video YouTube dari URL
  const getYoutubeId = (videoUrl) => {
    if (!videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Mendapatkan URL video untuk pemutar kustom
  const getVideoPlayerUrl = () => {
    switch (platform) {
      case 'tiktok':
        // Loop vertical aesthetic neon room
        return 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lit-room-listening-to-music-42261-large.mp4';
      case 'facebook':
        // Loop landscape nature forest stream
        return 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4';
      case 'instagram':
        // Loop portrait square tree yellow flowers
        return 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-in-wind-43093-large.mp4';
      default:
        // Lofi developer coding loop
        return 'https://assets.mixkit.co/videos/preview/mixkit-lofi-developer-working-late-at-night-41561-large.mp4';
    }
  };

  const youtubeId = getYoutubeId(url);
  const isYoutubePlayer = platform === 'youtube' && youtubeId;

  return (
    <div className="extractor-panel glass-panel slide-up">
      <div className="extractor-content">
        
        {/* Kolom Kiri: Thumbnail / Pemutar Video */}
        <div className="extractor-preview">
          <div className={`thumbnail-wrapper ${isPlaying ? 'playing' : 'clickable'}`} onClick={() => !isPlaying && setIsPlaying(true)}>
            {isPlaying ? (
              <div className="video-player-container">
                {/* Tombol Tutup Pemutar */}
                <button
                  className="btn-close-player flex-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(false);
                  }}
                  title="Tutup Pemutar"
                >
                  <X size={16} />
                </button>

                {isYoutubePlayer ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="video-player-iframe"
                  ></iframe>
                ) : (
                  <video
                    src={getVideoPlayerUrl()}
                    className="video-player-element"
                    autoplay="true"
                    controls
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: platform === 'tiktok' ? 'contain' : 'cover', background: '#000' }}
                  ></video>
                )}
              </div>
            ) : (
              <>
                <img src={thumbnail} alt={title} className="video-thumbnail" />
                <span className={`platform-badge extractor-badge ${getPlatformBadgeClass()}`}>
                  {platform}
                </span>
                
                {/* Overlay Play Hover */}
                <div className="play-button-overlay flex-center">
                  <div className="play-icon-ring flex-center">
                    <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />
                  </div>
                </div>

                <div className="thumbnail-overlay">
                  <span className="duration-tag flex-center">
                    <Clock size={12} />
                    {duration}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Detail Video */}
        <div className="extractor-details">
          <h2 className="video-title mb-2">{title}</h2>
          
          <div className="video-meta mb-6">
            <span className="meta-item flex-center">
              <User size={14} />
              <span>{author}</span>
            </span>
            <span className="meta-item flex-center">
              <Clock size={14} />
              <span>{duration}</span>
            </span>
          </div>

          {/* Tab Selector: Video vs Audio */}
          <div className="format-tabs mb-4">
            <button
              className={`format-tab-btn ${activeFormatTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveFormatTab('video')}
            >
              <Video size={16} />
              <span>Video</span>
            </button>
            <button
              className={`format-tab-btn ${activeFormatTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveFormatTab('audio')}
            >
              <Music size={16} />
              <span>Audio (MP3)</span>
            </button>
          </div>

          {/* Format List */}
          <div className="formats-container">
            {activeFormatTab === 'video' ? (
              <div className="formats-list">
                {formats.video.map((fmt, index) => (
                  <div key={`video-${index}`} className="format-row">
                    <div className="format-info">
                      <span className="format-resolution">{fmt.resolution}</span>
                      <span className="format-label">.mp4 • {fmt.quality}</span>
                    </div>
                    <div className="format-actions">
                      <span className="format-size">{fmt.size}</span>
                      <button
                        className="btn-primary btn-download-format"
                        onClick={() => handleDownloadClick(fmt)}
                      >
                        <Download size={14} />
                        <span>Unduh</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="formats-list">
                {formats.audio.map((fmt, index) => (
                  <div key={`audio-${index}`} className="format-row">
                    <div className="format-info">
                      <span className="format-resolution">{fmt.bitrate}</span>
                      <span className="format-label">.mp3 • {fmt.quality}</span>
                    </div>
                    <div className="format-actions">
                      <span className="format-size">{fmt.size}</span>
                      <button
                        className="btn-primary btn-download-format"
                        onClick={() => handleDownloadClick(fmt)}
                      >
                        <Download size={14} />
                        <span>Unduh</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="disclaimer-text mt-4">
            * Ukuran berkas merupakan estimasi. Unduhan akan diproses melalui server akselerasi AeroGrab.
          </div>

        </div>
      </div>
    </div>
  );
}
