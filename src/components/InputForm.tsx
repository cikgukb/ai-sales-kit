import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import type { SalesInput } from '../lib/aiClient';

type InputFormProps = {
  onSubmit: (data: SalesInput) => void;
  isLoading: boolean;
};

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<Omit<SalesInput, 'userImage'>>({
    jenisProduk: '',
    targetCustomer: '',
    harga: '',
    masalahCustomer: '',
    ctaType: 'Sila WhatsApp',
    ctaValue: ''
  });
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
    if (!formData.jenisProduk) return;
    onSubmit({ ...formData, userImage });
  };

  return (
    <div className="glass-panel w-full max-w-2xl mx-auto">
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>Maklumat Bisnes Anda</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Isi 4 maklumat penting ini dan AI kami akan jana Kit Sales pertama anda.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label className="label" htmlFor="jenisProduk">Jenis Produk / Servis</label>
          <input
            className="input-field"
            type="text"
            id="jenisProduk"
            name="jenisProduk"
            placeholder="Contoh: Kopi Kurus Ais, Tudung Bawal Anti Kedut"
            value={formData.jenisProduk}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="targetCustomer">Target Customer (Siapa nak beli?)</label>
          <input
            className="input-field"
            type="text"
            id="targetCustomer"
            name="targetCustomer"
            placeholder="Contoh: Wanita bekerjaya 30-40an yang busy"
            value={formData.targetCustomer}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="label" htmlFor="harga">Harga Produk / Services</label>
          <input
            className="input-field"
            type="text"
            id="harga"
            name="harga"
            placeholder="Contoh: RM50 (Letak '0' jika tidak mahu tunjuk harga)"
            value={formData.harga}
            onChange={handleChange}
            disabled={isLoading}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
            Tip: Kosongkan atau letak '0' jika anda tidak mahu harga dipaparkan pada poster.
          </p>
        </div>

        <div>
          <label className="label">Cara Call to Action (CTA)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {['Sila WhatsApp', 'Klik Link Di Bio', 'Layari Laman Web', 'Hubungi Kami', 'Datang ke Premis'].map((type) => (
              <label key={type} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: formData.ctaType === type ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-secondary)',
                border: `1px solid ${formData.ctaType === type ? 'var(--primary)' : 'var(--border)'}`,
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
                  checked={formData.ctaType === type}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaType: e.target.value }))}
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
            placeholder={
              formData.ctaType === 'Sila WhatsApp' ? 'Contoh: +60123456789' : 
              formData.ctaType === 'Layari Laman Web' ? 'Contoh: www.bisnesanda.com' :
              formData.ctaType === 'Datang ke Premis' ? 'Contoh: Taip [NAMA KEDAI] di Google Maps' :
              'Masukkan detail akaun/nombor/link di sini'
            }
            value={formData.ctaValue || ''}
            onChange={handleChange}
            style={{ marginTop: '12px' }}
            disabled={isLoading}
          />
          {formData.ctaType === 'Datang ke Premis' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
              Tip: Elakkan alamat terlalu panjang. Cukup sekadar nama tempat atau arahan carian Maps.
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="masalahCustomer">Masalah Utama Customer</label>
          <textarea
            className="input-field"
            id="masalahCustomer"
            name="masalahCustomer"
            placeholder="Contoh: Susah turun berat lepas bersalin, takde masa nak bersenam"
            rows={3}
            value={formData.masalahCustomer}
            onChange={handleChange}
            required
            disabled={isLoading}
          ></textarea>
        </div>

        {/* ─── Optional Image Upload ─── */}
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ImageIcon size={14} />
            Gambar Produk Anda
            <span style={{ 
              background: 'rgba(155, 81, 224, 0.15)', 
              color: '#C084FC', 
              padding: '2px 8px', 
              borderRadius: '999px', 
              fontSize: '0.7rem', 
              fontWeight: 600 
            }}>
              PILIHAN
            </span>
          </label>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', marginBottom: '8px' }}>
            Muat naik gambar produk anda dan AI akan ubahnya menjadi poster iklan profesional. Jika tiada, poster akan dijana automatik.
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
            <>
              <Loader2 className="spinner" size={20} />
              Menjana Kit Sales & Poster... Sila Tunggu
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Jana Sales Kit & Poster Sekarang
            </>
          )}
        </button>
      </form>
    </div>
  );
}
