import React from 'react';
import { DownloadCloud, History, HelpCircle, Layers, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ activeTab, setActiveTab, historyCount, queueCount, theme, toggleTheme }) {
  const tabs = [
    { id: 'downloader', label: 'Downloader', icon: <DownloadCloud size={18} />, badge: queueCount > 0 ? queueCount : null, badgeClass: 'badge-queue' },
    { id: 'platforms', label: 'Platform', icon: <Layers size={18} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> },
    { id: 'history', label: 'Riwayat', icon: <History size={18} />, badge: historyCount > 0 ? historyCount : null, badgeClass: 'badge-history' }
  ];

  return (
    <header className="site-header">
      <div className="container header-container">
        
        {/* Logo */}
        <div className="logo-area" onClick={() => setActiveTab('downloader')}>
          <div className="logo-icon-wrapper">
            <DownloadCloud className="logo-icon animate-pulse-slow" size={24} />
          </div>
          <span className="logo-text">
            Aero<span className="gradient-text">Grab</span>
          </span>
        </div>

        {/* Tab & Theme Toggles Wrapper */}
        <div className="nav-controls-wrapper">
          {/* Navigation Tabs with Framer Motion sliding background */}
          <nav className="nav-tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {/* Sliding Background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="active-tab-indicator-bg"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <div className="nav-tab-content flex-center">
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span className={`tab-badge ${tab.badgeClass}`}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Theme Switcher Button */}
          <button
            className="theme-toggle-btn flex-center"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
}
