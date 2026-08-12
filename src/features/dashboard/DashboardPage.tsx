import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL, formatPercent } from '@/lib/money/format';
import { computeGoal } from '@/lib/pricing';
import { useOrgCostParams } from '@/features/pricing/useOrgCostParams';
import { LearningTrail } from '@/features/onboarding/LearningTrail';

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function DashboardPage() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const cost = useOrgCostParams();

  const { data: entries } = useQuery({
    queryKey: ['dash-cash', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_entries')
        .select('direction, amount, entry_date')
        .eq('organization_id', orgId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['dash-products', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('name, stock_current, stock_min')
        .eq('organization_id', orgId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: goal } = useQuery({
    queryKey: ['dash-goal', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('desired_profit_month')
        .eq('organization_id', orgId!)
        .is('professional_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    let inc = 0, out = 0;
    for (const e of entries ?? []) {
      if (monthKey(new Date(e.entry_date)) !== thisMonth) continue;
      if (e.direction === 'in') inc += e.amount;
      else out += e.amount;
    }
    const profit = inc - out;
    const margin = inc > 0 ? profit / inc : 0;
    return { inc, out, profit, margin };
  }, [entries]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { mes: string; Entradas: number; Saídas: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(monthKey(d), {
        mes: d.toLocaleDateString('pt-BR', { month: 'short' }),
        Entradas: 0,
        Saídas: 0,
      });
    }
    for (const e of entries ?? []) {
      const key = monthKey(new Date(e.entry_date));
      const b = buckets.get(key);
      if (!b) continue;
      if (e.direction === 'in') b.Entradas += e.amount;
      else b['Saídas'] += e.amount;
    }
    return Array.from(buckets.values());
  }, [entries]);

  const lowStock = (products ?? []).filter((p) => p.stock_current < p.stock_min);

  const goalResult = computeGoal({
    desiredProfitMonth: goal?.desired_profit_month ?? 0,
    totalMonthlyFixedCost: cost.totalMonthlyFixed,
    commission: 0,
    tax: cost.taxRate,
    productiveHoursMonth: cost.productiveHoursMonth,
    workingDaysMonth: organization?.working_days_per_month ?? 0,
  });
  const metaPct =
    goalResult.requiredRevenue > 0 ? kpis.inc / goalResult.requiredRevenue : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-strong mb-1">Dashboard</h1>
      <p className="text-sm text-muted mb-6">Visão do mês atual.</p>

      <LearningTrail />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Kpi label="Faturamento (mês)" value={formatBRL(kpis.inc)} />
        <Kpi label="Saídas (mês)" value={formatBRL(kpis.out)} accent="critical" />
        <Kpi label="Lucro (mês)" value={formatBRL(kpis.profit)} accent="gold" />
        <Kpi label="Margem" value={formatPercent(kpis.margin)} accent="success" />
        <Kpi label="Meta atingida" value={formatPercent(metaPct)} accent="gold" />
        <Kpi label="Estoque crítico" value={String(lowStock.length)} accent={lowStock.length ? 'critical' : 'success'} />
      </div>

      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-strong mb-3">Entradas × Saídas (6 meses)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a30" />
              <XAxis dataKey="mes" stroke="#8a8a92" fontSize={12} />
              <YAxis stroke="#8a8a92" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: '#1b1b1f', border: '1px solid #2a2a30', borderRadius: 8 }}
                formatter={(v: number) => formatBRL(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Entradas" fill="#2fbf71" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Saídas" fill="#e5352b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="card border-critical/40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-critical font-medium">⚠ {lowStock.length} produto(s) abaixo do mínimo</p>
            <Link to="/inventory" className="text-xs text-gold hover:underline">Ver estoque →</Link>
          </div>
          <p className="text-xs text-muted mt-1">{lowStock.map((p) => p.name).join(', ')}</p>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: 'gold' | 'critical' | 'success' }) {
  const color =
    accent === 'gold' ? 'text-gold' : accent === 'critical' ? 'text-critical' : accent === 'success' ? 'text-success' : 'text-strong';
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
