import ReactMarkdown from 'react-markdown';
import { Copy, Download, Image as ImageIcon, MessageCircle, PenTool, CheckCircle, Smartphone, Lightbulb, BarChart3, Zap, Info } from 'lucide-react';
import type { GenerateResponse } from '../lib/aiClient';
import { useSettings } from '../lib/SettingsContext';
import { t } from '../lib/i18n';

type SalesDashboardProps = {
  data: GenerateResponse;
  imageUrl?: string;
  onGenerateImage?: () => void;
  isGeneratingImage?: boolean;
};

/* ──────────────────────────────
   HELPER: Pastikan apa-apa format jadi teks readable
   Handles: string, array, nested objects (WhatsApp scripts, action plans, etc.)
   ────────────────────────────── */
const renderSafeString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map((item, i) => {
      if (typeof item === 'string') return `${i + 1}. ${item}`;
      if (typeof item === 'object') return renderSafeString(item);
      return String(item);
    }).join('\n\n');
  }
  if (typeof val === 'object') {
    // Convert object keys into readable sections
    return Object.entries(val).map(([key, value]) => {
      // Make key more readable: camelCase/snake_case → Title Case
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
        .trim();
      
      if (typeof value === 'string') {
        return `### ${label}\n${value}`;
      }
      if (Array.isArray(value)) {
        const items = value.map((item: any, i: number) => {
          if (typeof item === 'string') return `${i + 1}. ${item}`;
          return renderSafeString(item);
        }).join('\n');
        return `### ${label}\n${items}`;
      }
      if (typeof value === 'object' && value !== null) {
        return `### ${label}\n${renderSafeString(value)}`;
      }
      return `**${label}:** ${String(value)}`;
    }).join('\n\n');
  }
  return String(val);
};

/* ──────────────────────────────
   HELPER: Parse "extraFeatures" JSON yang Claude hasilkan
   Format biasa: { tikTokIdeas: [...], headlineTest: [...], urgencyTricks: [...] }
   ────────────────────────────── */
const parseExtraFeatures = (val: any): { tikTokIdeas: string[]; headlineTest: string[]; urgencyTricks: string[] } => {
  const fallback = { tikTokIdeas: [], headlineTest: [], urgencyTricks: [] };
  if (!val) return fallback;

  // Jika sudah object
  if (typeof val === 'object' && !Array.isArray(val)) {
    return {
      tikTokIdeas: Array.isArray(val.tikTokIdeas) ? val.tikTokIdeas : (val.tiktokIdeas ? val.tiktokIdeas : []),
      headlineTest: Array.isArray(val.headlineTest) ? val.headlineTest : (val.headlineTests ? val.headlineTests : []),
      urgencyTricks: Array.isArray(val.urgencyTricks) ? val.urgencyTricks : (val.urgencyTrick ? val.urgencyTrick : []),
    };
  }

  // Jika string, cuba parse JSON
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parseExtraFeatures(parsed);
    } catch {
      // Bukan JSON, return sebagai teks biasa
      return fallback;
    }
  }

  return fallback;
};

/* ──────────────────────────────
   HELPER: Download teks sebagai fail .txt
   ────────────────────────────── */
const downloadAsText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ──────────────────────────────
   HELPER: Download gambar
   ────────────────────────────── */
const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: buka tab baru
    window.open(imageUrl, '_blank');
  }
};

/* ──────────────────────────────
   HELPER: Format extraFeatures jadi teks readable untuk download
   ────────────────────────────── */
const formatExtraFeaturesText = (parsed: { tikTokIdeas: string[]; headlineTest: string[]; urgencyTricks: string[] }): string => {
  let text = '🎬 IDEA KONTEN TIKTOK\n';
  text += '═══════════════════════\n\n';
  parsed.tikTokIdeas.forEach((idea, i) => { text += `${i + 1}. ${idea}\n\n`; });

  text += '\n📊 A/B TESTING HEADLINE\n';
  text += '═══════════════════════\n\n';
  parsed.headlineTest.forEach((h, i) => { text += `Versi ${String.fromCharCode(65 + i)}: ${h}\n\n`; });

  text += '\n⚡ TEKNIK URGENCY\n';
  text += '═══════════════════════\n\n';
  parsed.urgencyTricks.forEach((t, i) => { text += `${i + 1}. ${t}\n\n`; });

  return text;
};


/* ══════════════════════════════
   KOMPONEN UTAMA
   ══════════════════════════════ */
