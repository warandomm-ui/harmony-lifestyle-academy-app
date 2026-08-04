import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env.local and fill in your Supabase project credentials.\n' +
    'Authentication and AI services will not work without these.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey) && !supabaseUrl.includes('placeholder');
