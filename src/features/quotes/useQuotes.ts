import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { Enums } from '@/lib/supabase/database.types';

export interface QuoteItemInput {
  key: string;
  service_id: string | null;
  formation_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  price_min?: number; // para alerta "abaixo do mínimo"
}

export interface SaveQuoteInput {
  id?: string;
  customer_id: string | null;
  code: string | null;
  status: Enums<'quote_status'>;
  discount_amount: number;
  valid_until: string | null;
  terms: string | null;
  notes: string | null;
  items: QuoteItemInput[];
  subtotal: number;
  total: number;
}

export function useQuotesList() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['quotes', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, code, status, total, created_at, valid_until, customers(name)')
        .eq('organization_id', orgId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useQuote(id: string | undefined) {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['quote', id, orgId],
    enabled: !!orgId && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customers(*), quote_items(*)')
        .eq('id', id!)
        .eq('organization_id', orgId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveQuote() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveQuoteInput) => {
      if (!orgId) throw new Error('Organização não carregada');
      const base = {
        organization_id: orgId,
        customer_id: input.customer_id,
        code: input.code,
        status: input.status,
        discount_amount: input.discount_amount,
        subtotal: input.subtotal,
        total: input.total,
        valid_until: input.valid_until,
        terms: input.terms,
        notes: input.notes,
      };

      let quoteId = input.id;
      if (quoteId) {
        const { error } = await supabase.from('quotes').update(base).eq('id', quoteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('quotes').insert(base).select('id').single();
        if (error) throw error;
        quoteId = data.id;
      }

      // Substitui itens
      const { error: delErr } = await supabase.from('quote_items').delete().eq('quote_id', quoteId);
      if (delErr) throw delErr;

      if (input.items.length > 0) {
        const rows = input.items.map((it) => ({
          organization_id: orgId,
          quote_id: quoteId,
          service_id: it.service_id,
          formation_id: it.formation_id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          line_total: it.quantity * it.unit_price,
        }));
        const { error: insErr } = await supabase.from('quote_items').insert(rows);
        if (insErr) throw insErr;
      }

      return quoteId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}
