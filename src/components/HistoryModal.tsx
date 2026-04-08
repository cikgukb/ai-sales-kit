import { useEffect, useState } from 'react';
import { History, X, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { fetchUserHistory } from '../lib/supabase';
import type { SalesKitData } from '../lib/supabase';

type HistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (savedData: SalesKitData) => void;
};

export default function HistoryModal({ isOpen, onClose, onSelectHistory }: HistoryModalProps) {
  const [history, setHistory] = useState<SalesKitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchUserHistory().then(data => {
        setHistory(data || []);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--primary)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--primary)" /> Sejarah Janaan
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              Memuatkan sejarah...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              Belum ada rekod janaan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.jenis_produk} {item.target_customer ? `(${item.target_customer})` : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.gambar_url && (
                      <ImageIcon size={18} style={{ color: 'var(--success)' }} aria-label="Ada Gambar" />
                    )}
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
