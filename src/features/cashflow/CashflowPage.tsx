import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { Modal } from '@/components/Modal';
import type { Enums, Tables } from '@/lib/supabase/database.types';

type Direction = Enums<'cash_direction'>;
type Entry = Tables<'cash_entries'>;

type Period = 'today' | 'week' | 'month' | 'quarter' | 'semester' | 'year';
const PERIOD_LABEL: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  quarter: 'Trimestre',
  semester: 'Semestre',
  year: 'Ano',
};

function periodStart(p: Period): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  switch (p) {
    case 'today': return d;
    case 'week': { const x = new Date(d); x.setDate(d.getDate() - 7); return x; }
    case 'month': return new Date(d.getFullYear(), d.getMonth(), 1);
    case 'quarter': { const x = new Date(d); x.setMonth(d.getMonth() - 3); return x; }
    case 'semester': { const x = new Date(d); x.setMonth(d.getMonth() - 6); return x; }
    case 'year': return new Date(d.getFullYear(), 0, 1);
  }
}

export function CashflowPage() {
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const [period, setPeriod] = useState<Period>('month');
  const [open, setOpen] = useState(false);

  const { data: entries } = useQuery({
    queryKey: ['cash_entries', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_entries')
        .select('*')
        .eq('organization_id', orgId!)
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
  });

  const filtered = useMemo(() => {
    const start = periodStart(period);
    return (entries ?? []).filter((e) => new Date(e.entry_date) >= start);
  }, [entries, period]);

  const totals = useMemo(() => {
    let inc = 0, out = 0;
    for (const e of filtered) {
      if (e.direction === 'in') inc += e.amount;
      else out += e.amount;
    }
    const saldoTotal = (entries ?? []).reduce((s, e) => s + (e.direction === 'in' ? e.amount : -e.amount), 0);
    return { inc, out, result: inc - out, saldoTotal };
  }, [filtered, entries]);

  // form
  const [direction, setDirection] = useState<Direction>('in');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Organização não carregada');
      const { error } = await supabase.from('cash_entries').insert({
        organization_id: orgId,
        direction,
        amount: Number(amount) || 0,
        description: description || null,
        category: category || null,
        entry_date: entryDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cash_entries'] });
      setOpen(false);
      setAmount(''); setDescription(''); setCategory('');
    },
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try { await create.mutateAsync(); } catch (err) { setError(err instanceof Error ? err.message : 'Erro'); }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl font-semibold text-strong">Fluxo de caixa</h1>
          <p className="text-sm text-muted mt-1">Entradas e saídas do seu negócio.</p>
        </div>
        {canWrite && <button className="btn-primary shrink-0" onClick={() => setOpen(true)}>+ Lançamento</button>}
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs px-3 py-1.5 rounded-lg border ${period === p ? 'border-gold text-gold' : 'border-ink-border text-muted'}`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card label="Entradas" value={formatBRL(totals.inc)} accent="success" />
        <Card label="Saídas" value={formatBRL(totals.out)} accent="critical" />
        <Card label="Resultado" value={formatBRL(totals.result)} accent={totals.result >= 0 ? 'success' : 'critical'} />
        <Card label="Saldo total" value={formatBRL(totals.saldoTotal)} accent="gold" />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-ink-border">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted">Nenhum lançamento no período.</td></tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-ink-border/50 last:border-0">
                  <td className="px-4 py-3 text-muted">{new Date(e.entry_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-strong">{e.description ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-soft">{e.category ?? '—'}</td>
                  <td className={`px-4 py-3 text-right ${e.direction === 'in' ? 'text-success' : 'text-critical'}`}>
                    {e.direction === 'in' ? '+' : '-'}{formatBRL(e.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo lançamento">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Tipo</label>
            <select className="input" value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
              <option value="in">Entrada</option>
              <option value="out">Saída</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="label">Valor (R$)</label>
            <input className="input" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="col-span-1">
            <label className="label">Data</label>
            <input className="input" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
          </div>
          <div className="col-span-2">
            <label className="label">Descrição</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label">Categoria</label>
            <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          {error && <p className="text-critical text-xs col-span-2">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" disabled={create.isPending}>{create.isPending ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent: 'success' | 'critical' | 'gold' }) {
  const color = accent === 'gold' ? 'text-gold' : accent === 'success' ? 'text-success' : 'text-critical';
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
