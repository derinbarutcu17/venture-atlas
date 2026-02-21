import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http');

if (!isConfigured) {
    console.warn('Supabase credentials missing or invalid. Dashboard will operate in LOCAL FALLBACK mode.');
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
