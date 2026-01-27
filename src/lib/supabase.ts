
import { createClient } from '@supabase/supabase-js';

// These should ideally be in .env variables, but we'll hardcode them as requested for stability
const supabaseUrl = 'https://jxivchmrvtetiijdpehp.supabase.co';
const supabaseKey = 'sb_publishable_oaxumUvOAml0d5OLr_ly3A_ajG-hAXz';

export const supabase = createClient(supabaseUrl, supabaseKey);
