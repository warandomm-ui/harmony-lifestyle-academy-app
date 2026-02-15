
import { createClient } from '@supabase/supabase-js';

// Ensure these variables are set in your Netlify/Environment configuration
// Example: VITE_SUPABASE_URL=https://your-project.supabase.co
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
