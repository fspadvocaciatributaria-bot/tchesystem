import { formatBRL, formatPercent } from '@/lib/money/format';

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'gold' | 'critical' | 'success';
}) {
  const color =
    accent === 'gold'
      ? 'text-gold'
      : accent === 'critical'
        ? 'text-critical'
        : accent === 'success'
          ? 'text-success'
          : 'text-white';
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

/**
 * Dashboard — placeholder de dados na FASE 1. Os KPIs serão ligados a queries reais
 * na FASE 5. Demonstra tokens de design e formatação BRL.
 */
export function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">
        Visão executiva do seu negócio. (Dados reais na FASE 5.)
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label="Faturamento (mês)" value={formatBRL(0)} />
        <Kpi label="Custos" value={formatBRL(0)} />
        <Kpi label="Lucro" value={formatBRL(0)} accent="gold" />
        <Kpi label="Margem" value={formatPercent(0)} accent="success" />
        <Kpi label="Meta atingida" value={formatPercent(0)} accent="gold" />
        <Kpi label="Estoque crítico" value="0" accent="critical" />
      </div>
    </div>
  );
}
