import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import type { Enums } from '@/lib/supabase/database.types';

// Estado local de um componente da formação (independente do banco).
export interface Component {
  key: string; // id local para React
  kind: Enums<'price_component_kind'>;
  label: string;
  // labor
  professional_id?: string | null;
  model?: Enums<'labor_model'>;
  hours?: number;
  value?: number; // hourlyValue/serviceValue/monthlyValue/dailyValue conforme o modelo
  commission_percent?: number; // fração
  // material
  product_id?: string | null;
  quantity?: number;
  unit_cost?: number;
  // additional / valor final do componente
  amount?: number;
}

export interface FormationResults {
  cost_total: number;
  price_min: number;
  price_recommended: number;
  price_premium: number;
  commission: number;
  fixed_cost_per_hour: number;
  tax_rate: number;
  margin_min: number;
  margin_recommended: number;
  margin_premium: number;
}

/** Carrega a formação existente (se houver) e seus componentes para edição. */
export function useFormation(serviceId: string) {
  const { organization } = useOrg();
  const orgId = organization?.id;
  return useQuery({
    queryKey: ['formation', serviceId, orgId],
    enabled: !!orgId && !!serviceId,
    queryFn: async () => {
      const { data: formation, error } = await supabase
        .from('service_price_formations')
        .select('*, service_price_components(*)')
        .eq('organization_id', orgId!)
        .eq('service_id', serviceId)
        .maybeSingle();
      if (error) throw error;
      return formation;
    },
  });
}

interface SaveArgs {
  serviceId: string;
  components: Component[];
  results: FormationResults;
}

/** Salva a formação (upsert por service_id) e substitui os componentes. */
export function useSaveFormation() {
  const { organization } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, components, results }: SaveArgs) => {
      if (!orgId) throw new Error('Organização não carregada');

      const { data: formation, error: upErr } = await supabase
        .from('service_price_formations')
        .upsert(
          {
            organization_id: orgId,
            service_id: serviceId,
            margin_min: results.margin_min,
            margin_recommended: results.margin_recommended,
            margin_premium: results.margin_premium,
            tax_rate: results.tax_rate,
            commission_percent: results.commission,
            fixed_cost_per_hour: results.fixed_cost_per_hour,
            cost_total: results.cost_total,
            price_min: results.price_min,
            price_recommended: results.price_recommended,
            price_premium: results.price_premium,
            computed_at: new Date().toISOString(),
          },
          { onConflict: 'service_id' },
        )
        .select()
        .single();
      if (upErr) throw upErr;

      // Substitui componentes: apaga os antigos e insere os atuais.
      const { error: delErr } = await supabase
        .from('service_price_components')
        .delete()
        .eq('formation_id', formation.id);
      if (delErr) throw delErr;

      if (components.length > 0) {
        const rows = components.map((c) => ({
          organization_id: orgId,
          formation_id: formation.id,
          kind: c.kind,
          label: c.label || c.kind,
          professional_id: c.professional_id ?? null,
          hours: c.hours ?? null,
          product_id: c.product_id ?? null,
          quantity: c.quantity ?? null,
          unit_cost: c.unit_cost ?? null,
          amount: c.amount ?? 0,
        }));
        const { error: insErr } = await supabase.from('service_price_components').insert(rows);
        if (insErr) throw insErr;
      }

      return formation;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['formation', vars.serviceId] });
      qc.invalidateQueries({ queryKey: ['pricing-services'] });
    },
  });
}
