import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import type { SalesInput } from '../lib/aiClient';
import { useSettings } from '../lib/SettingsContext';
import { t } from '../lib/i18n';

type InputFormProps = {
  data: Omit<SalesInput, 'userImage'>;
  onChange: (data: Omit<SalesInput, 'userImage'>) => void;
  onSubmit: (data: SalesInput) => void;
  isLoading: boolean;
};

export default function InputForm({ data, onChange, onSubmit, isLoading }: InputFormProps) {
  const { lang } = useSettings();
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: only images, max 5MB
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail gambar sahaja (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Saiz gambar terlalu besar. Maksimum 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setUserImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUserImage(undefined);
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.jenisProduk) return;
    onSubmit({ ...data, userImage });
  };

  return (
    <div className="glass-panel w-full max-w-2xl mx-auto">
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>{t(lang, 'formTitle')}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {t(lang, 'formDesc')}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label className="label" htmlFor="namaJenama">{t(lang, 'brandName')}</label>
          <input
            className="input-field"
            type="text"
            id="namaJenama"
            name="namaJenama"
            placeholder={t(lang, 'brandNamePlaceholder')}
            value={data.namaJenama}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
            {t(lang, 'brandNameDesc')}
          </p>
        </div>
        
        <div>
          <label className="label" htmlFor="jenisProduk">{t(lang, 'productType')}</label>
          <input
            className="input-field"
            type="text"
            id="jenisProduk"
            name="jenisProduk"
            placeholder={t(lang, 'productTypePlaceholder')}
            value={data.jenisProduk}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="targetCustomer">{t(lang, 'targetCustomer')}</label>
          <input
            className="input-field"
            type="text"
            id="targetCustomer"
            name="targetCustomer"
            placeholder={t(lang, 'targetCustomerPlaceholder')}
            value={data.targetCustomer}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="harga">{t(lang, 'price')}</label>
          <input
            className="input-field"
            type="text"
            id="harga"
            name="harga"
            placeholder={t(lang, 'pricePlaceholder')}
            value={data.harga}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
            {t(lang, 'priceTip')}
          </p>
        </div>



        <div>
          <label className="label" htmlFor="masalahCustomer">{t(lang, 'problem')}</label>
          <textarea
            className="input-field"
            id="masalahCustomer"
            name="masalahCustomer"
            placeholder={t(lang, 'problemPlaceholder')}
            rows={3}
            value={data.masalahCustomer}
            onChange={handleChange}
            required
            disabled={isLoading}
          ></textarea>
        </div>

        <div>
          <label className="label" htmlFor="ciriKeunikan">{t(lang, 'uniqueFeature')}</label>
          <textarea
            className="input-field"
            id="ciriKeunikan"
            name="ciriKeunikan"
            placeholder={t(lang, 'uniqueFeaturePlaceholder')}
            rows={3}
            value={data.ciriKeunikan}
            onChange={handleChange}
            disabled={isLoading}
          ></textarea>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
            {t(lang, 'uniqueFeatureTip')}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="tawaran">{t(lang, 'offer')}</label>
          <input
            className="input-field"
            type="text"
            id="tawaran"
            name="tawaran"
            placeholder={t(lang, 'offerPlaceholder')}
            value={data.tawaran}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
            {t(lang, 'offerTip')}
          </p>
        </div>

        <div>
          <label className="label">{t(lang, 'cta')}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {['Sila WhatsApp', 'Klik Link Di Bio', 'Layari Laman Web', 'Hubungi Kami', 'Datang ke Premis'].map((type) => (
              <label key={type} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: data.ctaType === type ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-secondary)',
                border: `1px solid ${data.ctaType === type ? 'var(--primary)' : 'var(--border)'}`,
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s ease'
              }}>
                <input 
                  type="radio" 
                  name="ctaType" 
                  value={type} 
                  checked={data.ctaType === type}
                  onChange={(e) => onChange({ ...data, ctaType: e.target.value })}
                  style={{ accentColor: 'var(--primary)' }}
                />
                {type}
              </label>
            ))}
          </div>
          <input
            className="input-field"
            type="text"
            name="ctaValue"
            placeholder={t(lang, 'ctaPlaceholder')}
            value={data.ctaValue || ''}
            onChange={handleChange}
            style={{ marginTop: '12px' }}
            disabled={isLoading}
          />
          {data.ctaType === 'Datang ke Premis' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
              {t(lang, 'ctaTip')}
            </p>
          )}
        </div>

        {/* ─── Optional Image Upload ─── */}
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={14} />
            {t(lang, 'imageUpload')}
            <span style={{ 
              background: 'rgba(155, 81, 224, 0.15)', 
              color: '#C084FC', 
              padding: '2px 8px', 
              borderRadius: '999px', 
              fontSize: '0.7rem', 
              fontWeight: 600 
            }}>
              {t(lang, 'imageUploadOption')}
            </span>
          </label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', marginBottom: '8px' }}>
            {t(lang, 'imageUploadDesc')}
          </p>

          {imagePreview ? (
            /* Preview uploaded image */
            <div style={{ 
              position: 'relative', 
              display: 'inline-block', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              border: '2px solid rgba(155, 81, 224, 0.4)',
              maxWidth: '200px'
            }}>
              <img 
                src={imagePreview} 
                alt="Product preview" 
                style={{ width: '100%', height: 'auto', display: 'block' }} 
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'rgba(225, 29, 72, 0.9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <X size={14} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '8px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#C084FC', fontWeight: 600 }}>
                  ✓ Gambar akan dijadikan poster
                </span>
              </div>
            </div>
          ) : (
            /* Upload dropzone */
            <div
              onClick={() => !isLoading && fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(155, 81, 224, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(155, 81, 224, 0.03)',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.borderColor = 'rgba(155, 81, 224, 0.6)';
                  (e.target as HTMLElement).style.background = 'rgba(155, 81, 224, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = 'rgba(155, 81, 224, 0.3)';
                (e.target as HTMLElement).style.background = 'rgba(155, 81, 224, 0.03)';
              }}
            >
              <Upload size={24} style={{ color: '#9B51E0', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Klik untuk muat naik gambar produk
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
                JPG, PNG, WEBP · Maks 5MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading}
          style={{ marginTop: '10px' }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 className="spinner" size={20} />
                <span style={{ fontWeight: 'bold' }}>{t(lang, 'genWaitTitle')}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.9 }}>
                {t(lang, 'genWaitDesc')}
              </span>
            </div>
          ) : (
            <>
              <Sparkles size={20} />
              {t(lang, 'genButton')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
