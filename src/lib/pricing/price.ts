// Motor central de formação de preço (PRICING_RULES.md §2, §3, §6, §7).
// Todas as funções são PURAS. Nenhum arredondamento intermediário.

export interface ProductivityParams {
  workingDaysPerMonth: number;
  productiveHoursPerDay: number;
}

/** Horas produtivas mensais = dias trabalhados × horas produtivas/dia. */
export function productiveHoursPerMonth(p: ProductivityParams): number {
  return Math.max(0, p.workingDaysPerMonth) * Math.max(0, p.productiveHoursPerDay);
}

/** Custo fixo por hora produtiva. Guarda contra divisão por zero (§2). */
export function fixedCostPerHour(totalMonthlyFixed: number, productiveHoursMonth: number): number {
  if (productiveHoursMonth <= 0) return 0;
  return totalMonthlyFixed / productiveHoursMonth;
}

/** Rateio de custo fixo para um serviço de dada duração. */
export function fixedCostShare(fixedPerHour: number, serviceHours: number): number {
  return Math.max(0, fixedPerHour) * Math.max(0, serviceHours);
}

export interface CostBreakdownInput {
  laborCost: number; // custo fixo de mão de obra (labor.ts)
  materialCost: number; // custo de materiais (inventory.ts)
  additionalCost: number; // deslocamento, taxas, etc.
  fixedCostShare: number; // rateio (fixedCostShare)
}

/** CUSTO de execução (§3) = mão de obra + materiais + adicionais + rateio fixo. */
export function executionCost(i: CostBreakdownInput): number {
  return (
    Math.max(0, i.laborCost) +
    Math.max(0, i.materialCost) +
    Math.max(0, i.additionalCost) +
    Math.max(0, i.fixedCostShare)
  );
}

export interface PriceParams {
  cost: number; // CUSTO de execução
  commission: number; // c — fração de comissão percentual sobre o preço
  tax: number; // t — fração de impostos sobre a receita
  margin: number; // m — margem de lucro sobre o preço
}

export interface PriceResult {
  price: number;
  cost: number;
  commissionValue: number;
  taxValue: number;
  profitValue: number;
  feasible: boolean; // (c + t + m) < 1
}

/**
 * Fórmula-mestra (§6, D-004): P = CUSTO / (1 − c − t − m).
 * Retorna feasible=false (e price=Infinity→0) quando c+t+m ≥ 1.
 */
export function computePrice(params: PriceParams): PriceResult {
  const { cost, commission, tax, margin } = params;
  const denom = 1 - commission - tax - margin;
  const feasible = denom > 0;
  const price = feasible ? cost / denom : 0;
  return {
    price,
    cost,
    commissionValue: price * commission,
    taxValue: price * tax,
    profitValue: price * margin,
    feasible,
  };
}

export interface PriceTierParams {
  cost: number;
  commission: number;
  tax: number;
  marginMin: number;
  marginRecommended: number;
  marginPremium: number;
}

export interface PriceTiers {
  cost: number;
  min: PriceResult;
  recommended: PriceResult;
  premium: PriceResult;
}

/** Os quatro valores exibidos (§7): custo + mínimo/recomendado/premium com breakdown. */
export function computePriceTiers(p: PriceTierParams): PriceTiers {
  const base = { cost: p.cost, commission: p.commission, tax: p.tax };
  return {
    cost: p.cost,
    min: computePrice({ ...base, margin: p.marginMin }),
    recommended: computePrice({ ...base, margin: p.marginRecommended }),
    premium: computePrice({ ...base, margin: p.marginPremium }),
  };
}
