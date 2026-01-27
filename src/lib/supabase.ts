
import { createClient } from '@supabase/supabase-js';

// These should ideally be in .env variables, but we'll hardcode them as requested for stability
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Check your .env file.');
    // Show an alert so the user knows what's wrong even if the UI doesn't render
    alert('Critical Error: Supabase credentials missing! Please check your .env file and restart the server.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
