
import { createClient } from '@supabase/supabase-js';

// These should ideally be in .env variables, but we'll hardcode them as requested for stability
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
