import { CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import Footer from './Footer';
import SettingsMenu from './SettingsMenu';
import { useSettings } from '../lib/SettingsContext';
import { t } from '../lib/i18n';

interface LandingPageProps {
  onGetAccess: () => void;
  isLoggedIn?: boolean;
}

const LandingPage = ({ onGetAccess, isLoggedIn }: LandingPageProps) => {
  const { lang } = useSettings();
  
  return (
    <div className="app-container">
      {/* Navigation */}
      <nav style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <Zap color="var(--primary)" fill="var(--primary)" size={24} />
            <span className="text-gradient">{t(lang, 'aiSalesKit')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SettingsMenu />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="section" style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
        <div className="hero-glow"></div>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>
          <div className="badge">{t(lang, 'badge')}</div>
          
          <h1 className="heading-xl" style={{ maxWidth: '900px' }}>
            {t(lang, 'heroTitle1')} <span className="text-gradient">{t(lang, 'heroTitle2')}</span> {t(lang, 'heroTitle3')}
          </h1>
          
          <p className="text-lg" style={{ maxWidth: '600px', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            {t(lang, 'heroDesc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', background: 'var(--glass-bg)', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
            {[
              t(lang, 'feature1'),
              t(lang, 'feature2'),
              t(lang, 'feature3'),
              t(lang, 'feature4')
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 color="var(--primary)" size={20} />
                <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={onGetAccess} className="btn-primary" style={{ marginTop: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {isLoggedIn ? t(lang, 'btnDashboard') : t(lang, 'btnStart')} <ArrowRight size={20} />
          </button>
        </div>
      </header>
      <Footer />
    </div>
  );
};

export default LandingPage;
