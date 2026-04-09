import { useEffect, useState } from 'react';
import { Zap, Sparkles, Coins, History } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import InputForm from './components/InputForm';
import SalesDashboard from './components/SalesDashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Footer from './components/Footer';
import SettingsMenu from './components/SettingsMenu';
import SessionManager from './components/SessionManager';
import LoadingProgress from './components/LoadingProgress';
import HistoryModal from './components/HistoryModal';
import AdsStrategyInputForm from './components/AdsStrategyInput';
import AdsStrategyDashboard from './components/AdsStrategyDashboard';
import LandingPageInputForm from './components/LandingPageInputForm';
import LandingPageDashboard from './components/LandingPageDashboard';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { generateSalesKit, generateProductImage, generateAdsStrategy, generateLandingPage } from './lib/aiClient';
import type { SalesInput, GenerateResponse, AdsStrategyInput, AdsStrategyResponse, LandingPageInput, LandingPageResponse } from './lib/aiClient';
import { saveToDatabase } from './lib/supabase';
import type { SalesKitData } from './lib/supabase';
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
  const [role, setRole] = useState<string>('customer');
  const [showTopUpPopup, setShowTopUpPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales-kit' | 'ads-strategy' | 'landing-page'>('sales-kit');
  const [adsResult, setAdsResult] = useState<AdsStrategyResponse | null>(null);
  const [isAdsLoading, setIsAdsLoading] = useState(false);
  const [landingPageResult, setLandingPageResult] = useState<LandingPageResponse | null>(null);
  const [isLandingPageLoading, setIsLandingPageLoading] = useState(false);

  const [salesFormData, setSalesFormData] = useState<Omit<SalesInput, 'userImage'>>({
    namaJenama: '',
    jenisProduk: '',
    targetCustomer: '',
    harga: '',
    masalahCustomer: '',
    ciriKeunikan: '',
    tawaran: '',
    ctaType: 'Sila WhatsApp',
    ctaValue: ''
  });

  const [adsFormData, setAdsFormData] = useState<AdsStrategyInput>({
    productDescription: '',
    targetAudience: '',
    priceRange: '',
    objective: 'Sales'
  });

  const [landingPageFormData, setLandingPageFormData] = useState<LandingPageInput>({
    productDescription: '',
    targetAudience: '',
    priceRange: '',
    offerDetails: ''
  });

  const handleSalesDataChange = (d: Omit<SalesInput, 'userImage'>) => {
    setSalesFormData(d);
    setAdsFormData(prev => ({
      ...prev,
      productDescription: d.jenisProduk,
      targetAudience: d.targetCustomer,
      priceRange: d.harga
    }));
    setLandingPageFormData(prev => ({
      ...prev,
      productDescription: d.jenisProduk,
      targetAudience: d.targetCustomer,
      priceRange: d.harga,
      offerDetails: d.tawaran || ''
    }));
  };

  const handleAdsDataChange = (d: AdsStrategyInput) => {
    setAdsFormData(d);
    setSalesFormData(prev => ({
      ...prev,
      jenisProduk: d.productDescription,
      targetCustomer: d.targetAudience,
      harga: d.priceRange
    }));
    setLandingPageFormData(prev => ({
      ...prev,
      productDescription: d.productDescription,
      targetAudience: d.targetAudience,
      priceRange: d.priceRange
    }));
  };

  const handleLandingPageDataChange = (d: LandingPageInput) => {
    setLandingPageFormData(d);
    setSalesFormData(prev => ({
      ...prev,
      jenisProduk: d.productDescription,
      targetCustomer: d.targetAudience,
      harga: d.priceRange,
      tawaran: d.offerDetails
    }));
    setAdsFormData(prev => ({
      ...prev,
      productDescription: d.productDescription,
      targetAudience: d.targetAudience,
      priceRange: d.priceRange
    }));
  };

  const fetchProfileData = async (userId: string) => {
    try {
      const { data } = await supabase!.from('profiles').select('credits, role').eq('id', userId).single();
      if (data) {
        setCredits(data.credits);
        setRole(data.role || 'customer');
      }
    } catch { /* ignore */ }
  };

  const resetAllStates = () => {
    setResult(null);
    setAdsResult(null);
    setImageUrl(undefined);
    setCurrentSalesData(null);
    setSalesFormData({
      namaJenama: '',
      jenisProduk: '',
      targetCustomer: '',
      harga: '',
      masalahCustomer: '',
      ciriKeunikan: '',
      tawaran: '',
      ctaType: 'Sila WhatsApp',
      ctaValue: ''
    });
    setAdsFormData({
      productDescription: '',
      targetAudience: '',
      priceRange: '',
      objective: 'Sales'
    });
    setLandingPageResult(null);
    setLandingPageFormData({
      productDescription: '',
      targetAudience: '',
      priceRange: '',
      offerDetails: ''
    });
  };

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfileData(session.user.id);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        resetAllStates();
      }
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const handleSelectHistory = (savedData: SalesKitData) => {
    setResult({
      copywriting: savedData.copywriting || '',
      whatsappScript: savedData.whatsapp_script || '',
      actionPlan: savedData.action_plan || '',
      imagePrompt: 'Prompt dari sejarah terdahulu (tidak disimpan di sistem).',
      extraFeatures: ''
    });
    setImageUrl(savedData.gambar_url);
    setCurrentSalesData({
      jenisProduk: savedData.jenis_produk,
      targetCustomer: savedData.target_customer,
      harga: savedData.harga,
      masalahCustomer: savedData.masalah_customer
    });
    setActiveTab('sales-kit');
    // Ensure we are in the app view
    setShowApp(true);
  };

  const processAdsStrategy = async (data: AdsStrategyInput) => {
    setIsAdsLoading(true);
    setErrorMsg('');
    setAdsResult(null);
    try {
      // NOTE: Make sure usage increments properly in DB if applicable
      const resp = await generateAdsStrategy(data);
      setAdsResult(resp);
      if (session?.user) fetchProfileData(session.user.id);
    } catch (e: any) {
      if (e.message && e.message.startsWith('INSUFFICIENT_CREDITS:')) {
        setShowTopUpPopup(true);
        setErrorMsg(e.message.replace('INSUFFICIENT_CREDITS:', '').trim());
      } else {
        setErrorMsg(e.message || 'Terdapat ralat semasa menjana strategi iklan.');
      }
    } finally {
      setIsAdsLoading(false);
    }
  };

  const processLandingPage = async (data: LandingPageInput) => {
    setIsLandingPageLoading(true);
    setErrorMsg('');
    setLandingPageResult(null);
    try {
      // NOTE: Make sure usage increments properly in DB if applicable
      const resp = await generateLandingPage(data);
      setLandingPageResult(resp);
      if (session?.user) fetchProfileData(session.user.id);
    } catch (e: any) {
      if (e.message && e.message.startsWith('INSUFFICIENT_CREDITS:')) {
        setShowTopUpPopup(true);
        setErrorMsg(e.message.replace('INSUFFICIENT_CREDITS:', '').trim());
      } else {
        setErrorMsg(e.message || 'Terdapat ralat semasa menjana Landing Page.');
      }
    } finally {
      setIsLandingPageLoading(false);
    }
  };

  const processSalesKit = async (data: SalesInput) => {
    setIsLoading(true);
    setErrorMsg('');
    setResult(null);
    setImageUrl(undefined);
    setCurrentSalesData(data);
    
    try {
      const aiResult = await generateSalesKit(data);
      setResult(aiResult);
      if (session?.user) fetchProfileData(session.user.id);
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
      if (session?.user) fetchProfileData(session.user.id);
      
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
        <Analytics />
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
              <button 
                className="btn-outline" 
                onClick={() => setShowHistory(true)} 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--primary)', borderColor: 'rgba(0, 240, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <History size={16} />
                Sejarah
              </button>
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button 
              className={activeTab === 'sales-kit' ? 'btn-primary' : 'btn-outline'} 
              onClick={() => setActiveTab('sales-kit')}
              style={{ padding: '8px 24px', fontSize: '1rem', borderRadius: '99px', boxShadow: 'none', transform: 'none' }}
            >
              AI Sales Kit
            </button>
            <button 
              className={activeTab === 'ads-strategy' ? 'btn-primary' : 'btn-outline'} 
              onClick={() => setActiveTab('ads-strategy')}
              style={{ padding: '8px 24px', fontSize: '1rem', borderRadius: '99px', boxShadow: 'none', transform: 'none' }}
            >
              Ads Creative & Strategy
            </button>
            <button 
              className={activeTab === 'landing-page' ? 'btn-primary' : 'btn-outline'} 
              onClick={() => setActiveTab('landing-page')}
              style={{ padding: '8px 24px', fontSize: '1rem', borderRadius: '99px', boxShadow: 'none', transform: 'none' }}
            >
              Landing Page Builder
            </button>
          </div>

          {activeTab === 'sales-kit' && (
            <>
              {!result && !isLoading && (
                <InputForm 
                  data={salesFormData} 
                  onChange={handleSalesDataChange} 
                  onSubmit={processSalesKit} 
                  isLoading={isLoading} 
                />
              )}

              {isLoading && (
                <div className="animate-fade-in">
                  <LoadingProgress type="sales-kit" />
                </div>
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
            </>
          )}

          {activeTab === 'ads-strategy' && (
            <>
              {!adsResult && !isAdsLoading && (
                <AdsStrategyInputForm 
                  data={adsFormData} 
                  onChange={handleAdsDataChange} 
                  onSubmit={processAdsStrategy} 
                  isLoading={isAdsLoading} 
                />
              )}

              {isAdsLoading && (
                <div className="animate-fade-in">
                  <LoadingProgress type="ads-strategy" />
                </div>
              )}

              {adsResult && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <button 
                      className="btn-outline" 
                      onClick={() => setAdsResult(null)}
                    >
                      <Sparkles size={16} style={{ marginRight: '8px' }} /> Jana Strategi Ads Baru
                    </button>
                  </div>
                  <AdsStrategyDashboard data={adsResult} />
                </div>
              )}
            </>
          )}

          {activeTab === 'landing-page' && (
            <>
              {!landingPageResult && !isLandingPageLoading && (
                <LandingPageInputForm 
                  data={landingPageFormData} 
                  onChange={handleLandingPageDataChange} 
                  onSubmit={processLandingPage} 
                  isLoading={isLandingPageLoading} 
                />
              )}

              {isLandingPageLoading && (
                <div className="animate-fade-in">
                  <LoadingProgress type="landing-page" />
                </div>
              )}
              
              {landingPageResult && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <button 
                      className="btn-outline" 
                      onClick={() => setLandingPageResult(null)}
                    >
                      <Sparkles size={16} style={{ marginRight: '8px' }} /> Jana Copywriting Baru
                    </button>
                  </div>
                  <LandingPageDashboard data={landingPageResult} />
                </div>
              )}
            </>
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
                   <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                     {role === 'tester' ? 'Masa Percubaan Tamat!' : 'Kredit Tidak Mencukupi!'}
                   </h2>
                   <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                     {role === 'tester' 
                       ? 'Wah, anda telah menggunakan kesemua kredit percubaan percuma anda! Sila naik taraf (upgrade) kepada Akaun Penuh (RM39) untuk terus menjana kit pemasaran.'
                       : 'Baki kredit anda telah habis atau tidak cukup untuk janaan ini. Sila tambah nilai kredit untuk menggunakan AI Sales Kit tanpa batasan.'}
                   </p>
                   <button 
                     className="btn-primary" 
                     style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                     onClick={() => {
                       alert('Integrasi Payment Gateway (Stripe/ToyyibPay) akan dimasukkan di sini.');
                     }}
                   >
                     {role === 'tester' ? '🚀 Naik Taraf ke Akaun PRO' : '🚀 Tambah Kredit Sekarang'}
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

          <HistoryModal 
            isOpen={showHistory} 
            onClose={() => setShowHistory(false)} 
            onSelectHistory={handleSelectHistory} 
          />
        </div>
      </>
    );
  }


  return (
    <>
      <Analytics />
      <LandingPage onGetAccess={() => setShowApp(true)} isLoggedIn={!!session} />
    </>
  );
}

export default App;
