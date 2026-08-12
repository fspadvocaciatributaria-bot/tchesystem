import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { SelectOption } from '@/components/crud/types';

/** Opções de select a partir de uma tabela da organização (id + label). */
export function useOrgOptions(
  table: 'suppliers' | 'product_categories' | 'professionals' | 'labor_types',
  labelCol = 'name',
): SelectOption[] {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const { data } = useQuery({
    queryKey: ['options', table, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(table) as any)
        .select(`id, ${labelCol}`)
        .eq('organization_id', orgId)
        .order(labelCol);
      if (error) throw error;
      return data as Record<string, string>[];
    },
  });
  return (data ?? []).map((r) => ({ value: r.id, label: r[labelCol] }));
}

/** Opções do catálogo global de profissões. */
export function useProfessionOptions(): SelectOption[] {
  const { data } = useQuery({
    queryKey: ['professions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professions')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });
  return (data ?? []).map((p) => ({ value: p.id, label: p.name }));
}
