import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'Apakah layanan AeroGrab sepenuhnya gratis?',
      a: 'Ya, AeroGrab 100% gratis digunakan. Anda dapat mengunduh video dan mengonversi audio sebanyak yang Anda inginkan tanpa biaya pendaftaran atau batasan kecepatan.',
    },
    {
      q: 'Bagaimana cara memilih resolusi 1080p (Full HD) untuk video YouTube?',
      a: 'Ketika Anda menempelkan link YouTube, sistem kami secara otomatis memisahkan trek video HD tinggi dan trek audio, lalu menggabungkannya kembali (Muxing) agar menghasilkan file MP4 1080p yang utuh beserta suaranya secara real-time saat Anda mengunduh.',
    },
    {
      q: 'Bagaimana cara mendownload video TikTok tanpa watermark?',
      a: 'Tempelkan link video TikTok ke dalam AeroGrab. Sistem kami akan mendeteksi dan mengekstrak tautan CDN langsung dari TikTok yang tidak memiliki logo/watermark sehingga Anda mendapatkan video orisinal yang bersih.',
    },
    {
      q: 'Apakah AeroGrab menyimpan salinan video yang saya unduh?',
      a: 'Tidak. AeroGrab tidak pernah menyimpan salinan berkas video di server kami. Semua lalu lintas data dienkripsi, dan tautan ekstraksi diproses secara transparan demi keamanan privasi penuh pengguna.',
    },
    {
      q: 'Di mana file hasil unduhan disimpan di perangkat saya?',
      a: 'File yang Anda unduh akan langsung masuk ke folder default download browser Anda (biasanya folder "Downloads" atau "Unduhan" di PC/Android/iOS Anda) sesuai konfigurasi browser yang Anda gunakan.',
    },
    {
      q: 'Apakah AeroGrab bisa digunakan di handphone (smartphone)?',
      a: 'Tentu saja! Website AeroGrab dirancang secara responsif agar berjalan dengan mulus di berbagai perangkat Android, iPhone, iPad, tablet, maupun komputer desktop.',
    },
  ];

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section className="faq-section container mt-8">
      <div className="section-title-wrapper text-center mb-8">
        <h2 className="section-main-title mb-2">Pertanyaan yang Sering Diajukan (FAQ)</h2>
        <p className="text-secondary">Informasi tambahan untuk membantu memaksimalkan penggunaan AeroGrab.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`faq-item glass-panel ${isOpen ? 'open' : ''} slide-up`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button className="faq-question-btn" onClick={() => toggleFaq(index)}>
                <div className="faq-question-text">
                  <HelpCircle className="faq-icon text-indigo" size={18} />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <div className={`faq-answer-container ${isOpen ? 'open' : ''}`}>
                <div className="faq-answer-content">
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
