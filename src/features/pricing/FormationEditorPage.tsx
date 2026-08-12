import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { executionCost, fixedCostShare, computePriceTiers } from '@/lib/pricing';
import { useOrgCostParams } from './useOrgCostParams';
import { useFormation, useSaveFormation, type Component } from './useFormation';
import { PriceBreakdown } from './PriceBreakdown';
import type { Tables } from '@/lib/supabase/database.types';

let counter = 0;
const newKey = () => `c${counter++}`;

function amountOf(c: Component): number {
  if (c.kind === 'labor') return (c.hours ?? 0) * (c.value ?? 0);
  if (c.kind === 'material') return (c.quantity ?? 0) * (c.unit_cost ?? 0);
  return c.amount ?? 0;
}

export function FormationEditorPage() {
  const { serviceId = '' } = useParams();
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const cost = useOrgCostParams();

  const { data: service } = useQuery({
    queryKey: ['service', serviceId, orgId],
    enabled: !!orgId && !!serviceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('organization_id', orgId!)
        .single();
      if (error) throw error;
      return data as Tables<'services'>;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-min', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, avg_cost, unit')
        .eq('organization_id', orgId!)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: professionals } = useQuery({
    queryKey: ['professionals-min', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name')
        .eq('organization_id', orgId!)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: existing, isLoading: loadingFormation } = useFormation(serviceId);
  const save = useSaveFormation();

  const [components, setComponents] = useState<Component[]>([]);
  const [commission, setCommission] = useState(0); // fração
  const [initialized, setInitialized] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Inicializa o estado a partir da formação existente (uma vez).
  useEffect(() => {
    if (initialized || loadingFormation) return;
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comps: any[] = (existing as any).service_price_components ?? [];
      setComponents(
        comps.map((c) => ({
          key: newKey(),
          kind: c.kind,
          label: c.label,
          professional_id: c.professional_id,
          hours: c.hours ?? undefined,
          value: c.kind === 'labor' ? (c.unit_cost ?? undefined) : undefined,
          product_id: c.product_id,
          quantity: c.quantity ?? undefined,
          unit_cost: c.unit_cost ?? undefined,
          amount: c.amount ?? undefined,
        })),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCommission((existing as any).commission_percent ?? 0);
    }
    setInitialized(true);
  }, [existing, loadingFormation, initialized]);

  const serviceHours = service?.estimated_hours ?? 0;

  const derived = useMemo(() => {
    const laborCost = components.filter((c) => c.kind === 'labor').reduce((s, c) => s + amountOf(c), 0);
    const materialCost = components.filter((c) => c.kind === 'material').reduce((s, c) => s + amountOf(c), 0);
    const additionalCost = components.filter((c) => c.kind === 'additional').reduce((s, c) => s + amountOf(c), 0);
    const fixedShare = fixedCostShare(cost.fixedCostPerHour, serviceHours);
    const totalCost = executionCost({ laborCost, materialCost, additionalCost, fixedCostShare: fixedShare });
    const tiers = computePriceTiers({
      cost: totalCost,
      commission,
      tax: cost.taxRate,
      marginMin: cost.marginMin,
      marginRecommended: cost.marginRecommended,
      marginPremium: cost.marginPremium,
    });
    return { laborCost, materialCost, additionalCost, fixedShare, totalCost, tiers };
  }, [components, commission, cost, serviceHours]);

  function addComponent(kind: Component['kind']) {
    setComponents((prev) => [...prev, { key: newKey(), kind, label: '' }]);
  }
  function updateComponent(key: string, patch: Partial<Component>) {
    setComponents((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }
  function removeComponent(key: string) {
    setComponents((prev) => prev.filter((c) => c.key !== key));
  }

  async function handleSave() {
    setSaveErr(null);
    setSaveMsg(null);
    try {
      await save.mutateAsync({
        serviceId,
        components: components.map((c) => ({ ...c, amount: amountOf(c) })),
        results: {
          cost_total: derived.totalCost,
          price_min: derived.tiers.min.price,
          price_recommended: derived.tiers.recommended.price,
          price_premium: derived.tiers.premium.price,
          commission,
          fixed_cost_per_hour: cost.fixedCostPerHour,
          tax_rate: cost.taxRate,
          margin_min: cost.marginMin,
          margin_recommended: cost.marginRecommended,
          margin_premium: cost.marginPremium,
        },
      });
      setSaveMsg('Formação de preço salva.');
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  }

  if (!service) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/pricing" className="text-xs text-muted hover:text-gold">← Voltar</Link>
        <h1 className="text-xl font-semibold text-strong mt-1">{service.name}</h1>
        <p className="text-sm text-muted">
          {service.estimated_hours}h estimadas · Custo fixo rateado:{' '}
          <span className="text-gold">{formatBRL(derived.fixedShare)}</span>
          {cost.productiveHoursMonth <= 0 && (
            <span className="text-critical"> · defina suas horas produtivas em Configurações</span>
          )}
        </p>
      </div>

      {/* Composição do preço (topo, sempre visível) */}
      <PriceBreakdown tiers={derived.tiers} commission={commission} tax={cost.taxRate} />

      {/* Componentes */}
      <div className="space-y-4">
        <ComponentSection
          title="Mão de obra"
          kind="labor"
          components={components.filter((c) => c.kind === 'labor')}
          onAdd={() => addComponent('labor')}
          onUpdate={updateComponent}
          onRemove={removeComponent}
          professionals={professionals ?? []}
          products={products ?? []}
          canWrite={canWrite}
        />
        <ComponentSection
          title="Materiais"
          kind="material"
          components={components.filter((c) => c.kind === 'material')}
          onAdd={() => addComponent('material')}
          onUpdate={updateComponent}
          onRemove={removeComponent}
          professionals={professionals ?? []}
          products={products ?? []}
          canWrite={canWrite}
        />
        <ComponentSection
          title="Custos adicionais"
          kind="additional"
          components={components.filter((c) => c.kind === 'additional')}
          onAdd={() => addComponent('additional')}
          onUpdate={updateComponent}
          onRemove={removeComponent}
          professionals={professionals ?? []}
          products={products ?? []}
          canWrite={canWrite}
        />
      </div>

      {/* Comissão */}
      <div className="card max-w-xs">
        <label className="label">Comissão total (%)</label>
        <input
          className="input"
          type="number"
          step="0.01"
          value={commission * 100}
          onChange={(e) => setCommission((Number(e.target.value) || 0) / 100)}
          disabled={!canWrite}
        />
        <p className="text-[11px] text-muted mt-1">Incide sobre o preço de venda (não sobre o custo).</p>
      </div>

      {canWrite && (
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? 'Salvando…' : 'Salvar formação de preço'}
          </button>
          {saveMsg && <span className="text-success text-sm">{saveMsg}</span>}
          {saveErr && <span className="text-critical text-sm">{saveErr}</span>}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  kind: Component['kind'];
  components: Component[];
  onAdd: () => void;
  onUpdate: (key: string, patch: Partial<Component>) => void;
  onRemove: (key: string) => void;
  professionals: { id: string; name: string }[];
  products: { id: string; name: string; avg_cost: number }[];
  canWrite: boolean;
}

function ComponentSection({
  title,
  kind,
  components,
  onAdd,
  onUpdate,
  onRemove,
  professionals,
  products,
  canWrite,
}: SectionProps) {
  const subtotal = components.reduce((s, c) => s + amountOf(c), 0);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-strong">
          {title} <span className="text-gold ml-2">{formatBRL(subtotal)}</span>
        </h3>
        {canWrite && (
          <button className="btn-ghost text-xs py-1" onClick={onAdd}>
            + Adicionar
          </button>
        )}
      </div>
      {components.length === 0 ? (
        <p className="text-xs text-muted">Nenhum item.</p>
      ) : (
        <div className="space-y-2">
          {components.map((c) => (
            <div key={c.key} className="grid grid-cols-12 gap-2 items-end">
              {kind === 'labor' && (
                <>
                  <div className="col-span-4">
                    <label className="label">Profissional</label>
                    <select
                      className="input"
                      value={c.professional_id ?? ''}
                      onChange={(e) => onUpdate(c.key, { professional_id: e.target.value || null, label: professionals.find((p) => p.id === e.target.value)?.name ?? c.label })}
                      disabled={!canWrite}
                    >
                      <option value="">—</option>
                      {professionals.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="label">Horas</label>
                    <input className="input" type="number" step="0.1" value={c.hours ?? ''} onChange={(e) => onUpdate(c.key, { hours: Number(e.target.value) || 0 })} disabled={!canWrite} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Valor/hora</label>
                    <input className="input" type="number" step="0.01" value={c.value ?? ''} onChange={(e) => onUpdate(c.key, { value: Number(e.target.value) || 0 })} disabled={!canWrite} />
                  </div>
                </>
              )}
              {kind === 'material' && (
                <>
                  <div className="col-span-5">
                    <label className="label">Produto</label>
                    <select
                      className="input"
                      value={c.product_id ?? ''}
                      onChange={(e) => {
                        const p = products.find((x) => x.id === e.target.value);
                        onUpdate(c.key, { product_id: e.target.value || null, unit_cost: p?.avg_cost ?? 0, label: p?.name ?? c.label });
                      }}
                      disabled={!canWrite}
                    >
                      <option value="">—</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.avg_cost)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="label">Quantidade</label>
                    <input className="input" type="number" step="0.0001" value={c.quantity ?? ''} onChange={(e) => onUpdate(c.key, { quantity: Number(e.target.value) || 0 })} disabled={!canWrite} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Custo un.</label>
                    <input className="input" type="number" step="0.01" value={c.unit_cost ?? ''} onChange={(e) => onUpdate(c.key, { unit_cost: Number(e.target.value) || 0 })} disabled={!canWrite} />
                  </div>
                </>
              )}
              {kind === 'additional' && (
                <>
                  <div className="col-span-7">
                    <label className="label">Descrição</label>
                    <input className="input" value={c.label} onChange={(e) => onUpdate(c.key, { label: e.target.value })} disabled={!canWrite} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Valor (R$)</label>
                    <input className="input" type="number" step="0.01" value={c.amount ?? ''} onChange={(e) => onUpdate(c.key, { amount: Number(e.target.value) || 0 })} disabled={!canWrite} />
                  </div>
                </>
              )}
              <div className="col-span-1 text-right text-xs text-gold pb-2">{formatBRL(amountOf(c))}</div>
              {canWrite && (
                <div className="col-span-1 pb-1">
                  <button className="text-critical text-xs" onClick={() => onRemove(c.key)}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
