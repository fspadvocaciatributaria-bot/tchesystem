import { useMemo, useState } from 'react';
import { formatBRL } from '@/lib/money/format';
import { useTransactions } from './useFinance';
import { openAmount, isProjected } from './finance';
import type { Transaction } from './types';

type Period = 'month' | 'quarter' | 'year' | 'all';
const PERIOD_LABEL: Record<Period, string> = { month: 'Mês', quarter: 'Trimestre', year: 'Ano', all: 'Tudo' };

function periodStart(p: Period): string | null {
  const d = new Date();
  if (p === 'month') return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  if (p === 'quarter') { const x = new Date(d); x.setMonth(d.getMonth() - 3); return x.toISOString().slice(0, 10); }
  if (p === 'year') return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10);
  return null;
}

/** Baixa um CSV no navegador. */
function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

interface Agg { name: string; pagar: number; receber: number; pago: number; recebido: number }

function aggregateBy(txs: Transaction[], key: (t: Transaction) => string): Agg[] {
  const map: Record<string, Agg> = {};
  for (const t of txs) {
    if (t.status === 'cancelled') continue;
    const name = key(t);
    map[name] ??= { name, pagar: 0, receber: 0, pago: 0, recebido: 0 };
    if (isProjected(t)) {
      if (t.type === 'payable') map[name].pagar += openAmount(t);
      else map[name].receber += openAmount(t);
    }
    if (t.type === 'payable') map[name].pago += t.paid_amount;
    else map[name].recebido += t.paid_amount;
  }
  return Object.values(map).sort((a, b) => b.pagar + b.receber + b.pago + b.recebido - (a.pagar + a.receber + a.pago + a.recebido));
}

export function FinanceReportsPage() {
  const { data: txs, isLoading } = useTransactions();
  const [period, setPeriod] = useState<Period>('quarter');
  const start = periodStart(period);

  const filtered = useMemo(
    () => (txs ?? []).filter((t) => !start || t.due_date >= start),
    [txs, start],
  );

  const porClassif = useMemo(() => aggregateBy(filtered, (t) => t.classification_categories?.name ?? 'Sem classificação'), [filtered]);
  const porPessoa = useMemo(() => aggregateBy(filtered, (t) => t.suppliers?.name ?? t.customers?.name ?? 'Sem pessoa'), [filtered]);
  const porConta = useMemo(() => aggregateBy(filtered, (t) => t.financial_accounts?.name ?? 'Sem conta'), [filtered]);

  function exportCsv(title: string, data: Agg[]) {
    downloadCsv(`${title}.csv`, [
      [title, 'A pagar (aberto)', 'A receber (aberto)', 'Pago', 'Recebido'],
      ...data.map((a) => [a.name, a.pagar.toFixed(2), a.receber.toFixed(2), a.pago.toFixed(2), a.recebido.toFixed(2)]),
    ]);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap no-print">
        <div>
          <h1 className="text-xl font-semibold text-strong">Relatórios financeiros</h1>
          <p className="text-sm text-muted mt-1">Por classificação, pessoa e conta. Exporte em CSV ou imprima.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg border ${period === p ? 'border-gold text-gold' : 'border-ink-border text-muted'}`}>{PERIOD_LABEL[p]}</button>
          ))}
          <button className="btn-ghost text-xs" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : (
        <div className="space-y-8">
          <ReportTable title="Por classificação" data={porClassif} onCsv={() => exportCsv('financeiro-por-classificacao', porClassif)} />
          <ReportTable title="Por pessoa (fornecedor/cliente)" data={porPessoa} onCsv={() => exportCsv('financeiro-por-pessoa', porPessoa)} />
          <ReportTable title="Por conta financeira" data={porConta} onCsv={() => exportCsv('financeiro-por-conta', porConta)} />
        </div>
      )}
    </div>
  );
}

function ReportTable({ title, data, onCsv }: { title: string; data: Agg[]; onCsv: () => void }) {
  const tot = data.reduce((s, a) => ({ pagar: s.pagar + a.pagar, receber: s.receber + a.receber, pago: s.pago + a.pago, recebido: s.recebido + a.recebido }), { pagar: 0, receber: 0, pago: 0, recebido: 0 });
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-strong">{title}</h2>
        <button className="text-xs text-gold hover:underline no-print" onClick={onCsv}>Exportar CSV</button>
      </div>
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
            <th className="px-4 py-2">{title.split(' ')[1] ?? 'Item'}</th>
            <th className="px-4 py-2 text-right">A pagar</th><th className="px-4 py-2 text-right">A receber</th>
            <th className="px-4 py-2 text-right">Pago</th><th className="px-4 py-2 text-right">Recebido</th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-muted">Sem dados no período.</td></tr>
            ) : data.map((a) => (
              <tr key={a.name} className="border-b border-ink-border/50 last:border-0">
                <td className="px-4 py-2 text-strong">{a.name}</td>
                <td className="px-4 py-2 text-right text-critical">{a.pagar ? formatBRL(a.pagar) : '—'}</td>
                <td className="px-4 py-2 text-right text-success">{a.receber ? formatBRL(a.receber) : '—'}</td>
                <td className="px-4 py-2 text-right text-muted-soft">{a.pago ? formatBRL(a.pago) : '—'}</td>
                <td className="px-4 py-2 text-right text-muted-soft">{a.recebido ? formatBRL(a.recebido) : '—'}</td>
              </tr>
            ))}
          </tbody>
          {data.length > 0 && (
            <tfoot><tr className="text-xs border-t border-ink-border font-medium">
              <td className="px-4 py-2 text-muted">Total</td>
              <td className="px-4 py-2 text-right text-critical">{formatBRL(tot.pagar)}</td>
              <td className="px-4 py-2 text-right text-success">{formatBRL(tot.receber)}</td>
              <td className="px-4 py-2 text-right text-muted-soft">{formatBRL(tot.pago)}</td>
              <td className="px-4 py-2 text-right text-muted-soft">{formatBRL(tot.recebido)}</td>
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
