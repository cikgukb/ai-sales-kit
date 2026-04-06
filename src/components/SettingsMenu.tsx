import { Settings, Globe, Moon, Sun } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { t } from '../lib/i18n';
import { useState, useRef, useEffect } from 'react';

export default function SettingsMenu() {
  const { lang, setLang, theme, setTheme } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline"
        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={t(lang, 'settings')}
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px',
          width: 'max-content',
          zIndex: 50,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <Globe size={16} /> <span>{t(lang, 'language')}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setLang('bm')}
                className={lang === 'bm' ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '8px 12px', flex: 1, fontSize: '0.8rem' }}
              >
                Melayu
              </button>
              <button 
                onClick={() => setLang('en')}
                className={lang === 'en' ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '8px 12px', flex: 1, fontSize: '0.8rem' }}
              >
                English
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} 
              <span>{t(lang, 'theme')}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setTheme('dark')}
                className={theme === 'dark' ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '8px 12px', flex: 1, fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
              >
                <Moon size={14}/> {t(lang, 'dark')}
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={theme === 'light' ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '8px 12px', flex: 1, fontSize: '0.8rem', display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
              >
                <Sun size={14}/> {t(lang, 'light')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
