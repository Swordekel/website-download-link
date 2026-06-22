import React, { useEffect, useRef } from 'react';
import { DownloadCloud, Play, Pause, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DownloadQueue({ queue, onCancel, onSaveFile }) {
  if (queue.length === 0) return null;

  return (
    <div className="download-queue-section glass-panel slide-up">
      <div className="section-header mb-6">
        <div className="flex-center" style={{ gap: '0.5rem' }}>
          <DownloadCloud size={20} className="gradient-text" />
          <h2 className="section-title">Antrean Unduhan Aktif</h2>
        </div>
        <span className="queue-count-badge">{queue.length} Berjalan</span>
      </div>

      <div className="queue-list">
        {queue.map((item) => (
          <QueueItem key={item.id} item={item} onCancel={onCancel} onSaveFile={onSaveFile} />
        ))}
      </div>
    </div>
  );
}

function QueueItem({ item, onCancel, onSaveFile }) {
  const {
    id,
    videoTitle,
    videoAuthor,
    platform,
    thumbnail,
    resolution,
    bitrate,
    size,
    progress,
    speed,
    eta,
    status, // 'connecting', 'downloading', 'muxing', 'completed'
  } = item;

  // Mendapatkan label kualitas dari resolusi atau bitrate
  const formatLabel = resolution || bitrate || 'MP4';

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Menghubungkan ke server AeroGrab...';
      case 'downloading': return `Mengunduh aliran media (${formatLabel})...`;
      case 'muxing': return 'Menggabungkan audio & video (Muxing)...';
      case 'completed': return 'Selesai! Berkas siap disimpan.';
      default: return 'Memproses...';
    }
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'youtube': return 'Y';
      case 'tiktok': return 'T';
      case 'facebook': return 'F';
      case 'instagram': return 'I';
      default: return '';
    }
  };

  return (
    <div className={`queue-item-card ${status === 'completed' ? 'completed-glow' : ''}`}>
      <div className="queue-item-header">
        {/* Thumbnail kecil */}
        <div className="queue-thumbnail">
          <img src={thumbnail} alt={videoTitle} />
          <span className="queue-platform-indicator">{getPlatformIcon()}</span>
        </div>

        {/* Info detail */}
        <div className="queue-info">
          <h3 className="queue-title">{videoTitle}</h3>
          <div className="queue-subtitle">
            <span>{videoAuthor}</span>
            <span className="separator">•</span>
            <span className="format-tag">{formatLabel}</span>
            <span className="separator">•</span>
            <span>{size}</span>
          </div>
        </div>

        {/* Aksi tombol */}
        <div className="queue-actions">
          {status === 'completed' ? (
            <button
              className="btn-primary btn-save flex-center"
              onClick={() => onSaveFile(item)}
            >
              <CheckCircle2 size={16} />
              <span>Simpan</span>
            </button>
          ) : (
            <button
              className="btn-secondary btn-cancel flex-center"
              onClick={() => onCancel(id)}
              title="Batalkan Unduhan"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progres area */}
      <div className="queue-progress-area mt-4">
        <div className="progress-stats mb-1">
          <span className="status-message flex-center">
            {status !== 'completed' && <span className="status-dot"></span>}
            {getStatusText()}
          </span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="progress-bar-container">
          <div
            className={`progress-bar-fill ${status === 'completed' ? 'success' : ''}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Informasi Kecepatan & ETA */}
        {status === 'downloading' && (
          <div className="download-metadata mt-2">
            <span className="meta-stat">
              Kecepatan: <strong className="white-text">{speed}</strong>
            </span>
            <span className="meta-stat">
              Estimasi Sisa: <strong className="white-text">{eta}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
