import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bljwwmouhxvkekrrvcpa.supabase.co';
const supabaseAnonKey = 'sb_publishable_UBsJHfKraE2HuZhOwSKSbg_W7tqkDpU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
