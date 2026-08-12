import { formatBRL, formatPercent } from '@/lib/money/format';
import type { PriceResult, PriceTiers } from '@/lib/pricing';

function TierCard({
  title,
  result,
  accent,
  highlight,
}: {
  title: string;
  result: PriceResult;
  accent: 'muted' | 'gold' | 'success';
  highlight?: boolean;
}) {
  const color = accent === 'gold' ? 'text-gold' : accent === 'success' ? 'text-success' : 'text-white';
  return (
    <div className={`card ${highlight ? 'border-gold/60' : ''}`}>
      <div className="text-xs text-muted">{title}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{formatBRL(result.price)}</div>
      {!result.feasible && (
        <div className="text-[11px] text-critical mt-1">Inviável (encargos + margem ≥ 100%)</div>
      )}
      <dl className="mt-3 space-y-1 text-[11px] text-muted">
        <Row label="Custo" value={formatBRL(result.cost)} />
        <Row label="Comissão" value={formatBRL(result.commissionValue)} />
        <Row label="Impostos" value={formatBRL(result.taxValue)} />
        <Row label="Lucro" value={formatBRL(result.profitValue)} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="text-muted-soft">{value}</dd>
    </div>
  );
}

export function PriceBreakdown({
  tiers,
  commission,
  tax,
}: {
  tiers: PriceTiers;
  commission: number;
  tax: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Composição do preço</h2>
        <div className="text-[11px] text-muted">
          Comissão {formatPercent(commission)} · Impostos {formatPercent(tax)}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-xs text-muted">Custo de execução</div>
          <div className="text-2xl font-semibold mt-1 text-critical">{formatBRL(tiers.cost)}</div>
          <p className="text-[11px] text-muted mt-3">Piso: abaixo disto, prejuízo antes de encargos.</p>
        </div>
        <TierCard title="Preço mínimo" result={tiers.min} accent="muted" />
        <TierCard title="Preço recomendado" result={tiers.recommended} accent="gold" highlight />
        <TierCard title="Preço premium" result={tiers.premium} accent="success" />
      </div>
    </div>
  );
}
