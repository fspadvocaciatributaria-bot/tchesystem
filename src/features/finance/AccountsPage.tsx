import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '@/components/Modal';
import { formatBRL } from '@/lib/money/format';
import { useOrg } from '@/features/organization/OrgProvider';
import { useAccounts, useAccountMutations } from './useFinance';
import { ACCOUNT_TYPE_LABEL, type FinAccountType, type FinancialAccount } from './types';

export function AccountsPage() {
  const { canWrite } = useOrg();
  const { data: accounts, isLoading } = useAccounts();
  const { save } = useAccountMutations();
  const { data: banks } = useQuery({
    queryKey: ['banks'],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('banks' as any) as any).select('id, bank_code, name').eq('active', true).order('name');
      return (data ?? []) as { id: string; bank_code: string; name: string }[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialAccount | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setForm({ name: '', account_type: 'cash', owner_type: 'company', initial_balance: '0' });
    setErr(null);
    setOpen(true);
  }
  function openEdit(a: FinancialAccount) {
    setEditing(a);
    setForm({
      name: a.name, account_type: a.account_type, owner_type: a.owner_type,
      initial_balance: String(a.initial_balance), bank_id: a.bank_id ?? '',
      agency: a.agency ?? '', account_number: a.account_number ?? '',
    });
    setErr(null);
    setOpen(true);
  }

  async function submit() {
    setErr(null);
    try {
      await save.mutateAsync({
        id: editing?.id,
        values: {
          name: form.name, account_type: form.account_type, owner_type: form.owner_type,
          initial_balance: Number(form.initial_balance) || 0, bank_id: form.bank_id || null,
          agency: form.agency || null, account_number: form.account_number || null,
        },
      });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-strong">Contas financeiras</h1>
          <p className="text-sm text-muted mt-1">Caixa, bancos e carteiras. O saldo inicial entra no fluxo de caixa.</p>
        </div>
        {canWrite && <button className="btn-primary" onClick={openNew}>+ Nova conta</button>}
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : (accounts ?? []).length === 0 ? (
        <div className="card border-dashed text-center py-10">
          <p className="text-muted text-sm">Nenhuma conta. Crie ao menos um "Caixa Geral".</p>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
              <th className="px-4 py-2">Conta</th><th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2 text-right">Saldo inicial</th><th className="px-4 py-2" />
            </tr></thead>
            <tbody>
              {(accounts ?? []).map((a) => (
                <tr key={a.id} className="border-b border-ink-border/50 last:border-0">
                  <td className="px-4 py-2 text-strong">{a.name}</td>
                  <td className="px-4 py-2 text-muted-soft">{ACCOUNT_TYPE_LABEL[a.account_type]}</td>
                  <td className="px-4 py-2 text-right text-gold">{formatBRL(a.initial_balance)}</td>
                  <td className="px-4 py-2 text-right">
                    {canWrite && <button className="text-xs text-gold hover:underline" onClick={() => openEdit(a)}>Editar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar conta' : 'Nova conta'}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Nome</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Tipo</label>
            <select className="input" value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value })}>
              {(Object.keys(ACCOUNT_TYPE_LABEL) as FinAccountType[]).map((t) => <option key={t} value={t}>{ACCOUNT_TYPE_LABEL[t]}</option>)}
            </select></div>
          <div><label className="label">Saldo inicial (R$)</label>
            <input className="input" type="number" step="0.01" value={form.initial_balance} onChange={(e) => setForm({ ...form, initial_balance: e.target.value })} /></div>
          <div><label className="label">Banco (opcional)</label>
            <select className="input" value={form.bank_id ?? ''} onChange={(e) => setForm({ ...form, bank_id: e.target.value })}>
              <option value="">—</option>
              {(banks ?? []).map((b) => <option key={b.id} value={b.id}>{b.bank_code} {b.name}</option>)}
            </select></div>
          <div><label className="label">Dono</label>
            <select className="input" value={form.owner_type} onChange={(e) => setForm({ ...form, owner_type: e.target.value })}>
              <option value="company">Empresa</option><option value="partner">Sócio</option>
            </select></div>
          {err && <p className="text-critical text-xs col-span-2">{err}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={submit} disabled={save.isPending || !form.name}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
