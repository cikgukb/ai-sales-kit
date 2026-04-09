import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';

type ProgressStep = {
  icon: string;
  label: string;
  duration: number; // ms to stay on this step
};

type LoadingProgressProps = {
  type: 'sales-kit' | 'ads-strategy' | 'landing-page';
};

const STEPS: Record<string, ProgressStep[]> = {
  'sales-kit': [
    { icon: '🧠', label: 'Menganalisis maklumat produk...', duration: 3000 },
    { icon: '✍️', label: 'Menulis copywriting iklan...', duration: 7000 },
    { icon: '💬', label: 'Menyusun skrip WhatsApp...', duration: 6000 },
    { icon: '📋', label: 'Menjana pelan tindakan 24 jam...', duration: 5000 },
    { icon: '🎨', label: 'Mencipta prompt poster AI...', duration: 4000 },
    { icon: '✨', label: 'Menggilap hasil akhir...', duration: 30000 },
  ],
  'ads-strategy': [
    { icon: '🧠', label: 'Menganalisis produk & audience...', duration: 3000 },
    { icon: '🎯', label: 'Membina strategi Pain-Based...', duration: 6000 },
    { icon: '📊', label: 'Merancang fasa kempen ads...', duration: 6000 },
    { icon: '🔍', label: 'Menyusun panduan analisis data...', duration: 5000 },
    { icon: '📅', label: 'Menjana timeline pelaksanaan...', duration: 4000 },
    { icon: '✨', label: 'Menggilap hasil akhir...', duration: 30000 },
  ],
  'landing-page': [
    { icon: '🧠', label: 'Menganalisis produk & tawaran...', duration: 3000 },
    { icon: '🎯', label: 'Menulis headline & hook...', duration: 5000 },
    { icon: '😰', label: 'Membina Problem-Agitate section...', duration: 5000 },
    { icon: '💎', label: 'Menyusun offer & value stacking...', duration: 6000 },
    { icon: '🚀', label: 'Menjana CTA & urgency...', duration: 4000 },
    { icon: '✨', label: 'Menggilap hasil akhir...', duration: 30000 },
  ],
};

export default function LoadingProgress({ type }: LoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const steps = STEPS[type];

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(prev => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate which step we should be on based on elapsed time
    let accumulated = 0;
    for (let i = 0; i < steps.length; i++) {
      accumulated += steps[i].duration;
      if (elapsedMs < accumulated) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(steps.length - 1);
  }, [elapsedMs, steps]);

  // Calculate progress within current step
  let stepStart = 0;
  for (let i = 0; i < currentStep; i++) {
    stepStart += steps[i].duration;
  }
  const stepProgress = Math.min(
    ((elapsedMs - stepStart) / steps[currentStep].duration) * 100,
    100
  );

  // Overall progress (cap at 95% — only hit 100% when API returns)
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const overallProgress = Math.min((elapsedMs / totalDuration) * 95, 95);

  const totalSeconds = Math.floor(elapsedMs / 1000);

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(0, 240, 255, 0.15)',
      borderRadius: '16px',
      padding: '28px 24px',
      maxWidth: '480px',
      margin: '0 auto',
      animation: 'fadeIn 0.4s ease'
    }}>
      {/* Overall progress bar */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '99px',
        height: '6px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          borderRadius: '99px',
          background: 'linear-gradient(90deg, #00f0ff, #7c3aed)',
          width: `${overallProgress}%`,
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: isActive ? 'rgba(0, 240, 255, 0.06)' : 'transparent',
                opacity: isPending ? 0.35 : 1,
                transition: 'all 0.4s ease'
              }}
            >
              {/* Icon / check */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                background: isDone
                  ? 'rgba(34, 197, 94, 0.15)'
                  : isActive
                    ? 'rgba(0, 240, 255, 0.1)'
                    : 'rgba(255,255,255,0.04)',
                border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                flexShrink: 0,
                transition: 'all 0.3s ease'
              }}>
                {isDone ? (
                  <CheckCircle2 size={16} color="#22c55e" />
                ) : isActive ? (
                  <Loader2 size={16} color="#00f0ff" className="spinner" />
                ) : (
                  <span style={{ fontSize: '0.9rem' }}>{step.icon}</span>
                )}
              </div>

              {/* Label */}
              <span style={{
                fontSize: '0.875rem',
                color: isDone ? '#22c55e' : isActive ? '#00f0ff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                transition: 'color 0.3s ease'
              }}>
                {isDone ? step.label.replace('...', ' ✓') : step.label}
              </span>

              {/* Step progress bar for active step */}
              {isActive && (
                <div style={{
                  marginLeft: 'auto',
                  width: '40px',
                  height: '3px',
                  borderRadius: '99px',
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '99px',
                    background: '#00f0ff',
                    width: `${stepProgress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timer & tip */}
      <div style={{
        marginTop: '18px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={12} />
          AI sedang bekerja keras untuk anda
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'rgba(0, 240, 255, 0.6)',
          fontFamily: 'monospace'
        }}>
          {totalSeconds}s
        </span>
      </div>
    </div>
  );
}
