import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

try {
  if (isSupabaseConfigured) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } else {
    console.warn(
      'Supabase not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). App will run, but auth/data features will be disabled.'
    );
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
}

// Minimal no-crash mock client (so the whole site never blanks)
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null }),
      }),
    }),
    insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
    update: async () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      remove: async () => ({ data: null, error: new Error('Supabase not configured') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  rpc: async () => ({ data: null, error: new Error('Supabase not configured') }),
} as unknown as SupabaseClient;

export const supabase = supabaseInstance || mockClient;
