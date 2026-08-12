import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { ClassificationCategory, FinancialAccount, PaymentMethod, Transaction } from './types';

// As tabelas financeiras ainda não estão nos tipos gerados — acesso via cast controlado.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export function useCategories() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['fin-categories', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await sb
        .from('classification_categories')
        .select('*')
        .eq('organization_id', orgId)
        .order('code', { nullsFirst: false })
        .order('name');
      if (error) throw error;
      return (data ?? []) as ClassificationCategory[];
    },
  });
}

export function useAccounts() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['fin-accounts', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await sb
        .from('financial_accounts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name');
      if (error) throw error;
      return (data ?? []) as FinancialAccount[];
    },
  });
}

export function useTransactions() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['fin-transactions', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await sb
        .from('transactions')
        .select(
          '*, suppliers(name), customers(name), classification_categories(name, type), financial_accounts(name)',
        )
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
  });
}

export function useFinanceMutations() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['fin-transactions'] });
    qc.invalidateQueries({ queryKey: ['fin-accounts'] });
    qc.invalidateQueries({ queryKey: ['fin-categories'] });
  };

  const createTransactions = useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      const withOrg = rows.map((r) => ({ ...r, organization_id: orgId }));
      const { error } = await sb.from('transactions').insert(withOrg);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await sb.from('transactions').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const cancelTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('transactions').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const registerPayment = useMutation({
    mutationFn: async (args: {
      tx: string; amount: number; date: string; method: PaymentMethod;
      account?: string | null; receipt?: string | null; obs?: string | null;
    }) => {
      const { error } = await sb.rpc('register_payment', {
        p_tx: args.tx, p_amount: args.amount, p_date: args.date, p_method: args.method,
        p_account: args.account ?? undefined, p_receipt: args.receipt ?? undefined, p_obs: args.obs ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reversePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await sb.rpc('reverse_payment', { p_payment: paymentId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { createTransactions, updateTransaction, cancelTransaction, registerPayment, reversePayment };
}

export interface PaymentRow {
  id: string;
  paid_amount: number;
  payment_date: string;
  payment_method: string;
  receipt_reference: string | null;
}

/** Histórico de baixas de um título. */
export function usePayments(transactionId: string | null) {
  return useQuery({
    queryKey: ['fin-payments', transactionId],
    enabled: !!transactionId,
    queryFn: async () => {
      const { data, error } = await sb
        .from('transaction_payments')
        .select('id, paid_amount, payment_date, payment_method, receipt_reference')
        .eq('transaction_id', transactionId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PaymentRow[];
    },
  });
}

export function useAccountMutations() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['fin-accounts'] });
  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (id) {
        const { error } = await sb.from('financial_accounts').update(values).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('financial_accounts').insert({ ...values, organization_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  return { save };
}

export function useCategoryMutations() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['fin-categories'] });
  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (id) {
        const { error } = await sb.from('classification_categories').update(values).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('classification_categories').insert({ ...values, organization_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from('classification_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { save, remove };
}
