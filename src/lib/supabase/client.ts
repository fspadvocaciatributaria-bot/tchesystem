import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Falha explícita em desenvolvimento se o ambiente não estiver configurado.
  // eslint-disable-next-line no-console
  console.error(
    'Supabase não configurado. Copie .env.example para .env.local e preencha ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(url && anonKey);
