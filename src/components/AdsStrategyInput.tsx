import React from 'react';
import type { AdsStrategyInput } from '../lib/aiClient';
import { Target, Lightbulb, HandCoins, Goal } from 'lucide-react';

type AdsStrategyInputProps = {
  data: AdsStrategyInput;
  onChange: (data: AdsStrategyInput) => void;
  onSubmit: (data: AdsStrategyInput) => void;
  isLoading: boolean;
};

export default function AdsStrategyInputForm({ data, onChange, onSubmit, isLoading }: AdsStrategyInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={16} color="var(--primary)" /> Produk / Servis
          </label>
          <textarea 
            className="input-field" 
            placeholder="Cth: Servis cuci karpet ke rumah / Tudung bawal anti-kedut" 
            value={data.productDescription} 
            onChange={e => onChange({...data, productDescription: e.target.value})} 
            required 
            rows={3} 
          />
        </div>

        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Target size={16} color="var(--secondary)" /> Target Audience
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Cth: Suri rumah B40 / Pekerja swasta M40" 
            value={data.targetAudience} 
            onChange={e => onChange({...data, targetAudience: e.target.value})} 
            required 
          />
        </div>

        <div>
           <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HandCoins size={16} color="var(--success)" /> Harga
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Cth: RM50 - RM100" 
            value={data.priceRange} 
            onChange={e => onChange({...data, priceRange: e.target.value})} 
            required 
          />
        </div>

        <div>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Goal size={16} color="var(--accent)" /> Objektif Kempen
          </label>
          <select 
            className="input-field" 
            value={data.objective} 
            onChange={e => onChange({...data, objective: e.target.value as any})}
          >
            <option value="Sales">Jualan Terus (Sales)</option>
            <option value="Leads">Kumpul Prospek / Database (Leads)</option>
            <option value="Traffic">Trafik ke Laman Web / Kedai Fizikal</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '10px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#000' }}></div> Menyusun Strategi...
            </div>
          ) : (
             'Jana Strategi Ads'
          )}
        </button>

      </form>
    </div>
  );
}
