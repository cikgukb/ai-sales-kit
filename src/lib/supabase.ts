import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export type SalesKitData = {
  id?: string;
  created_at?: string;
  jenis_produk: string;
  target_customer: string;
  harga: string;
  masalah_customer: string;
  gambar_url?: string;
  copywriting?: string;
  whatsapp_script?: string;
  action_plan?: string;
};

export const saveToDatabase = async (data: SalesKitData) => {
  if (!supabase) {
    console.warn("Supabase keys not configured, skipping save.");
    return null;
  }
  
  const { data: result, error } = await supabase
    .from('sales_kit_generations')
    .insert([data])
    .select();
    
  if (error) {
    console.error("Error saving to Supabase:", error);
    throw error;
  }
  
  return result;
};

export const fetchUserHistory = async () => {
  if (!supabase) return [];
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data, error } = await supabase
    .from('sales_kit_generations')
    .select('*')
    // Option: if user_id is saved implicitly via RLS, we just select
    // However, if RLS is strict, we just fetch.
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }
  
  return data as SalesKitData[];
};
