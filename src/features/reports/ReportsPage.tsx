import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatBRL } from '@/lib/money/format';
import { useReportData, periodStart, type Period } from './useReportData';
import type { Enums } from '@/lib/supabase/database.types';

const PERIOD_LABEL: Record<Period, string> = {
  month: 'Mês atual',
  quarter: 'Últimos 3 meses',
  year: 'Este ano',
  all: 'Tudo',
};

const QUOTE_STATUS_LABEL: Record<Enums<'quote_status'>, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  accepted: 'Aceito',
  rejected: 'Recusado',
  expired: 'Expirado',
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function ReportsPage() {
  const { cash, movements, quotes, loading } = useReportData();
  const [period, setPeriod] = useState<Period>('quarter');
  const start = periodStart(period);
  const inRange = (iso: string) => !start || new Date(iso) >= start;

  // Financeiro
  const fin = useMemo(() => {
    let inc = 0, out = 0;
    const byCat: Record<string, number> = {};
    for (const e of cash.data ?? []) {
      if (!inRange(e.entry_date)) continue;
      if (e.direction === 'in') inc += e.amount;
      else {
        out += e.amount;
        const k = e.category || 'Sem categoria';
        byCat[k] = (byCat[k] ?? 0) + e.amount;
      }
    }
    const topDespesas = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { inc, out, result: inc - out, topDespesas };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cash.data, period]);

  // Faturamento x saídas por mês (12 meses)
  const chart = useMemo(() => {
    const buckets = new Map<string, { mes: string; Entradas: number; Saídas: number }>();
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(monthKey(d), { mes: d.toLocaleDateString('pt-BR', { month: 'short' }), Entradas: 0, Saídas: 0 });
    }
    for (const e of cash.data ?? []) {
      const b = buckets.get(monthKey(new Date(e.entry_date)));
      if (!b) continue;
      if (e.direction === 'in') b.Entradas += e.amount;
      else b['Saídas'] += e.amount;
    }
    return Array.from(buckets.values());
  }, [cash.data]);

  // Materiais: comprado (in) e consumido (out) por produto
  const materiais = useMemo(() => {
    const map: Record<string, { comprado: number; compradoValor: number; consumido: number }> = {};
    for (const m of movements.data ?? []) {
      if (!inRange(m.created_at)) continue;
      const name = m.products?.name ?? '—';
      map[name] ??= { comprado: 0, compradoValor: 0, consumido: 0 };
      if (m.type === 'in') {
        map[name].comprado += m.quantity;
        map[name].compradoValor += m.quantity * (m.unit_cost ?? 0);
      } else if (m.type === 'out') {
        map[name].consumido += m.quantity;
      }
    }
    return Object.entries(map).sort((a, b) => b[1].compradoValor - a[1].compradoValor).slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movements.data, period]);

  // Orçamentos por status
  const orcamentos = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const q of quotes.data ?? []) {
      if (!inRange(q.created_at)) continue;
      map[q.status] ??= { count: 0, total: 0 };
      map[q.status].count++;
      map[q.status].total += q.total;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes.data, period]);

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-strong">Relatórios</h1>
          <p className="text-sm text-muted mt-1">Visão financeira, materiais e orçamentos por período.</p>
        </div>
        <div className="flex gap-1 flex-wrap">
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
      </div>

      {loading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : (
        <div className="space-y-6">
          {/* Resumo financeiro */}
          <div className="grid grid-cols-3 gap-3">
            <Kpi label="Faturamento" value={formatBRL(fin.inc)} accent="success" />
            <Kpi label="Saídas" value={formatBRL(fin.out)} accent="critical" />
            <Kpi label="Resultado" value={formatBRL(fin.result)} accent={fin.result >= 0 ? 'gold' : 'critical'} />
          </div>

          {/* Gráfico 12 meses */}
          <div className="card">
            <h2 className="text-sm font-semibold text-strong mb-3">Entradas × Saídas (12 meses)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888833" />
                  <XAxis dataKey="mes" stroke="#8a8a92" fontSize={12} />
                  <YAxis stroke="#8a8a92" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatBRL(v)} contentStyle={{ background: '#1b1b1f', border: '1px solid #2a2a30', borderRadius: 8, color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Entradas" fill="#2fbf71" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Saídas" fill="#e5352b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Consumo/compra de materiais */}
            <div>
              <h2 className="text-sm font-semibold text-strong mb-2">Materiais — comprado e consumido</h2>
              <div className="card p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted border-b border-ink-border">
                      <th className="px-4 py-2">Produto</th>
                      <th className="px-4 py-2 text-right">Comprado</th>
                      <th className="px-4 py-2 text-right">R$ compras</th>
                      <th className="px-4 py-2 text-right">Consumido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiais.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-4 text-center text-muted">Sem movimentações no período.</td></tr>
                    ) : materiais.map(([name, v]) => (
                      <tr key={name} className="border-b border-ink-border/50 last:border-0">
                        <td className="px-4 py-2 text-strong">{name}</td>
                        <td className="px-4 py-2 text-right text-muted-soft">{v.comprado}</td>
                        <td className="px-4 py-2 text-right text-gold">{formatBRL(v.compradoValor)}</td>
                        <td className="px-4 py-2 text-right text-muted-soft">{v.consumido}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orçamentos por status + Top despesas */}
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-strong mb-2">Orçamentos por status</h2>
                <div className="card p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted border-b border-ink-border">
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Qtd</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(orcamentos).length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-4 text-center text-muted">Nenhum orçamento no período.</td></tr>
                      ) : (Object.entries(orcamentos) as [Enums<'quote_status'>, { count: number; total: number }][]).map(([st, v]) => (
                        <tr key={st} className="border-b border-ink-border/50 last:border-0">
                          <td className="px-4 py-2 text-strong">{QUOTE_STATUS_LABEL[st]}</td>
                          <td className="px-4 py-2 text-right text-muted-soft">{v.count}</td>
                          <td className="px-4 py-2 text-right text-gold">{formatBRL(v.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-strong mb-2">Maiores despesas (por categoria)</h2>
                <div className="card p-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {fin.topDespesas.length === 0 ? (
                        <tr><td className="px-4 py-4 text-center text-muted">Sem despesas no período.</td></tr>
                      ) : fin.topDespesas.map(([cat, val]) => (
                        <tr key={cat} className="border-b border-ink-border/50 last:border-0">
                          <td className="px-4 py-2 text-strong">{cat}</td>
                          <td className="px-4 py-2 text-right text-critical">{formatBRL(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: 'gold' | 'critical' | 'success' }) {
  const color = accent === 'gold' ? 'text-gold' : accent === 'success' ? 'text-success' : 'text-critical';
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
