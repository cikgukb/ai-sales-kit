import React, { useState } from 'react';
import type { AdsStrategyResponse } from '../lib/aiClient';
import { Lightbulb, Target, ArrowRightCircle, Calendar, ChevronDown, ChevronUp, Download, Copy } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type AdsStrategyDashboardProps = {
  data: AdsStrategyResponse;
};

// Accordion Item Component
function AccordionItem({ title, icon, children, defaultOpen = false, forceOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; forceOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const actuallyOpen = isOpen || forceOpen;

  return (
    <div className="glass-panel output-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          background: isOpen ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-main)',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
          {icon} {title}
        </span>
        {actuallyOpen ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
      </button>
      
      {actuallyOpen && (
        <div style={{ padding: '20px', borderTop: '1px dashed var(--border)' }} className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdsStrategyDashboard({ data }: AdsStrategyDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Helper renderer
  const renderAdCopy = (title: string, copy: any, iconColor: string) => {
    return (
      <div style={{ background: 'var(--bg-secondary)', borderLeft: `4px solid ${iconColor}`, borderRadius: '0 8px 8px 0', padding: '16px', marginBottom: '16px' }}>
        <h4 style={{ color: iconColor, marginBottom: '12px', fontSize: '1.1rem' }}>{title}</h4>
        <div style={{ marginBottom: '8px' }}><b>Hook:</b> <span style={{ opacity: 0.9 }}>{copy.hook}</span></div>
        <div style={{ marginBottom: '8px' }}><b>Body:</b> <span style={{ opacity: 0.9 }}>{copy.body}</span></div>
        <div style={{ marginBottom: '8px' }}><b>CTA:</b> <span style={{ opacity: 0.9 }}>{copy.cta}</span></div>
        <div style={{ marginBottom: '8px' }}><b>Visual Suggestion:</b> <span style={{ opacity: 0.9 }}>{copy.visualSuggestion}</span></div>
        <div><span className="badge" style={{ margin: 0, marginTop: '8px' }}>Target: {copy.awareness}</span></div>
      </div>
    );
  };

  const renderPhase = (phaseInfo: any, iconColor: string) => {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h4 style={{ color: iconColor, marginBottom: '12px', fontSize: '1.1rem' }}>{phaseInfo.phase}</h4>
        {phaseInfo.audience && <div style={{ marginBottom: '4px' }}><b>Audience:</b> {phaseInfo.audience}</div>}
        {phaseInfo.advantagePlus && <div style={{ marginBottom: '4px' }}><b>Advantage+:</b> {phaseInfo.advantagePlus}</div>}
        {phaseInfo.budget && <div style={{ marginBottom: '4px' }}><b>Budget:</b> {phaseInfo.budget}</div>}
        {phaseInfo.trigger && <div style={{ marginBottom: '4px' }}><b>Trigger:</b> {phaseInfo.trigger}</div>}
        {phaseInfo.requirement && <div style={{ marginBottom: '4px' }}><b>Requirement:</b> {phaseInfo.requirement}</div>}
        
        {phaseInfo.kpi && (
          <div style={{ marginTop: '8px' }}>
            <b>KPI to Monitor:</b>
            <ul style={{ marginLeft: '20px', marginTop: '4px', opacity: 0.9 }}>
              {phaseInfo.kpi.map((k: string, i: number) => <li key={i}>{k}</li>)}
            </ul>
          </div>
        )}

        {phaseInfo.actions && (
          <div style={{ marginTop: '8px' }}>
            <b>Actions:</b>
            <ul style={{ marginLeft: '20px', marginTop: '4px', opacity: 0.9 }}>
              {phaseInfo.actions.map((a: string, i: number) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </div>
    )
  };

  const renderScenario = (scenario: any, idx: number) => {
    return (
      <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h4 style={{ color: 'var(--accent)', marginBottom: '8px', fontSize: '1.05rem' }}>Scenario {idx + 1}: {scenario.situation}</h4>
        <div style={{ marginBottom: '8px' }}><b>Meaning:</b> <span style={{ opacity: 0.9 }}>{scenario.meaning}</span></div>
        <div style={{ marginTop: '8px' }}>
          <b>Action Plan:</b>
          <ul style={{ marginLeft: '20px', marginTop: '4px', opacity: 0.9 }}>
            {scenario.action.map((ac: string, i: number) => <li key={i}>{ac}</li>)}
          </ul>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    // Give React time to render all accordions (since state update is async)
    setTimeout(async () => {
      const element = document.getElementById('ads-strategy-wrapper');
      if (!element) {
        setIsExporting(false);
        return;
      }
      const buttons = element.querySelectorAll('button');
      // Hide buttons gracefully
      buttons.forEach(b => b.style.opacity = '0');

      const opt = {
        margin: 10,
        filename: 'Ads_Creative_And_Strategy_Report.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().from(element).set(opt).save();

      // Restore
      buttons.forEach(b => b.style.opacity = '1');
      setIsExporting(false);
    }, 300);
  };

  const handleCopyText = () => {
    const textToCopy = `ADS CREATIVE & STRATEGY REPORT

--- SECTION A: ADS CREATIVE ---

1. Ad Type 1: Pain-Based
Hook: ${data.sectionA.painBased.hook}
Body: ${data.sectionA.painBased.body}
CTA: ${data.sectionA.painBased.cta}
Visual: ${data.sectionA.painBased.visualSuggestion}

2. Ad Type 2: Curiosity / AI Angle
Hook: ${data.sectionA.curiosityBased.hook}
Body: ${data.sectionA.curiosityBased.body}
CTA: ${data.sectionA.curiosityBased.cta}
Visual: ${data.sectionA.curiosityBased.visualSuggestion}

3. Ad Type 3: Proof-Based
Hook: ${data.sectionA.proofBased.hook}
Body: ${data.sectionA.proofBased.body}
CTA: ${data.sectionA.proofBased.cta}
Visual: ${data.sectionA.proofBased.visualSuggestion}

--- SECTION B: ADS STRATEGY (EXECUTION) ---

FASA 1: ${data.sectionB.phase1.phase}
Audience: ${data.sectionB.phase1.audience}
Advantage+: ${data.sectionB.phase1.advantagePlus}
Budget: ${data.sectionB.phase1.budget}
KPI: ${data.sectionB.phase1.kpi?.join(', ')}

FASA 2: ${data.sectionB.phase2.phase}
Trigger: ${data.sectionB.phase2.trigger}
Actions:
${data.sectionB.phase2.actions?.map(a => '- ' + a).join('\n ')}

FASA 3: ${data.sectionB.phase3.phase}
Requirement: ${data.sectionB.phase3.requirement}
Actions:
${data.sectionB.phase3.actions?.map(a => '- ' + a).join('\n ')}

--- ACTION TIMELINE ---
Day 1-3: ${data.timeline.day1to3?.join(' | ') || ''}
Day 4-7: ${data.timeline.day4to7?.join(' | ') || ''}
Week 2: ${data.timeline.week2?.join(' | ') || ''}

--- IF-THEN SCENARIOS ---
${data.sectionC.scenarios?.map((s, i) => `Senario ${i+1}: ${s.situation}\nMakna: ${s.meaning}\nTindakan:\n${s.action.map(a => '- ' + a).join('\n')}`).join('\n\n') || ''}
`;

    navigator.clipboard.writeText(textToCopy);
    alert('✅ Salinan Teks Berjaya! Boleh terus tampal (paste) ke Word / browser lain.');
  };

  return (
    <div id="ads-strategy-wrapper" className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '8px' }}>
        <button 
          onClick={handleCopyText} 
          className="btn-outline" 
          style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Copy size={18} /> Salin Teks Format
        </button>
        <button 
          onClick={handleDownloadPdf} 
          className="btn-primary" 
          style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={18} /> {isExporting ? 'Menjana PDF...' : 'Muat Turun Report Penuh (PDF)'}
        </button>
      </div>

      {/* SECTION A: Ads Creative */}
      <AccordionItem forceOpen={isExporting} title="SECTION A: Ads Creative" icon={<Lightbulb />}>
        {renderAdCopy('Ad Type 1: Pain-Based', data.sectionA.painBased, '#E11D48')}
        {renderAdCopy('Ad Type 2: Curiosity / AI Angle', data.sectionA.curiosityBased, '#9B51E0')}
        {renderAdCopy('Ad Type 3: Proof-Based', data.sectionA.proofBased, '#10B981')}
      </AccordionItem>

      {/* SECTION B: Ads Strategy (Execution Plan) */}
      <AccordionItem forceOpen={isExporting} title="SECTION B: Ads Strategy (Execution Plan)" icon={<Target />}>
        {renderPhase(data.sectionB.phase1, '#00F0FF')}
        {renderPhase(data.sectionB.phase2, '#FFC107')}
        {renderPhase(data.sectionB.phase3, '#10B981')}
      </AccordionItem>

      {/* SECTION C: What To Do Next (Scenario Engine + Timeline) */}
      <AccordionItem forceOpen={isExporting} title="SECTION C: What To Do Next (Scenarios & Timeline)" icon={<ArrowRightCircle />}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>Action Timeline</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}><Calendar size={16}/> Day 1 - 3</div>
              <ul style={{ marginLeft: '20px', fontSize: '0.9rem', opacity: 0.9 }}>{data.timeline.day1to3?.map((v, i) => <li key={i}>{v}</li>)}</ul>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}><Calendar size={16}/> Day 4 - 7</div>
              <ul style={{ marginLeft: '20px', fontSize: '0.9rem', opacity: 0.9 }}>{data.timeline.day4to7?.map((v, i) => <li key={i}>{v}</li>)}</ul>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}><Calendar size={16}/> Week 2</div>
              <ul style={{ marginLeft: '20px', fontSize: '0.9rem', opacity: 0.9 }}>{data.timeline.week2?.map((v, i) => <li key={i}>{v}</li>)}</ul>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>If-Then Scenarios</h3>
          {data.sectionC.scenarios?.map((s, idx) => renderScenario(s, idx))}
        </div>
      </AccordionItem>

    </div>
  );
}
