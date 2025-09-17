
import { createClient } from '@supabase/supabase-js';

// --- BACKEND CONNECTED ---
// The Supabase client is now configured with your project credentials.
// The application will now use this client for authentication and database operations.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// The export is now a functional Supabase client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);