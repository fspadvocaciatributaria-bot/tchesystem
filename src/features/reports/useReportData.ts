import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { Enums } from '@/lib/supabase/database.types';

export type Period = 'month' | 'quarter' | 'year' | 'all';

export function periodStart(p: Period): Date | null {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  switch (p) {
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case 'quarter': {
      const x = new Date(d);
      x.setMonth(d.getMonth() - 3);
      return x;
    }
    case 'year':
      return new Date(d.getFullYear(), 0, 1);
    case 'all':
      return null;
  }
}

export interface CashRow {
  direction: Enums<'cash_direction'>;
  amount: number;
  entry_date: string;
  category: string | null;
}
export interface MovementRow {
  type: Enums<'movement_type'>;
  quantity: number;
  unit_cost: number | null;
  created_at: string;
  products: { name: string } | null;
}
export interface QuoteRow {
  status: Enums<'quote_status'>;
  total: number;
  created_at: string;
}

export function useReportData() {
  const { organization } = useOrg();
  const orgId = organization?.id;

  // Fonte única: transações realizadas do módulo financeiro (mapeadas para o formato de caixa).
  const cash = useQuery({
    queryKey: ['rep-cash', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, paid_amount, payment_date, due_date, classification_categories(name)')
        .eq('organization_id', orgId!)
        .is('deleted_at', null)
        .gt('paid_amount', 0);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((t: any) => ({
        direction: t.type === 'receivable' ? 'in' : 'out',
        amount: t.paid_amount,
        entry_date: (t.payment_date ?? t.due_date) as string,
        category: t.classification_categories?.name ?? null,
      })) as CashRow[];
    },
  });

  const movements = useQuery({
    queryKey: ['rep-mov', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('type, quantity, unit_cost, created_at, products(name)')
        .eq('organization_id', orgId!);
      if (error) throw error;
      return (data ?? []) as unknown as MovementRow[];
    },
  });

  const quotes = useQuery({
    queryKey: ['rep-quotes', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('status, total, created_at')
        .eq('organization_id', orgId!);
      if (error) throw error;
      return data as QuoteRow[];
    },
  });

  return { cash, movements, quotes, loading: cash.isLoading || movements.isLoading || quotes.isLoading };
}
