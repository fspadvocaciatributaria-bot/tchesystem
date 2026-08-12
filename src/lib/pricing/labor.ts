// Custo de mão de obra por modelo de remuneração (PRICING_RULES.md §4).

export type LaborModel =
  | 'hourly'
  | 'per_service'
  | 'commission_percent'
  | 'monthly_cost'
  | 'daily_cost';

export interface LaborInput {
  model: LaborModel;
  hours?: number;
  hourlyValue?: number;
  serviceValue?: number;
  commissionPercent?: number; // fração (0.30)
  monthlyValue?: number;
  dailyValue?: number;
  // parâmetros de produtividade para ratear custos mensais/diários
  productiveHoursMonth?: number;
  productiveHoursDay?: number;
}

/**
 * Custo FIXO do componente de mão de obra (não inclui comissão percentual,
 * que incide sobre o preço e é resolvida em price.ts §6).
 * Retorna também a comissão percentual acumulada separadamente.
 */
export function laborComponentCost(input: LaborInput): number {
  const hours = Math.max(0, input.hours ?? 0);
  switch (input.model) {
    case 'hourly':
      return hours * Math.max(0, input.hourlyValue ?? 0);
    case 'per_service':
      return Math.max(0, input.serviceValue ?? 0);
    case 'monthly_cost': {
      const h = input.productiveHoursMonth ?? 0;
      return h > 0 ? (Math.max(0, input.monthlyValue ?? 0) / h) * hours : 0;
    }
    case 'daily_cost': {
      const h = input.productiveHoursDay ?? 0;
      return h > 0 ? (Math.max(0, input.dailyValue ?? 0) / h) * hours : 0;
    }
    case 'commission_percent':
      // Comissão não entra no custo fixo; é tratada no preço (§6).
      return 0;
  }
}

/** Soma das comissões percentuais (frações) dos componentes de mão de obra. */
export function totalCommissionPercent(inputs: LaborInput[]): number {
  return inputs.reduce(
    (sum, i) =>
      sum + (i.model === 'commission_percent' ? Math.max(0, i.commissionPercent ?? 0) : 0),
    0,
  );
}
