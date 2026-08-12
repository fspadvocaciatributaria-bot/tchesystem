import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';

export type ThemePref = 'dark' | 'light' | 'system';
const STORAGE_KEY = 'tche-theme';

function resolve(pref: ThemePref): 'dark' | 'light' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return pref;
}

function apply(pref: ThemePref) {
  const resolved = resolve(pref);
  document.documentElement.classList.toggle('light', resolved === 'light');
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
}

interface ThemeContextValue {
  pref: ThemePref;
  resolved: 'dark' | 'light';
  setPref: (p: ThemePref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pref, setPrefState] = useState<ThemePref>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ThemePref) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Aplica sempre que a preferência muda.
  useEffect(() => {
    apply(pref);
  }, [pref]);

  // Carrega a preferência salva do perfil ao logar.
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = (data as any)?.theme as ThemePref | undefined;
        if (t) setPrefState(t);
      });
  }, [user]);

  const persist = useCallback(
    (p: ThemePref) => {
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from('profiles').update({ theme: p } as any).eq('id', user.id).then(() => {});
    },
    [user],
  );

  const setPref = useCallback(
    (p: ThemePref) => {
      setPrefState(p);
      persist(p);
    },
    [persist],
  );

  const resolved = resolve(pref);
  const toggle = useCallback(() => setPref(resolved === 'dark' ? 'light' : 'dark'), [resolved, setPref]);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref, toggle }}>{children}</ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>');
  return ctx;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={resolved === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={`rounded-lg border border-ink-border px-2 py-1 text-sm text-muted hover:text-strong hover:bg-ink-soft transition-colors ${className}`}
    >
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
