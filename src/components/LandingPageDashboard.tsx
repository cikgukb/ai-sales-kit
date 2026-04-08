import React, { useRef, useState } from 'react';
import { Download, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import type { LandingPageResponse } from '../lib/aiClient';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type LandingPageDashboardProps = {
  data: LandingPageResponse;
};

const AccordionItem = ({ 
  title, 
  children, 
  defaultOpen = false,
  forceOpen = false,
  titleColor = 'var(--text-main)'
}: { 
  title: string, 
  children: React.ReactNode, 
  defaultOpen?: boolean,
  forceOpen?: boolean,
  titleColor?: string
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const actuallyOpen = forceOpen || isOpen;

  return (
    <div style={{ marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <button
        onClick={() => !forceOpen && setIsOpen(!isOpen)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'transparent', border: 'none', cursor: forceOpen ? 'default' : 'pointer', color: titleColor, fontWeight: 600, fontSize: '1.1rem' }}
      >
        {title}
        {!forceOpen && (actuallyOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
      </button>
      {actuallyOpen && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: '16px' }}>{children}</div>
        </div>
      )}
    </div>
  );
};

export default function LandingPageDashboard({ data }: LandingPageDashboardProps) {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!pdfContentRef.current) return;
    setIsExporting(true);

    try {
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await wait(500); // Tunggu re-render selesai
      
      const element = pdfContentRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number], // Margin agak kecil supaya muat
        filename: 'Landing-Page-Copywriting.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().from(element).set(opt).save();

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Gagal menjana PDF. Sila cuba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = `LAPORAN LANDING PAGE COPYWRITING

1. HEADLINE & HOOK
 Headline: ${data.sectionA.headline}
 Hook: ${data.sectionA.hook}

2. KESAKITAN PELANGGAN
 Masalah Utama: ${data.sectionB.problem}
 Tekan Kesakitan: ${data.sectionB.pain}
 Perbandingan Penyelesaian: ${data.sectionB.solutionContrast}

3. KREDIBILITI & BUKTI
 ${data.sectionC.proofAndTrust}

4. CARA BERFUNGSI
 ${data.sectionD.mechanism}

5. TAWARAN & BONUS
 Produk Utama: ${data.sectionE.mainProduct}
 Bonus:
 ${data.sectionE.bonuses.map(b => `- ${b}`).join('\n ')}
 Insentif Tambahan: ${data.sectionE.specialIncentive}
 Value Stacking: ${data.sectionE.valueStacking}

6. CTA, URGENCY & RISK REVERSAL
 CTA: ${data.sectionF.cta}
 Taktik Scarcity: ${data.sectionF.scarcityAngle}
 Urgency: ${data.sectionF.urgencyLine}
 Risk Reversal: ${data.sectionF.riskReversal}

7. JAWAB BANTAHAN
 ${data.bonusSection.objectionHandling}`;

    navigator.clipboard.writeText(textToCopy);
    alert('✅ Salinan Teks Berjaya! Boleh terus tampal (paste) ke Word / browser lain.');
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 }}>{children}</h4>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <p style={{ marginBottom: '16px', lineHeight: 1.6, color: 'var(--text-main)' }}>{children}</p>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {!isExporting && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
          <button onClick={handleCopyText} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Copy size={18} /> Salin Teks Format
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Muat Turun Report (PDF)
          </button>
        </div>
      )}

      {/* Konten Report Utama */}
      <div 
        ref={pdfContentRef}
        style={{ 
          background: isExporting ? '#0f172a' : 'transparent', 
          color: isExporting ? '#f8fafc' : 'inherit', 
          padding: isExporting ? '20px' : '0' 
        }}
        className={isExporting ? 'exporting-pdf' : ''}
      >
        {isExporting && (
           <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
             <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>Laporan Landing Page Copywriting</h1>
             <p style={{ color: '#94a3b8', marginTop: '8px' }}>Janaan AI Sales Kit (Kerangka Conversion)</p>
           </div>
        )}

        {/* Section A: Headline & Hook */}
        <AccordionItem title="1. Headline & Hook (Tarik Perhatian)" titleColor="#ec4899" defaultOpen={true} forceOpen={isExporting}>
          <SectionTitle>Headline (Utama)</SectionTitle>
          <Paragraph><strong>{data.sectionA.headline}</strong></Paragraph>
          
          <SectionTitle>Hook (Emosi Pertama)</SectionTitle>
          <Paragraph>{data.sectionA.hook}</Paragraph>
        </AccordionItem>

        {/* Section B: Problem & Pain */}
        <AccordionItem title="2. Kesakitan Pelanggan (Pain & Problem)" titleColor="#a855f7" defaultOpen={true} forceOpen={isExporting}>
          <SectionTitle>Masalah Utama</SectionTitle>
          <Paragraph>{data.sectionB.problem}</Paragraph>
          
          <SectionTitle>Tekan Kesakitan (Agitation)</SectionTitle>
          <Paragraph>{data.sectionB.pain}</Paragraph>
          
          <SectionTitle>Perbandingan Penyelesaian</SectionTitle>
          <Paragraph>{data.sectionB.solutionContrast}</Paragraph>
        </AccordionItem>

        {/* Section C: Social Proof */}
        <AccordionItem title="3. Kredibiliti & Bukti (Proof)" titleColor="#3b82f6" forceOpen={isExporting}>
          <Paragraph>{data.sectionC.proofAndTrust}</Paragraph>
        </AccordionItem>

        {/* Section D: Mechanism */}
        <AccordionItem title="4. Cara Modul/Sistem Berfungsi" titleColor="#10b981" forceOpen={isExporting}>
          <Paragraph>{data.sectionD.mechanism}</Paragraph>
        </AccordionItem>

        {/* Section E: Offer & Value Stacking */}
        <AccordionItem title="5. Tawaran & Bonus (Value Stacking)" titleColor="#f59e0b" defaultOpen={true} forceOpen={isExporting}>
          <SectionTitle>Produk Utama (High Value)</SectionTitle>
          <Paragraph>{data.sectionE.mainProduct}</Paragraph>
          
          <SectionTitle>Senarai Bonus</SectionTitle>
          <div style={{ marginBottom: '16px' }}>
            {data.sectionE.bonuses.map((bonus, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{bonus}</span>
              </div>
            ))}
          </div>

          <SectionTitle>Insentif Tambahan</SectionTitle>
          <Paragraph>{data.sectionE.specialIncentive}</Paragraph>

          <SectionTitle>Value Stacking (Ringkasan Nilai)</SectionTitle>
          <Paragraph>{data.sectionE.valueStacking}</Paragraph>
        </AccordionItem>

        {/* Section F: CTA & Urgency */}
        <AccordionItem title="6. CTA, Urgency & Risk Reversal" titleColor="#ef4444" defaultOpen={true} forceOpen={isExporting}>
          <SectionTitle>Call To Action (CTA)</SectionTitle>
          <Paragraph><strong>{data.sectionF.cta}</strong></Paragraph>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <SectionTitle><span style={{ color: '#ef4444' }}>Taktik Scarcity</span></SectionTitle>
              <Paragraph>{data.sectionF.scarcityAngle}</Paragraph>
              <Paragraph><i>{data.sectionF.urgencyLine}</i></Paragraph>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <SectionTitle><span style={{ color: '#10b981' }}>Risk Reversal (Jaminan)</span></SectionTitle>
              <Paragraph>{data.sectionF.riskReversal}</Paragraph>
            </div>
          </div>
        </AccordionItem>

        {/* Section Bonus: Bantahan */}
        <AccordionItem title="7. Jawab Bantahan (Objection Handling)" titleColor="#6366f1" forceOpen={isExporting}>
          <Paragraph>{data.bonusSection.objectionHandling}</Paragraph>
        </AccordionItem>

      </div>
    </div>
  );
}
