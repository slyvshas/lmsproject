// ============================================================================
// Supabase Client Configuration
// ============================================================================
// This file initializes the Supabase client for authentication, database,
// storage, and real-time features.

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

/**
 * Create and export Supabase client instance
 * Configured with automatic cookie refresh for session persistence
 */
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
