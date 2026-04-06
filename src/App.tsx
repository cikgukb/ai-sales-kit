import { useEffect, useState } from 'react';
import { Zap, Sparkles, Coins } from 'lucide-react';
import InputForm from './components/InputForm';
import SalesDashboard from './components/SalesDashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Footer from './components/Footer';
import SettingsMenu from './components/SettingsMenu';
import SessionManager from './components/SessionManager';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { generateSalesKit, generateProductImage } from './lib/aiClient';
import type { SalesInput, GenerateResponse } from './lib/aiClient';
import { saveToDatabase } from './lib/supabase';
import { incrementUsage } from './lib/counter';
import { useSettings } from './lib/SettingsContext';
import { t } from './lib/i18n';
import './index.css';

function App() {
  const { lang } = useSettings();
  const [session, setSession] = useState<Session | null>(null);
  const [showApp, setShowApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentSalesData, setCurrentSalesData] = useState<SalesInput | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showTopUpPopup, setShowTopUpPopup] = useState(false);

  const fetchCredits = async (userId: string) => {
    try {
      const { data } = await supabase!.from('profiles').select('credits').eq('id', userId).single();
      if (data) setCredits(data.credits);
    } catch(e) {}
  };

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchCredits(session.user.id);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchCredits(session.user.id);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const processSalesKit = async (data: SalesInput) => {
    setIsLoading(true);
    setErrorMsg('');
    setResult(null);
    setImageUrl(undefined);
    setCurrentSalesData(data);
    
    try {
      const aiResult = await generateSalesKit(data);
      setResult(aiResult);
      if (session?.user) fetchCredits(session.user.id);
      // Wait for user to manually trigger image generation
    } catch (error: any) {
      if (error.message && error.message.startsWith('INSUFFICIENT_CREDITS:')) {
        setShowTopUpPopup(true);
        setErrorMsg(error.message.replace('INSUFFICIENT_CREDITS:', '').trim());
      } else {
        setErrorMsg(error.message || 'Terdapat ralat semasa menjana kandungan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processImageGeneration = async () => {
    if (!result?.imagePrompt || !currentSalesData) return;
    setIsGeneratingImage(true);
    
    try {
      // Increment usage count locally
      incrementUsage();

      const url = await generateProductImage(result.imagePrompt, currentSalesData.userImage, currentSalesData.posterModel);
      setImageUrl(url);
      
      saveToDatabase({
        jenis_produk: currentSalesData.jenisProduk,
        target_customer: currentSalesData.targetCustomer,
        harga: currentSalesData.harga,
        masalah_customer: currentSalesData.masalahCustomer,
        copywriting: result.copywriting,
        whatsapp_script: result.whatsappScript,
        action_plan: result.actionPlan,
        gambar_url: url
      }).catch(e => console.error("DB Save Error:", e));
      if (session?.user) fetchCredits(session.user.id);
      
    } catch (error: any) {
      console.error("Gagal mendapat gambar", error);
      if (error.message && error.message.startsWith('INSUFFICIENT_CREDITS:')) {
        setShowTopUpPopup(true);
        setErrorMsg(error.message.replace('INSUFFICIENT_CREDITS:', '').trim());
      } else {
        setErrorMsg(error.message || 'Terdapat ralat semasa menjana poster iklan.');
      }
      // Simpan without image
      saveToDatabase({
        jenis_produk: currentSalesData.jenisProduk,
        target_customer: currentSalesData.targetCustomer,
        harga: currentSalesData.harga,
        masalah_customer: currentSalesData.masalahCustomer,
        copywriting: result.copywriting,
        whatsapp_script: result.whatsappScript,
        action_plan: result.actionPlan
      }).catch(e => console.error("DB Save Error:", e));
    } finally {
      setIsGeneratingImage(false);
    }
  };


  // Simple intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((elem) => {
      observer.observe(elem);
      // initial state
      (elem as HTMLElement).style.opacity = '0';
    });

    return () => observer.disconnect();
  }, []);

  if (showApp) {
    if (!session) {
      return <Auth />;
    }
    
    return (
      <>
        <SessionManager />
        <div className="container relative" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
          <div className="hero-glow"></div>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
              <Zap color="var(--primary)" fill="var(--primary)" size={24} />
              <span className="text-gradient">{t(lang, 'aiSalesKit')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {credits !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, color: '#FFC107' }}>
                  <Coins size={16} />
                  {credits} Kredit
                </div>
              )}
              <SettingsMenu />
              <button className="btn-outline" onClick={() => supabase?.auth.signOut()} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'var(--accent)', color: '#fca5a5' }}>
                {t(lang, 'logout')}
              </button>
              <button className="btn-outline" onClick={() => setShowApp(false)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                {t(lang, 'back')}
              </button>
            </div>
          </div>
          
          <header className="section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
            <h1 className="heading-xl text-gradient" style={{ marginBottom: '1rem' }}>{t(lang, 'aiSalesKit')}</h1>
            <p className="text-lg">{t(lang, 'heroDesc')}</p>
          </header>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          {!result && (
            <InputForm onSubmit={processSalesKit} isLoading={isLoading} />
          )}

          {result && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <button 
                  className="btn-outline" 
                  onClick={() => { setResult(null); setImageUrl(undefined); setCurrentSalesData(null); }}
                >
                  <Sparkles size={16} style={{ marginRight: '8px' }} /> Jana Kit Baru
                </button>
              </div>
              <SalesDashboard 
                data={result} 
                imageUrl={imageUrl} 
                onGenerateImage={processImageGeneration}
                isGeneratingImage={isGeneratingImage}
              />
            </div>
          )}
          <Footer />

          {/* Top-up Credits Modal */}
          {showTopUpPopup && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '1rem' }}>
               <div className="glass-card" style={{ padding: '2rem', maxWidth: '420px', width: '100%', textAlign: 'center', border: '1px solid rgba(255, 193, 7, 0.4)' }}>
                   <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                     <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '16px', borderRadius: '50%' }}>
                       <Coins size={48} color="#FFC107" />
                     </div>
                   </div>
                   <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>Kredit Tidak Mencukupi!</h2>
                   <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                     Baki kredit anda telah habis atau tidak cukup untuk janaan ini. Sila tambah nilai kredit untuk menggunakan AI Sales Kit tanpa batasan.
                   </p>
                   <button 
                     className="btn-primary" 
                     style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                     onClick={() => {
                       alert('Integrasi Payment Gateway (Stripe/ToyyibPay) akan dimasukkan di sini.');
                     }}
                   >
                     🚀 Tambah Kredit Sekarang
                   </button>
                   <button 
                     className="btn-outline" 
                     style={{ width: '100%', marginTop: '0.75rem', borderColor: 'transparent', color: 'var(--text-muted)' }} 
                     onClick={() => setShowTopUpPopup(false)}
                   >
                     Tutup
                   </button>
               </div>
            </div>
          )}
        </div>
      </>
    );
  }


  return (
    <>
      <LandingPage onGetAccess={() => setShowApp(true)} isLoggedIn={!!session} />
    </>
  );
}

export default App;
