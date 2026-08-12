import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import {
  totalMonthlyFixedCost,
  productiveHoursPerMonth,
  fixedCostPerHour,
  type Periodicity,
} from '@/lib/pricing';

export interface OrgCostParams {
  totalMonthlyFixed: number;
  productiveHoursMonth: number;
  fixedCostPerHour: number;
  taxRate: number;
  marginMin: number;
  marginRecommended: number;
  marginPremium: number;
  loading: boolean;
}

/**
 * Deriva os parâmetros de custo da organização para a formação de preço:
 * custo fixo mensal total, horas produtivas/mês e custo fixo por hora.
 * (Ver docs/PRICING_RULES.md §2.)
 */
export function useOrgCostParams(): OrgCostParams {
  const { organization } = useOrg();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['fixed_costs_sum', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_costs')
        .select('amount, periodicity, custom_factor, is_active')
        .eq('organization_id', orgId!)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const totalMonthlyFixed = totalMonthlyFixedCost(
    (data ?? []).map((c) => ({
      amount: c.amount,
      periodicity: c.periodicity as Periodicity,
      customFactor: c.custom_factor,
      isActive: c.is_active,
    })),
  );

  const productiveHoursMonth = organization
    ? productiveHoursPerMonth({
        workingDaysPerMonth: organization.working_days_per_month,
        productiveHoursPerDay: organization.productive_hours_per_day,
      })
    : 0;

  return {
    totalMonthlyFixed,
    productiveHoursMonth,
    fixedCostPerHour: fixedCostPerHour(totalMonthlyFixed, productiveHoursMonth),
    taxRate: organization?.tax_rate ?? 0,
    marginMin: organization?.margin_min ?? 0.1,
    marginRecommended: organization?.margin_recommended ?? 0.3,
    marginPremium: organization?.margin_premium ?? 0.5,
    loading: isLoading,
  };
}
