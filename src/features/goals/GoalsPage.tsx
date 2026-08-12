import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { computeGoal } from '@/lib/pricing';
import { useOrgCostParams } from '@/features/pricing/useOrgCostParams';
import { InfoTooltip } from '@/components/InfoTooltip';

/**
 * Minha Meta (§18): "quanto quero ganhar por mês?" → faturamento necessário,
 * valor/hora, valor/dia e nº de serviços. Simulador what-if de metas.
 */
export function GoalsPage() {
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const cost = useOrgCostParams();
  const qc = useQueryClient();

  const [desiredProfit, setDesiredProfit] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [commission, setCommission] = useState(0); // fração
  const [msg, setMsg] = useState<string | null>(null);

  const { data: goal } = useQuery({
    queryKey: ['goal', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('organization_id', orgId!)
        .is('professional_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (goal) setDesiredProfit(goal.desired_profit_month);
  }, [goal]);

  const result = computeGoal({
    desiredProfitMonth: desiredProfit,
    totalMonthlyFixedCost: cost.totalMonthlyFixed,
    commission,
    tax: cost.taxRate,
    productiveHoursMonth: cost.productiveHoursMonth,
    workingDaysMonth: organization?.working_days_per_month ?? 0,
    averageTicket: averageTicket || undefined,
  });

  async function saveGoal() {
    if (!orgId) return;
    setMsg(null);
    const payload = { organization_id: orgId, professional_id: null, desired_profit_month: desiredProfit };
    if (goal) {
      await supabase.from('goals').update(payload).eq('id', goal.id);
    } else {
      await supabase.from('goals').insert(payload);
    }
    await qc.invalidateQueries({ queryKey: ['goal'] });
    setMsg('Meta salva.');
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-strong mb-1">Minha Meta</h1>
        <p className="text-sm text-muted">
          Descubra quanto precisa faturar para atingir o lucro desejado. Custos fixos mensais:{' '}
          <span className="text-gold">{formatBRL(cost.totalMonthlyFixed)}</span>.
        </p>
      </div>

      <div className="card grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Lucro desejado / mês (R$)</label>
          <input className="input" type="number" step="0.01" value={desiredProfit} onChange={(e) => setDesiredProfit(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Ticket médio (R$)</label>
          <input className="input" type="number" step="0.01" value={averageTicket} onChange={(e) => setAverageTicket(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Comissão média (%)</label>
          <input className="input" type="number" step="0.01" value={commission * 100} onChange={(e) => setCommission((Number(e.target.value) || 0) / 100)} />
        </div>
      </div>

      {!result.feasible && (
        <p className="text-critical text-sm">Comissão + impostos ≥ 100%: ajuste os valores.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Faturamento necessário"
          value={formatBRL(result.requiredRevenue)}
          accent
          tip="Faturamento = (custos fixos mensais + lucro desejado) ÷ (1 − comissão − impostos)."
        />
        <Metric label="Por hora produtiva" value={formatBRL(result.requiredPerHour)} />
        <Metric label="Por dia" value={formatBRL(result.requiredPerDay)} />
        <Metric
          label="Serviços necessários"
          value={result.servicesNeeded != null ? Math.ceil(result.servicesNeeded).toString() : '—'}
        />
      </div>

      {cost.productiveHoursMonth <= 0 && (
        <p className="text-xs text-critical">Defina suas horas produtivas em Configurações para os cálculos por hora/dia.</p>
      )}

      {canWrite && (
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={saveGoal}>Salvar meta</button>
          {msg && <span className="text-success text-sm">{msg}</span>}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, accent, tip }: { label: string; value: string; accent?: boolean; tip?: string }) {
  return (
    <div className="card">
      <div className="text-xs text-muted flex items-center">
        {label}
        {tip && <InfoTooltip text={tip} origin="Minha Meta" />}
      </div>
      <div className={`text-2xl font-semibold mt-1 ${accent ? 'text-gold' : 'text-strong'}`}>{value}</div>
    </div>
  );
}
