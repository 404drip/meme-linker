import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bljwwmouhxvkekrrvcpa.supabase.co';
const supabaseAnonKey = 'sb_publishable_UBsJHfKraE2HuZhOwSKSbg_W7tqkDpU';

export const createSupabaseClient = (persistSession: boolean) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: persistSession ? localStorage : sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

// Default client uses sessionStorage (no persistent login)
export let supabase = createSupabaseClient(false);

export const reinitSupabase = (persist: boolean) => {
  supabase = createSupabaseClient(persist);
  return supabase;
};
