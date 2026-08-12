import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Modal } from '@/components/Modal';
import { formatBRL } from '@/lib/money/format';
import { useOrg } from '@/features/organization/OrgProvider';
import { useTransactions, useAccounts, useCategories, useFinanceMutations, usePayments } from './useFinance';
import { openAmount, displayStatus, buildInstallments } from './finance';
import { PAYMENT_METHOD_LABEL, STATUS_LABEL, type PaymentMethod, type Transaction, type TransactionType } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

function StatusBadge({ t }: { t: Transaction }) {
  const s = displayStatus(t);
  const map: Record<string, string> = {
    pending: 'text-warning', partial: 'text-gold', paid: 'text-success', cancelled: 'text-muted', overdue: 'text-critical',
  };
  const label = s === 'overdue' ? 'Vencido' : STATUS_LABEL[s];
  return <span className={`text-xs ${map[s]}`}>{label}</span>;
}

export function TransactionsPage() {
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const { data: txs, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: cats } = useCategories();
  const { createTransactions, cancelTransaction, registerPayment, reversePayment } = useFinanceMutations();
  const [histTx, setHistTx] = useState<Transaction | null>(null);
  const { data: payments } = usePayments(histTx?.id ?? null);

  const { data: people } = useQuery({
    queryKey: ['fin-people', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [s, c] = await Promise.all([
        sb.from('suppliers').select('id, name').eq('organization_id', orgId).order('name'),
        sb.from('customers').select('id, name').eq('organization_id', orgId).order('name'),
      ]);
      return { suppliers: (s.data ?? []) as { id: string; name: string }[], customers: (c.data ?? []) as { id: string; name: string }[] };
    },
  });

  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'paid'>('all');

  const filtered = useMemo(() => {
    return (txs ?? []).filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus === 'open' && !(t.status === 'pending' || t.status === 'partial')) return false;
      if (filterStatus === 'paid' && t.status !== 'paid') return false;
      return true;
    });
  }, [txs, filterType, filterStatus]);

  const totals = useMemo(() => {
    let pag = 0, rec = 0;
    for (const t of filtered) {
      if (t.status === 'cancelled') continue;
      const open = openAmount(t);
      if (t.type === 'payable') pag += open; else rec += open;
    }
    return { pag, rec };
  }, [filtered]);

  // --- Form de novo lançamento ---
  const [formOpen, setFormOpen] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const [installments, setInstallments] = useState('1');
  const [intervalDays, setIntervalDays] = useState('30');
  const [formErr, setFormErr] = useState<string | null>(null);

  function openForm(type: TransactionType) {
    setF({ type, description: '', amount: '', due_date: new Date().toISOString().slice(0, 10), document_number: '', person_id: '', classification_category_id: '', financial_account_id: '' });
    setInstallments('1');
    setIntervalDays('30');
    setFormErr(null);
    setFormOpen(true);
  }

  async function submitForm() {
    setFormErr(null);
    try {
      const type = f.type as TransactionType;
      const amount = Number(f.amount) || 0;
      const n = Math.max(1, Number(installments) || 1);
      const parts = buildInstallments(amount, n, f.due_date, Number(intervalDays) || 30);
      const rows = parts.map((p) => ({
        type,
        description: n > 1 ? `${f.description} (${p.installment_number}/${p.installments_total})` : f.description,
        amount: p.amount,
        due_date: p.due_date,
        document_number: f.document_number || null,
        supplier_id: type === 'payable' ? f.person_id || null : null,
        customer_id: type === 'receivable' ? f.person_id || null : null,
        classification_category_id: f.classification_category_id || null,
        financial_account_id: f.financial_account_id || null,
        installment_number: n > 1 ? p.installment_number : null,
        installments_total: n > 1 ? p.installments_total : null,
        status: 'pending',
      }));
      await createTransactions.mutateAsync(rows);
      setFormOpen(false);
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Erro');
    }
  }

  // --- Baixa ---
  const [payTx, setPayTx] = useState<Transaction | null>(null);
  const [pay, setPay] = useState<Record<string, string>>({});
  const [payErr, setPayErr] = useState<string | null>(null);

  function openPay(t: Transaction) {
    setPayTx(t);
    setPay({ amount: String(openAmount(t)), date: new Date().toISOString().slice(0, 10), method: 'pix', account: t.financial_account_id ?? '' });
    setPayErr(null);
  }
  async function submitPay() {
    if (!payTx) return;
    setPayErr(null);
    try {
      await registerPayment.mutateAsync({
        tx: payTx.id, amount: Number(pay.amount) || 0, date: pay.date,
        method: pay.method as PaymentMethod, account: pay.account || null,
      });
      setPayTx(null);
    } catch (e) {
      setPayErr(e instanceof Error ? e.message : 'Erro');
    }
  }

  const catsForType = (t: string) => (cats ?? []).filter((c) => c.type === (t === 'payable' ? 'expense' : 'income'));
  const peopleForType = (t: string) => (t === 'payable' ? people?.suppliers : people?.customers) ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-strong">Lançamentos</h1>
          <p className="text-sm text-muted mt-1">Contas a pagar e a receber.</p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => openForm('receivable')}>+ A receber</button>
            <button className="btn-primary" onClick={() => openForm('payable')}>+ A pagar</button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap text-xs">
        {(['all', 'payable', 'receivable'] as const).map((t) => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg border ${filterType === t ? 'border-gold text-gold' : 'border-ink-border text-muted'}`}>
            {t === 'all' ? 'Todos' : t === 'payable' ? 'A pagar' : 'A receber'}
          </button>
        ))}
        <span className="mx-1 text-ink-border">|</span>
        {(['all', 'open', 'paid'] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg border ${filterStatus === s ? 'border-gold text-gold' : 'border-ink-border text-muted'}`}>
            {s === 'all' ? 'Todos status' : s === 'open' ? 'Em aberto' : 'Pagos'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
              <th className="px-3 py-2">Vencimento</th><th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Pessoa</th><th className="px-3 py-2">Classificação</th>
              <th className="px-3 py-2">Tipo</th><th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2 text-right">Em aberto</th><th className="px-3 py-2">Status</th><th className="px-3 py-2" />
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-6 text-center text-muted">Nenhum lançamento.</td></tr>
              ) : filtered.map((t) => (
                <tr key={t.id} className="border-b border-ink-border/50 last:border-0">
                  <td className="px-3 py-2 text-muted whitespace-nowrap">{new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-2 text-strong">{t.description}</td>
                  <td className="px-3 py-2 text-muted-soft">{t.suppliers?.name ?? t.customers?.name ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-soft">{t.classification_categories?.name ?? '—'}</td>
                  <td className={`px-3 py-2 ${t.type === 'payable' ? 'text-critical' : 'text-success'}`}>{t.type === 'payable' ? 'Pagar' : 'Receber'}</td>
                  <td className="px-3 py-2 text-right text-muted-soft">{formatBRL(t.amount)}</td>
                  <td className="px-3 py-2 text-right text-gold">{formatBRL(openAmount(t))}</td>
                  <td className="px-3 py-2"><StatusBadge t={t} /></td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {canWrite && (t.status === 'pending' || t.status === 'partial') && (
                      <button className="text-xs text-success hover:underline mr-2" onClick={() => openPay(t)}>Baixar</button>
                    )}
                    {t.paid_amount > 0 && (
                      <button className="text-xs text-gold hover:underline mr-2" onClick={() => setHistTx(t)}>Baixas</button>
                    )}
                    {canWrite && (t.status === 'pending' || t.status === 'partial') && (
                      <button className="text-xs text-critical hover:underline" onClick={() => { if (confirm('Cancelar título?')) cancelTransaction.mutate(t.id); }}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-xs border-t border-ink-border">
                <td colSpan={6} className="px-3 py-2 text-right text-muted">Em aberto — a pagar / a receber:</td>
                <td className="px-3 py-2 text-right text-critical">{formatBRL(totals.pag)}</td>
                <td colSpan={2} className="px-3 py-2 text-success">{formatBRL(totals.rec)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Form novo lançamento */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={f.type === 'payable' ? 'Nova conta a pagar' : 'Nova conta a receber'}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Descrição</label>
            <input className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div><label className="label">Valor total (R$)</label>
            <input className="input" type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          <div><label className="label">1º vencimento</label>
            <input className="input" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></div>
          <div><label className="label">{f.type === 'payable' ? 'Fornecedor' : 'Cliente'}</label>
            <select className="input" value={f.person_id} onChange={(e) => setF({ ...f, person_id: e.target.value })}>
              <option value="">—</option>
              {peopleForType(f.type).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="label">Classificação</label>
            <select className="input" value={f.classification_category_id} onChange={(e) => setF({ ...f, classification_category_id: e.target.value })}>
              <option value="">—</option>
              {catsForType(f.type).map((c) => <option key={c.id} value={c.id}>{c.parent_id ? '— ' : ''}{c.name}</option>)}
            </select></div>
          <div><label className="label">Conta financeira</label>
            <select className="input" value={f.financial_account_id} onChange={(e) => setF({ ...f, financial_account_id: e.target.value })}>
              <option value="">—</option>
              {(accounts ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select></div>
          <div><label className="label">Documento (opcional)</label>
            <input className="input" value={f.document_number} onChange={(e) => setF({ ...f, document_number: e.target.value })} /></div>
          <div><label className="label">Parcelas</label>
            <input className="input" type="number" min="1" value={installments} onChange={(e) => setInstallments(e.target.value)} /></div>
          {Number(installments) > 1 && (
            <div><label className="label">Intervalo (dias)</label>
              <input className="input" type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} /></div>
          )}
          {formErr && <p className="text-critical text-xs col-span-2">{formErr}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setFormOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={submitForm} disabled={createTransactions.isPending || !f.description || !f.amount}>Salvar</button>
          </div>
        </div>
      </Modal>

      {/* Baixa */}
      <Modal open={!!payTx} onClose={() => setPayTx(null)} title="Baixar título">
        {payTx && (
          <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-sm text-muted">{payTx.description} — em aberto {formatBRL(openAmount(payTx))}</p>
            <div><label className="label">Valor pago (R$)</label>
              <input className="input" type="number" step="0.01" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
            <div><label className="label">Data</label>
              <input className="input" type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} /></div>
            <div><label className="label">Forma</label>
              <select className="input" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>)}
              </select></div>
            <div><label className="label">Conta</label>
              <select className="input" value={pay.account} onChange={(e) => setPay({ ...pay, account: e.target.value })}>
                <option value="">—</option>
                {(accounts ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select></div>
            <p className="col-span-2 text-[11px] text-muted">Valor menor que o aberto gera baixa parcial (título fica "Parcial").</p>
            {payErr && <p className="text-critical text-xs col-span-2">{payErr}</p>}
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={() => setPayTx(null)}>Cancelar</button>
              <button className="btn-primary" onClick={submitPay} disabled={registerPayment.isPending}>Confirmar baixa</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Histórico de baixas + estorno */}
      <Modal open={!!histTx} onClose={() => setHistTx(null)} title="Histórico de baixas">
        {histTx && (
          <div>
            <p className="text-sm text-muted mb-3">{histTx.description}</p>
            {(payments ?? []).length === 0 ? (
              <p className="text-sm text-muted">Nenhuma baixa registrada.</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
                  <th className="py-2">Data</th><th className="py-2">Forma</th>
                  <th className="py-2 text-right">Valor</th><th className="py-2" />
                </tr></thead>
                <tbody>
                  {(payments ?? []).map((p) => (
                    <tr key={p.id} className="border-b border-ink-border/50 last:border-0">
                      <td className="py-2 text-muted-soft">{new Date(p.payment_date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-2 text-muted-soft">{PAYMENT_METHOD_LABEL[p.payment_method as PaymentMethod] ?? p.payment_method}</td>
                      <td className="py-2 text-right text-success">{formatBRL(p.paid_amount)}</td>
                      <td className="py-2 text-right">
                        {canWrite && (
                          <button
                            className="text-xs text-critical hover:underline"
                            onClick={async () => {
                              if (!confirm('Estornar esta baixa? O título volta ao status anterior.')) return;
                              try { await reversePayment.mutateAsync(p.id); } catch (e) { alert(e instanceof Error ? e.message : 'Erro'); }
                            }}
                          >
                            Estornar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-end pt-3">
              <button className="btn-ghost" onClick={() => setHistTx(null)}>Fechar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
