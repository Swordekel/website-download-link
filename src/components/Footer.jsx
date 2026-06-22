import React from 'react';
import { DownloadCloud } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="site-footer mt-8">
      <div className="container footer-container">
        
        {/* Footer Top */}
        <div className="footer-top mb-6">
          <div className="footer-brand" onClick={() => setActiveTab('downloader')}>
            <div className="logo-icon-wrapper">
              <DownloadCloud className="logo-icon" size={20} />
            </div>
            <span className="logo-text" style={{ fontSize: '1.25rem' }}>
              Aero<span className="gradient-text">Grab</span>
            </span>
          </div>

          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => setActiveTab('downloader')}>Downloader</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('platforms')}>Platform</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('faq')}>FAQ</button>
            <button className="footer-link-btn" onClick={() => setActiveTab('history')}>Riwayat</button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} AeroGrab. Seluruh hak cipta dilindungi.
          </p>
          <p className="footer-disclaimer">
            AeroGrab adalah alat bantu edukasi gratis untuk mengunduh video publik. Kami tidak berafiliasi dengan YouTube, TikTok, Facebook, maupun Instagram. Pengguna bertanggung jawab penuh atas media yang mereka unduh.
          </p>
        </div>

      </div>
    </footer>
  );
}
