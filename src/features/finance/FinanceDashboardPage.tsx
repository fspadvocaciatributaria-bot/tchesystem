import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatBRL } from '@/lib/money/format';
import { useTransactions, useAccounts } from './useFinance';
import { computeKpis, openAmount, isOverdue, isProjected } from './finance';

export function FinanceDashboardPage() {
  const { data: txs, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();

  const kpis = useMemo(() => computeKpis(txs ?? [], accounts ?? []), [txs, accounts]);

  // Próximos vencimentos (em aberto, ordenados por data)
  const proximos = useMemo(
    () => (txs ?? []).filter((t) => isProjected(t)).slice(0, 8),
    [txs],
  );

  // Resumo por classificação (em aberto)
  const porClassif = useMemo(() => {
    const map: Record<string, { name: string; pagar: number; receber: number }> = {};
    for (const t of txs ?? []) {
      if (!isProjected(t)) continue;
      const name = t.classification_categories?.name ?? 'Sem classificação';
      map[name] ??= { name, pagar: 0, receber: 0 };
      if (t.type === 'payable') map[name].pagar += openAmount(t);
      else map[name].receber += openAmount(t);
    }
    return Object.values(map).sort((a, b) => b.pagar + b.receber - (a.pagar + a.receber)).slice(0, 8);
  }, [txs]);

  if (isLoading) return <p className="text-muted text-sm">Carregando…</p>;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-strong">Financeiro</h1>
          <p className="text-sm text-muted mt-1">Contas a pagar e receber, saldo e projeção.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <Link to="/financeiro/lancamentos" className="btn-primary">Lançamentos</Link>
          <Link to="/financeiro/importar" className="btn-ghost">Importar XML</Link>
          <Link to="/financeiro/contas" className="btn-ghost">Contas</Link>
          <Link to="/financeiro/classificacoes" className="btn-ghost">Classificações</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Kpi label="Saldo atual (realizado)" value={formatBRL(kpis.saldoRealizado)} accent="gold" />
        <Kpi label="A pagar (em aberto)" value={formatBRL(kpis.aPagar)} accent="critical" />
        <Kpi label="A receber (em aberto)" value={formatBRL(kpis.aReceber)} accent="success" />
        <Kpi label="Projeção 30 dias" value={formatBRL(kpis.projetado30)} accent={kpis.projetado30 >= 0 ? 'success' : 'critical'} />
        <Kpi label="Vencidos (valor)" value={formatBRL(kpis.vencidoValor)} accent="critical" />
        <Kpi label="Vencidos (qtd)" value={String(kpis.vencidoCount)} accent={kpis.vencidoCount ? 'critical' : 'success'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-strong mb-2">Próximos vencimentos</h2>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
                <th className="px-4 py-2">Venc.</th><th className="px-4 py-2">Descrição</th>
                <th className="px-4 py-2">Tipo</th><th className="px-4 py-2 text-right">Em aberto</th>
              </tr></thead>
              <tbody>
                {proximos.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-muted">Nada em aberto.</td></tr>
                ) : proximos.map((t) => (
                  <tr key={t.id} className="border-b border-ink-border/50 last:border-0">
                    <td className={`px-4 py-2 whitespace-nowrap ${isOverdue(t) ? 'text-critical' : 'text-muted'}`}>
                      {new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-strong">{t.description}</td>
                    <td className={`px-4 py-2 ${t.type === 'payable' ? 'text-critical' : 'text-success'}`}>{t.type === 'payable' ? 'Pagar' : 'Receber'}</td>
                    <td className="px-4 py-2 text-right text-gold">{formatBRL(openAmount(t))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-strong mb-2">Em aberto por classificação</h2>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted border-b border-ink-border">
                <th className="px-4 py-2">Classificação</th>
                <th className="px-4 py-2 text-right">A pagar</th><th className="px-4 py-2 text-right">A receber</th>
              </tr></thead>
              <tbody>
                {porClassif.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-4 text-center text-muted">Sem dados.</td></tr>
                ) : porClassif.map((c) => (
                  <tr key={c.name} className="border-b border-ink-border/50 last:border-0">
                    <td className="px-4 py-2 text-strong">{c.name}</td>
                    <td className="px-4 py-2 text-right text-critical">{c.pagar ? formatBRL(c.pagar) : '—'}</td>
                    <td className="px-4 py-2 text-right text-success">{c.receber ? formatBRL(c.receber) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: 'gold' | 'critical' | 'success' }) {
  const color = accent === 'gold' ? 'text-gold' : accent === 'success' ? 'text-success' : 'text-critical';
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
