import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { Enums } from '@/lib/supabase/database.types';

export interface MovementRow {
  id: string;
  type: Enums<'movement_type'>;
  quantity: number;
  unit_cost: number | null;
  reason: string | null;
  document_number: string | null;
  created_at: string;
  products: { name: string } | null;
}

/** Histórico de movimentações de estoque (com nome do produto). */
export function useMovements() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['inventory_movements', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('id, type, quantity, unit_cost, reason, document_number, created_at, products(name)')
        .eq('organization_id', orgId!)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as MovementRow[];
    },
  });
}

export interface RegisterMovementInput {
  productId: string;
  type: Enums<'movement_type'>;
  quantity: number;
  unitCost?: number | null;
  supplierId?: string | null;
  reason?: string | null;
  document?: string | null;
}

/** Registra uma movimentação via RPC (mantém saldo + custo médio + auditoria). */
export function useRegisterMovement() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterMovementInput) => {
      if (!orgId) throw new Error('Organização não carregada');
      const { data, error } = await supabase.rpc('register_inventory_movement', {
        p_org: orgId,
        p_product: input.productId,
        p_type: input.type,
        p_qty: input.quantity,
        p_unit_cost: input.unitCost ?? undefined,
        p_supplier: input.supplierId ?? undefined,
        p_reason: input.reason ?? undefined,
        p_document: input.document ?? undefined,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory_movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['options', 'products'] });
    },
  });
}
