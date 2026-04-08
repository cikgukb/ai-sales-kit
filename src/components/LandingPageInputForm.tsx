import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { LandingPageInput } from '../lib/aiClient';
import { useSettings } from '../lib/SettingsContext';
import { t } from '../lib/i18n';

type LandingPageInputFormProps = {
  data: LandingPageInput;
  onChange: (data: LandingPageInput) => void;
  onSubmit: (data: LandingPageInput) => void;
  isLoading: boolean;
};

export default function LandingPageInputForm({ data, onChange, onSubmit, isLoading }: LandingPageInputFormProps) {
  const { lang } = useSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.productDescription) return;
    onSubmit(data);
  };

  return (
    <div className="glass-panel w-full max-w-2xl mx-auto">
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Landing Page Builder</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Isi maklumat di bawah untuk menjana Landing Page Sales Copy yang "high-converting". Sistem akan menggunakan tawaran anda untuk memaksimumkan kadar konversi.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label className="label" htmlFor="productDescription">{t(lang, 'productType')}</label>
          <input
            className="input-field"
            type="text"
            id="productDescription"
            name="productDescription"
            placeholder={t(lang, 'productTypePlaceholder')}
            value={data.productDescription}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="targetAudience">{t(lang, 'targetCustomer')}</label>
          <input
            className="input-field"
            type="text"
            id="targetAudience"
            name="targetAudience"
            placeholder={t(lang, 'targetCustomerPlaceholder')}
            value={data.targetAudience}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="priceRange">{t(lang, 'price')}</label>
          <input
            className="input-field"
            type="text"
            id="priceRange"
            name="priceRange"
            placeholder={t(lang, 'pricePlaceholder')}
            value={data.priceRange || ''}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <label className="label" htmlFor="offerDetails" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" /> 
            Offer (Tawaran Khusus) <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>(Pilihan)</span>
          </label>
          <input
            className="input-field"
            type="text"
            id="offerDetails"
            name="offerDetails"
            placeholder="Diskaun 50%, Beli 1 Percuma 1, Free Shipping, dll..."
            value={data.offerDetails}
            onChange={handleChange}
            disabled={isLoading}
            style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>
            Masukkan tawaran khas anda untuk tingkatkan conversion. Contoh: "Bonus terhad untuk 50 terawal sahaja!"
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !data.productDescription} 
          className="btn-primary" 
          style={{ marginTop: '10px', fontSize: '1.1rem', padding: '14px' }}
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={20} /> Sedang Menjana Copywriting...</>
          ) : (
            <><Sparkles size={20} /> Jana Landing Page Copywriting</>
          )}
        </button>
      </form>
    </div>
  );
}
