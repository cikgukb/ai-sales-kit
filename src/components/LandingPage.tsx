import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import Footer from './Footer';

interface LandingPageProps {
  onGetAccess: () => void;
  isLoggedIn?: boolean;
}

const LandingPage = ({ onGetAccess, isLoggedIn }: LandingPageProps) => {
  return (
    <div className="app-container">
      {/* Navigation */}
      <nav style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <Zap color="var(--primary)" fill="var(--primary)" size={24} />
            <span className="text-gradient">AI SALES KIT</span>
          </div>
          {/* Nav buttons removed per user request */}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="section" style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
        <div className="hero-glow"></div>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>
          <div className="badge">Sistem Jana Sales Untuk Usahawan Mikro</div>
          
          <h1 className="heading-xl" style={{ maxWidth: '900px' }}>
            Sistem Tarik Pelanggan & <span className="text-gradient">Close Sale</span> Dengan Mudah
          </h1>
          
          <p className="text-lg" style={{ maxWidth: '600px', fontSize: '1.25rem', marginBottom: '1rem' }}>
            Jana bahan jualan profesional untuk perniagaan anda dalam beberapa ketika sahaja. Berhenti pening fikir marketing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', background: 'var(--glass-bg)', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            {[
              "Hasilkan poster iklan profesional (boleh upload gambar sendiri!)",
              "Tulis ayat jualan yang buat orang nak beli",
              "Guna skrip WhatsApp untuk close sale",
              "Ikut langkah jelas untuk dapatkan sale pertama"
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="var(--primary)" size={20} />
                <span style={{ fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={onGetAccess} className="btn-primary" style={{ marginTop: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {isLoggedIn ? 'Buka Dashboard Sekarang' : 'Mula Buat Sale Sekarang'} <ArrowRight size={20} />
          </button>
        </div>
      </header>
      <Footer />
    </div>
  );
};

export default LandingPage;
