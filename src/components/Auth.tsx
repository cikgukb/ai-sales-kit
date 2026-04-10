import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Beaker } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    // Check url param for invite code
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('invite') === 'RAHSIA2026') {
        setIsTester(true);
        setView('signup'); // Force signup view for invites
      }
    }
  }, []);

  const handleResendConfirmation = async () => {
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    if (!email) {
      setError("Sila masukkan emel anda dahulu.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      setError(null);
      alert("Emel pengesahan dihantar semula. Sila semak inbox/spam anda (mungkin ambil masa 1-2 minit).");
    } catch (err: any) {
      setError(err.message || "Gagal menghantar semula emel pengesahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      setLoading(false);
      return;
    }

    try {
      if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              role: isTester ? 'tester' : 'customer'
            }
          }
        });
        if (error) throw error;
        // Supabase returns data.user with empty identities[] when the email
        // already exists (obfuscated response to prevent email enumeration).
        // In that case NO confirmation email is sent — we must tell the user
        // instead of misleading them to wait for an email that never comes.
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("Emel ini sudah berdaftar. Sila log masuk di bawah. Kalau belum terima link pengesahan, klik 'Hantar semula emel pengesahan'.");
          setView('login');
          return;
        }
        alert("Pendaftaran berjaya! Sila semak emel anda (termasuk folder Spam/Junk) untuk pengesahan.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Single session tracking
        const sessionId = crypto.randomUUID();
        localStorage.setItem('local_session_id', sessionId);
        localStorage.setItem('login_time', Date.now().toString());
        localStorage.setItem('last_active_time', Date.now().toString());

        if (data.user) {
          await supabase.from('profiles').update({ active_session_id: sessionId }).eq('id', data.user.id);
        }
      }
    } catch (err: any) {
      const rawMsg = err.message || "";
      const msg = rawMsg.toLowerCase();
      if (msg.includes('email not confirmed')) {
        setError("Emel anda belum disahkan. Sila semak inbox/spam untuk link pengesahan, atau klik 'Hantar semula emel pengesahan' di bawah.");
      } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setError("Emel atau kata laluan salah. Kalau baru mendaftar, pastikan emel sudah disahkan dulu.");
      } else if (msg.includes('already registered') || msg.includes('user already')) {
        setError("Emel ini sudah berdaftar. Sila log masuk atau reset kata laluan anda.");
        setView('login');
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError("Terlalu banyak cubaan. Sila tunggu beberapa minit sebelum cuba lagi.");
      } else {
        setError(rawMsg || "Terdapat ralat semasa proses.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div className="hero-glow" style={{ width: '800px', height: '800px' }}></div>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2rem', border: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
        
        {isTester && view === 'signup' && (
          <div style={{ position: 'absolute', top: '-14px', right: '24px', background: 'var(--primary)', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(0, 240, 255, 0.3)' }}>
            <Beaker size={14} /> Beta Tester
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <Zap color="var(--primary)" fill="var(--primary)" size={32} />
          <h1 className="heading-xl text-gradient" style={{ fontSize: '2rem' }}>AI SALES KIT</h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {view === 'login' ? 'Selamat Kembali!' : 'Daftar Akaun Baru'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {view === 'login' 
              ? 'Log masuk untuk mula menjana jualan anda.' 
              : 'Sertai ribuan usahawan yang guna AI untuk buat sales.'}
          </p>
          {isTester && view === 'signup' && (
            <p style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
              Pendaftaran khas beta tester (Percubaan Terhad).
            </p>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
            {(error.toLowerCase().includes('belum disahkan') || error.toLowerCase().includes('sudah berdaftar')) && email && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary)', cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontSize: '0.875rem', padding: 0, fontWeight: 600, marginLeft: '1.5rem' }}
              >
                {loading ? 'Menghantar...' : 'Hantar semula emel pengesahan'}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {view === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="label">Nama Penuh</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ali Baba" 
                  style={{ paddingLeft: '40px' }}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Emel</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="anda@contoh.com" 
                style={{ paddingLeft: '40px' }}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="label">Kata Laluan</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                placeholder="Minima 6 karakter" 
                style={{ paddingLeft: '40px' }}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '0.5rem', width: '100%', border: 'none', cursor: 'pointer' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" /> : view === 'login' ? 'Log Masuk' : 'Daftar Sekarang'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {view === 'login' ? 'Belum ada akaun?' : 'Dah ada akaun?'}
          </span>
          <button 
            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            {view === 'login' ? 'Daftar di sini' : 'Log masuk di sini'}
          </button>
        </div>
      </div>
    </div>
  );
}
