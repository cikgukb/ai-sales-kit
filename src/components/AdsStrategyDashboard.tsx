import React, { useState } from 'react';
import type { AdsStrategyResponse } from '../lib/aiClient';
import { Lightbulb, Target, ArrowRightCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

type AdsStrategyDashboardProps = {
  data: AdsStrategyResponse;
};

// Accordion Item Component
function AccordionItem({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
        {isOpen ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
      </button>
      
      {isOpen && (
        <div style={{ padding: '20px', borderTop: '1px dashed var(--border)' }} className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdsStrategyDashboard({ data }: AdsStrategyDashboardProps) {

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

  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
      
      {/* SECTION A: Ads Creative */}
      <AccordionItem title="SECTION A: Ads Creative" icon={<Lightbulb />}>
        {renderAdCopy('Ad Type 1: Pain-Based', data.sectionA.painBased, '#E11D48')}
        {renderAdCopy('Ad Type 2: Curiosity / AI Angle', data.sectionA.curiosityBased, '#9B51E0')}
        {renderAdCopy('Ad Type 3: Proof-Based', data.sectionA.proofBased, '#10B981')}
      </AccordionItem>

      {/* SECTION B: Ads Strategy (Execution Plan) */}
      <AccordionItem title="SECTION B: Ads Strategy (Execution Plan)" icon={<Target />}>
        {renderPhase(data.sectionB.phase1, '#00F0FF')}
        {renderPhase(data.sectionB.phase2, '#FFC107')}
        {renderPhase(data.sectionB.phase3, '#10B981')}
      </AccordionItem>

      {/* SECTION C: What To Do Next (Scenario Engine + Timeline) */}
      <AccordionItem title="SECTION C: What To Do Next (Scenarios & Timeline)" icon={<ArrowRightCircle />}>
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
