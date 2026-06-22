import React from 'react';
import { Zap, Shield, Sparkles, Sliders, Heart, DownloadCloud } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: <Zap className="feat-icon text-purple" size={24} />,
      title: 'Akselerasi Download',
      desc: 'Kecepatan pemrosesan link dan server download yang dioptimalkan hingga 10x lebih cepat daripada pengunduh biasa.',
    },
    {
      icon: <Shield className="feat-icon text-indigo" size={24} />,
      title: 'Aman & Bersih',
      desc: 'Sistem AeroGrab menjaga privasi Anda secara aman tanpa ada adware, malware, atau pop-up iklan yang mengganggu.',
    },
    {
      icon: <Sparkles className="feat-icon text-pink" size={24} />,
      title: 'Tanpa Watermark',
      desc: 'Dapatkan hasil unduhan video TikTok yang bersih tanpa watermark yang mengganggu penampilan video Anda.',
    },
    {
      icon: <Sliders className="feat-icon text-blue" size={24} />,
      title: 'Pilihan Resolusi',
      desc: 'Mulai dari kualitas standar 360p, HD 720p, Full HD 1080p, hingga audio format MP3 dalam satu klik saja.',
    },
    {
      icon: <DownloadCloud className="feat-icon text-cyan" size={24} />,
      title: 'Unduhan Tanpa Batas',
      desc: 'Gunakan layanan kami secara gratis sepuasnya tanpa batasan jumlah file harian maupun ukuran berkas media.',
    },
    {
      icon: <Heart className="feat-icon text-red" size={24} />,
      title: 'Mudah Digunakan',
      desc: 'UI minimalis dan intuitif yang dirancang secara cermat agar mudah digunakan oleh siapa saja, di mana saja.',
    },
  ];

  return (
    <section className="features-section container mt-8">
      <div className="section-title-wrapper text-center mb-8">
        <h2 className="section-main-title mb-2">Mengapa Memilih AeroGrab?</h2>
        <p className="text-secondary">Keunggulan teknologi unduh media serbaguna yang kami tawarkan.</p>
      </div>

      <div className="grid-3">
        {features.map((feat, index) => (
          <div
            key={index}
            className="feature-card glass-panel glass-card-interactive fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="feat-icon-wrapper mb-4">{feat.icon}</div>
            <h3 className="feat-title mb-2">{feat.title}</h3>
            <p className="feat-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
