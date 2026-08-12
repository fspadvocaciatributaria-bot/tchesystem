import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Tables, Enums } from '@/lib/supabase/database.types';

export interface OrgContextValue {
  organization: Tables<'organizations'> | null;
  role: Enums<'member_role'> | null;
  canWrite: boolean;
  loading: boolean;
  refetch: () => void;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

/**
 * Carrega a organização atual do usuário (primeira membership) + papel.
 * No MVP assumimos uma organização por usuário; a estrutura suporta várias.
 */
export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['current-org', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('role, organization_id, organizations(*)')
        .order('created_at', { ascending: true })
        .limit(1);
      if (error) throw error;
      const m = memberships?.[0];
      if (!m) return { organization: null, role: null };
      return {
        organization: (m.organizations as unknown as Tables<'organizations'>) ?? null,
        role: m.role as Enums<'member_role'>,
      };
    },
  });

  const role = data?.role ?? null;
  const value: OrgContextValue = {
    organization: data?.organization ?? null,
    role,
    canWrite: role === 'owner' || role === 'admin' || role === 'professional',
    loading: isLoading,
    refetch,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg deve ser usado dentro de <OrgProvider>');
  return ctx;
}
