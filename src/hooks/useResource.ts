import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';

// Nomes de tabelas de dados com organization_id (escopo multi-tenant).
export type ResourceTable =
  | 'professionals'
  | 'labor_types'
  | 'labor_rates'
  | 'suppliers'
  | 'product_categories'
  | 'products'
  | 'fixed_costs'
  | 'variable_costs'
  | 'customers'
  | 'services';

interface ListOptions {
  orderBy?: string;
  ascending?: boolean;
  select?: string;
}

/**
 * Hooks CRUD genéricos para uma tabela escopada por organização.
 * O organization_id é sempre injetado a partir do contexto (nunca do input do usuário),
 * e o RLS no banco é a garantia final de isolamento.
 */
export function useResourceList<T = Record<string, unknown>>(
  table: ResourceTable,
  opts: ListOptions = {},
) {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: [table, orgId, opts],
    enabled: !!orgId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase.from(table).select(opts.select ?? '*').eq('organization_id', orgId!);
      if (opts.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useResourceMutations(table: ResourceTable) {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [table] });

  const create = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!orgId) throw new Error('Organização não carregada');
      const { data, error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({ ...values, organization_id: orgId } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      if (!orgId) throw new Error('Organização não carregada');
      const { data, error } = await supabase
        .from(table)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(values as any)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!orgId) throw new Error('Organização não carregada');
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
