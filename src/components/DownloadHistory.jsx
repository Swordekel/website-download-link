import React, { useState } from 'react';
import { Search, Trash2, Download, Calendar, Inbox } from 'lucide-react';

export default function DownloadHistory({ history, onDeleteItem, onClearAll, onSaveFile }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memfilter riwayat berdasarkan pencarian judul
  const filteredHistory = history.filter((item) =>
    item.videoTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformBadgeClass = (platform) => {
    switch (platform) {
      case 'youtube': return 'badge-youtube';
      case 'tiktok': return 'badge-tiktok';
      case 'facebook': return 'badge-facebook';
      case 'instagram': return 'badge-instagram';
      default: return '';
    }
  };

  return (
    <div className="history-section container slide-up">
      <div className="history-header glass-panel mb-6">
        <div className="history-header-top mb-4">
          <div>
            <h1 className="history-title">Riwayat Unduhan</h1>
            <p className="history-subtitle">Daftar semua file yang berhasil Anda unduh di AeroGrab.</p>
          </div>

          {history.length > 0 && (
            <button className="btn-secondary btn-clear-all flex-center" onClick={onClearAll}>
              <Trash2 size={16} />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>

        {/* Pencarian */}
        {history.length > 0 && (
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon text-muted" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari berdasarkan judul video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Riwayat Konten */}
      {filteredHistory.length === 0 ? (
        <div className="empty-history glass-panel text-center">
          <Inbox size={48} className="empty-icon text-muted mb-4" />
          <h3>
            {history.length === 0
              ? 'Belum ada riwayat unduhan'
              : 'Hasil pencarian tidak ditemukan'}
          </h3>
          <p className="text-muted mt-2">
            {history.length === 0
              ? 'Salin link video favorit Anda dan unduh sekarang di tab Downloader.'
              : 'Cobalah gunakan kata kunci pencarian yang lain.'}
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map((item) => {
            const formatLabel = item.resolution || item.bitrate || 'MP4';
            return (
              <div key={item.id || item.timestamp} className="history-card glass-panel">
                <div className="history-card-thumbnail">
                  <img src={item.thumbnail} alt={item.videoTitle} />
                  <span className={`platform-badge history-badge-pos ${getPlatformBadgeClass(item.platform)}`}>
                    {item.platform}
                  </span>
                </div>

                <div className="history-card-body mt-4">
                  <h3 className="history-card-title" title={item.videoTitle}>
                    {item.videoTitle}
                  </h3>
                  <p className="history-card-author">{item.videoAuthor}</p>

                  <div className="history-card-meta mt-3">
                    <span className="history-meta-badge">{formatLabel}</span>
                    <span className="history-meta-size">{item.size}</span>
                  </div>

                  <div className="history-card-date mt-3">
                    <Calendar size={12} />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </div>

                <div className="history-card-actions mt-4">
                  <button
                    className="btn-primary btn-save flex-center"
                    style={{ flexGrow: 1 }}
                    onClick={() => onSaveFile(item)}
                  >
                    <Download size={14} />
                    <span>Unduh Lagi</span>
                  </button>
                  <button
                    className="btn-secondary btn-delete flex-center"
                    onClick={() => onDeleteItem(item.id)}
                    title="Hapus dari riwayat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
