import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// 30 min in ms
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// 24 hours in ms
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export default function SessionManager() {
  const resetTimer = useCallback(() => {
    localStorage.setItem('last_active_time', Date.now().toString());
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await supabase?.auth.signOut();
      localStorage.removeItem('local_session_id');
      localStorage.removeItem('login_time');
      localStorage.removeItem('last_active_time');
      window.location.reload();
    } catch(e) {}
  }, []);

  useEffect(() => {
    // Single session enforcer & Activity checker interval
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) return;
      
      const lastActiveRaw = localStorage.getItem('last_active_time');
      const loginTimeRaw = localStorage.getItem('login_time');
      
      const now = Date.now();
      
      // 1. Check Idle Timeout
      if (lastActiveRaw && now - parseInt(lastActiveRaw) > IDLE_TIMEOUT_MS) {
        alert("Sesi ditamatkan kerana tiada aktiviti selama 30 minit. Sila log masuk semula.");
        handleLogout();
        return;
      }
      
      // 2. Check 24 Hours Expiry
      if (loginTimeRaw && now - parseInt(loginTimeRaw) > SESSION_EXPIRY_MS) {
        alert("Sesi tamat tempoh (24 jam). Sila log masuk semula untuk keselamatan.");
        handleLogout();
        return;
      }

      // 3. Single Session Check via Supabase DB profile
      const localSessionId = localStorage.getItem('local_session_id');
      if (localSessionId && session.user.id) {
        const { data: profile } = await supabase!
          .from('profiles')
          .select('active_session_id')
          .eq('id', session.user.id)
          .single();
          
        if (profile && profile.active_session_id && profile.active_session_id !== localSessionId) {
          alert("Akaun anda telah log masuk di peranti lain. Sesi ini akan ditamatkan.");
          handleLogout();
        }
      }
      
    }, 15000); // Check every 15s

    // Auto-setup listeners for idle timeout tracking
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [handleLogout, resetTimer]);

  return null; // Component does not render anything visually
}