export default function SalesDashboard({ data, imageUrl, onGenerateImage, isGeneratingImage }: SalesDashboardProps) {
  const { lang } = useSettings();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Telah disalin ke clipboard!');
  };

  const extraParsed = parseExtraFeatures(data.extraFeatures);
  const hasStructuredExtra = extraParsed.tikTokIdeas.length > 0 || extraParsed.headlineTest.length > 0 || extraParsed.urgencyTricks.length > 0;

  return (
    <div className="dashboard-grid">
      {/* ─── 1. Poster Iklan ─── */}
      <div className="glass-panel output-card">
        <h3><ImageIcon size={20} /> {t(lang, 'posterTitle')}</h3>
        <p className="label" style={{ marginBottom: '16px' }}>
          {t(lang, 'posterDesc')}
        </p>
        
        {imageUrl ? (
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={imageUrl} alt="AI Generated Poster" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => downloadImage(imageUrl, 'poster-iklan-ai.png')} 
                className="btn-primary" 
                style={{ padding: '12px 20px', fontSize: '1rem', width: '100%', borderRadius: '10px' }}
              >
                <Download size={18} /> {t(lang, 'downloadImage')}
              </button>
            </div>

            {/* Prompt Copy Section */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Prompt Janaan Poster</span>
                <button 
                  onClick={() => handleCopy(renderSafeString(data.imagePrompt))} 
                  className="btn-outline" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Copy size={12} /> {t(lang, 'copyPrompt')}
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                "{renderSafeString(data.imagePrompt)}"
              </p>
            </div>

            {/* Disclaimer Section */}
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 193, 7, 0.08)', borderRadius: '12px', border: '1px solid rgba(255, 193, 7, 0.25)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={20} style={{ color: '#FFC107', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.85, lineHeight: 1.5, margin: 0 }}>
                {t(lang, 'disclaimerLLM' as any)}
              </p>
            </div>
          </div>
        ) : isGeneratingImage ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <LoaderFallback />
            <p className="label" style={{ marginTop: '12px', fontWeight: 600, color: 'var(--primary)' }}>
              {t(lang, 'genWaitImage')}
            </p>
            <p className="label" style={{ marginTop: '4px', fontSize: '0.8rem', opacity: 0.8 }}>
              {t(lang, 'genWaitImageDesc')}
            </p>
          </div>
        ) : (
          <div style={{ padding: '24px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            
            {/* Prompt Copy Section - Muka depan */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>Prom (Prompt) Janaan Poster</span>
                <button 
                  onClick={() => handleCopy(renderSafeString(data.imagePrompt))} 
                  className="btn-outline" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Copy size={14} /> {t(lang, 'copyPrompt')}
                </button>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.85, lineHeight: 1.6, margin: 0, fontStyle: 'italic', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                "{renderSafeString(data.imagePrompt)}"
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                💡 <b>Tip:</b> Anda boleh salin prom di atas dan gunakannya di dalam <i>image generator</i> lain jika hasil dari sistem kami tidak menepati citarasa anda.
              </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px dashed var(--border)', paddingTop: '24px' }}>
              <p className="label" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                Atau jana poster secara automatik di sini:
              </p>
              <button 
                onClick={onGenerateImage} 
                className="btn-outline" 
                style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: '10px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <ImageIcon size={20} /> {t(lang, 'btnGenImage')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. Copywriting Jualan ─── */}
      <div className="glass-panel output-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ marginBottom: 0 }}><PenTool size={20} /> {t(lang, 'copywriting')}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => handleCopy(renderSafeString(data.copywriting))} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Copy size={14} /> {t(lang, 'copy')}
            </button>
            <button onClick={() => downloadAsText(renderSafeString(data.copywriting), 'copywriting-jualan.txt')} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} /> {t(lang, 'download')}
            </button>
          </div>
        </div>
        <div className="input-field markdown-body" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <ReactMarkdown>{renderSafeString(data.copywriting)}</ReactMarkdown>
        </div>
      </div>

      {/* ─── 3. WhatsApp Script ─── */}
      <div className="glass-panel output-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ marginBottom: 0 }}><MessageCircle size={20} /> {t(lang, 'whatsappScript')}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => handleCopy(renderSafeString(data.whatsappScript))} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Copy size={14} /> {t(lang, 'copy')}
            </button>
            <button onClick={() => downloadAsText(renderSafeString(data.whatsappScript), 'skrip-whatsapp.txt')} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} /> {t(lang, 'download')}
            </button>
          </div>
        </div>
        <div className="input-field markdown-body" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <ReactMarkdown>{renderSafeString(data.whatsappScript)}</ReactMarkdown>
        </div>
      </div>

      {/* ─── 4. Action Plan ─── */}
      <div className="glass-panel output-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ marginBottom: 0 }}><CheckCircle size={20} /> {t(lang, 'actionPlan')}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => handleCopy(renderSafeString(data.actionPlan))} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Copy size={14} /> {t(lang, 'copy')}
            </button>
            <button onClick={() => downloadAsText(renderSafeString(data.actionPlan), 'pelan-tindakan-24jam.txt')} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Download size={14} /> {t(lang, 'download')}
            </button>
          </div>
        </div>
        <div className="input-field markdown-body" style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <ReactMarkdown>{renderSafeString(data.actionPlan)}</ReactMarkdown>
        </div>
      </div>

      {/* ─── 5. Extra Features: Idea TikTok & Urgency (FORMAT CANTIK) ─── */}
      <div className="glass-panel output-card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: 0 }}><Smartphone size={20} /> {t(lang, 'extraFeatures')}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => {
                const text = hasStructuredExtra ? formatExtraFeaturesText(extraParsed) : renderSafeString(data.extraFeatures);
                handleCopy(text);
              }} 
              className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Copy size={14} /> {t(lang, 'copy')}
            </button>
            <button 
              onClick={() => {
                const text = hasStructuredExtra ? formatExtraFeaturesText(extraParsed) : renderSafeString(data.extraFeatures);
                downloadAsText(text, 'idea-tiktok-urgency.txt');
              }} 
              className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Download size={14} /> {t(lang, 'download')}
            </button>
          </div>
        </div>

        {hasStructuredExtra ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* TikTok Ideas */}
            {extraParsed.tikTokIdeas.length > 0 && (
              <div style={{ 
                background: 'rgba(155, 81, 224, 0.08)', 
                border: '1px solid rgba(155, 81, 224, 0.2)', 
                borderRadius: '12px', 
                padding: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Lightbulb size={18} style={{ color: '#9B51E0' }} />
                  <h4 style={{ color: '#C084FC', fontSize: '1rem', fontWeight: 600, margin: 0 }}>🎬 Idea Konten TikTok</h4>
                </div>
                {extraParsed.tikTokIdeas.map((idea, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    marginBottom: '10px',
                    borderLeft: '3px solid #9B51E0' 
                  }}>
                    <span style={{ color: '#C084FC', fontWeight: 700, marginRight: '8px' }}>#{i + 1}</span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.9rem', lineHeight: 1.5 }}>{idea}</span>
                  </div>
                ))}
              </div>
            )}

            {/* A/B Headline Test */}
            {extraParsed.headlineTest.length > 0 && (
              <div style={{ 
                background: 'rgba(0, 240, 255, 0.05)', 
                border: '1px solid rgba(0, 240, 255, 0.15)', 
                borderRadius: '12px', 
                padding: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BarChart3 size={18} style={{ color: '#00F0FF' }} />
                  <h4 style={{ color: '#67E8F9', fontSize: '1rem', fontWeight: 600, margin: 0 }}>📊 A/B Testing Headline</h4>
                </div>
                {extraParsed.headlineTest.map((headline, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    marginBottom: '10px',
                    borderLeft: '3px solid #00F0FF' 
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #00F0FF, #0077FF)', 
                      color: '#000', 
                      fontWeight: 800, 
                      fontSize: '0.75rem',
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      marginRight: '10px' 
                    }}>
                      VERSI {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>{headline}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Urgency Tricks */}
            {extraParsed.urgencyTricks.length > 0 && (
              <div style={{ 
                background: 'rgba(225, 29, 72, 0.06)', 
                border: '1px solid rgba(225, 29, 72, 0.2)', 
                borderRadius: '12px', 
                padding: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Zap size={18} style={{ color: '#E11D48' }} />
                  <h4 style={{ color: '#FB7185', fontSize: '1rem', fontWeight: 600, margin: 0 }}>⚡ Teknik Urgency</h4>
                </div>
                {extraParsed.urgencyTricks.map((trick, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    marginBottom: '10px',
                    borderLeft: '3px solid #E11D48' 
                  }}>
                    <span style={{ color: '#FB7185', fontWeight: 700, marginRight: '8px' }}>#{i + 1}</span>
                    <span style={{ color: '#E2E8F0', fontSize: '0.9rem', lineHeight: 1.5 }}>{trick}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : (
          /* Fallback: Jika bukan JSON berstruktur, papar sebagai markdown biasa */
          <div className="input-field markdown-body">
            <ReactMarkdown>{renderSafeString(data.extraFeatures)}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* ─── 6. Download Semua Sekaligus ─── */}
      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0' }}>
        <button 
          onClick={() => {
            let fullContent = '═══════════════════════════════════════\n';
            fullContent += '   AI SALES KIT - Laporan Penuh\n';
            fullContent += '═══════════════════════════════════════\n\n';
            
            fullContent += '📝 COPYWRITING JUALAN\n';
            fullContent += '───────────────────────\n';
            fullContent += renderSafeString(data.copywriting) + '\n\n\n';
            
            fullContent += '💬 SKRIP WHATSAPP & FOLLOW-UP\n';
            fullContent += '───────────────────────\n';
            fullContent += renderSafeString(data.whatsappScript) + '\n\n\n';
            
            fullContent += '✅ PELAN TINDAKAN 24 JAM\n';
            fullContent += '───────────────────────\n';
            fullContent += renderSafeString(data.actionPlan) + '\n\n\n';
            
            fullContent += '🎬 IDEA TIKTOK & TRIGGER URGENCY\n';
            fullContent += '───────────────────────\n';
            if (hasStructuredExtra) {
              fullContent += formatExtraFeaturesText(extraParsed);
            } else {
              fullContent += renderSafeString(data.extraFeatures);
            }
            
            downloadAsText(fullContent, 'ai-sales-kit-penuh.txt');
          }} 
          className="btn-primary" 
          style={{ padding: '14px 40px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <Download size={18} /> {t(lang, 'downloadAll')}
        </button>
      </div>

    </div>
  );
}

const LoaderFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
    <div className="spinner"></div>
  </div>
);
