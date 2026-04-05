import { useEffect, useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';
import InputForm from './components/InputForm';
import SalesDashboard from './components/SalesDashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { generateSalesKit, generateProductImage } from './lib/aiClient';
import type { SalesInput, GenerateResponse } from './lib/aiClient';
import { saveToDatabase } from './lib/supabase';
import { incrementUsage } from './lib/counter';
import './index.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showApp, setShowApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const processSalesKit = async (data: SalesInput) => {
    setIsLoading(true);
    setErrorMsg('');
    setResult(null);
    setImageUrl(undefined);
    
    try {
      const aiResult = await generateSalesKit(data);
      setResult(aiResult);
      
      if (aiResult.imagePrompt) {
        // Increment usage count locally
        incrementUsage();

        generateProductImage(aiResult.imagePrompt, data.userImage, data.posterModel)
          .then((url) => {
            setImageUrl(url);
            saveToDatabase({
              jenis_produk: data.jenisProduk,
              target_customer: data.targetCustomer,
              harga: data.harga,
              masalah_customer: data.masalahCustomer,
              copywriting: aiResult.copywriting,
              whatsapp_script: aiResult.whatsappScript,
              action_plan: aiResult.actionPlan,
              gambar_url: url
            }).catch(e => console.error("DB Save Error:", e));
          })
          .catch((err) => {
            console.error("Gagal mendapat gambar dari Replicate", err);
            saveToDatabase({
              jenis_produk: data.jenisProduk,
              target_customer: data.targetCustomer,
              harga: data.harga,
              masalah_customer: data.masalahCustomer,
              copywriting: aiResult.copywriting,
              whatsapp_script: aiResult.whatsappScript,
              action_plan: aiResult.actionPlan
            }).catch(e => console.error("DB Save Error:", e));
          });
      }
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Terdapat ralat semasa menjana kandungan.');
    } finally {
      setIsLoading(false);
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
      <div className="container relative" style={{ minHeight: '100vh', paddingTop: '2rem' }}>
        <div className="hero-glow"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <Zap color="var(--primary)" fill="var(--primary)" size={24} />
            <span className="text-gradient">AI SALES KIT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-outline" onClick={() => supabase?.auth.signOut()} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'var(--accent)', color: '#fca5a5' }}>
              Log Keluar
            </button>
            <button className="btn-outline" onClick={() => setShowApp(false)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Kembali
            </button>
          </div>
        </div>
        
        <header className="section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <h1 className="heading-xl text-gradient" style={{ marginBottom: '1rem' }}>AI Sales Kit</h1>
          <p className="text-lg">Jana bahan jualan profesional untuk perniagaan anda dalam beberapa ketika sahaja.</p>
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
                onClick={() => { setResult(null); setImageUrl(undefined); }}
              >
                <Sparkles size={16} style={{ marginRight: '8px' }} /> Jana Kit Baru
              </button>
            </div>
            <SalesDashboard data={result} imageUrl={imageUrl} />
          </div>
        )}
        <Footer />
      </div>
    );
  }


  return <LandingPage onGetAccess={() => setShowApp(true)} isLoggedIn={!!session} />;
}

export default App;
