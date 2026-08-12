// Conversão de periodicidade para base mensal (PRICING_RULES.md §1, D-001).

export type Periodicity = 'monthly' | 'weekly' | 'yearly' | 'daily' | 'custom';

/** Fator multiplicativo que converte um valor da periodicidade dada para base MENSAL. */
export function monthlyFactor(periodicity: Periodicity, customFactor?: number | null): number {
  switch (periodicity) {
    case 'monthly':
      return 1;
    case 'weekly':
      return 52 / 12; // 4.3333...
    case 'yearly':
      return 1 / 12;
    case 'daily':
      return 365.25 / 12; // 30.4375
    case 'custom':
      return customFactor && Number.isFinite(customFactor) ? customFactor : 0;
  }
}

export interface PeriodicCost {
  amount: number;
  periodicity: Periodicity;
  customFactor?: number | null;
  isActive?: boolean;
}

/** Valor mensal equivalente de um custo periódico. */
export function toMonthly(cost: PeriodicCost): number {
  if (cost.isActive === false) return 0;
  return cost.amount * monthlyFactor(cost.periodicity, cost.customFactor);
}

/** Soma dos custos fixos convertidos para base mensal (apenas ativos). */
export function totalMonthlyFixedCost(costs: PeriodicCost[]): number {
  return costs.reduce((sum, c) => sum + toMonthly(c), 0);
}
