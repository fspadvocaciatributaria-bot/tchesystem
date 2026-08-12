// Valor da hora e meta de lucro (PRICING_RULES.md §8, §9, D-005).

export interface HourlyValueInput {
  fixedCostPerHour: number;
  variableCostPerHour?: number;
  laborCostPerHour?: number;
  commission: number; // c
  tax: number; // t
  marginMin: number;
  marginRecommended: number;
}

export interface HourlyValueResult {
  costPerHour: number;
  minPerHour: number;
  recommendedPerHour: number;
}

export function computeHourlyValue(i: HourlyValueInput): HourlyValueResult {
  const costPerHour =
    Math.max(0, i.fixedCostPerHour) +
    Math.max(0, i.variableCostPerHour ?? 0) +
    Math.max(0, i.laborCostPerHour ?? 0);
  const denomMin = 1 - i.commission - i.tax - i.marginMin;
  const denomRec = 1 - i.commission - i.tax - i.marginRecommended;
  return {
    costPerHour,
    minPerHour: denomMin > 0 ? costPerHour / denomMin : 0,
    recommendedPerHour: denomRec > 0 ? costPerHour / denomRec : 0,
  };
}

export interface GoalInput {
  desiredProfitMonth: number;
  totalMonthlyFixedCost: number;
  commission: number; // c
  tax: number; // t
  productiveHoursMonth: number;
  workingDaysMonth: number;
  averageTicket?: number; // para nº de serviços
  plannedServices?: number; // para ticket necessário
}

export interface GoalResult {
  requiredRevenue: number;
  requiredPerHour: number;
  requiredPerDay: number;
  servicesNeeded: number | null; // depende de averageTicket
  requiredAverageTicket: number | null; // depende de plannedServices
  feasible: boolean;
}

/**
 * Meta de lucro (§9, D-005): custos variáveis de material entram por-serviço no
 * ticket, não aqui. faturamentoNecessário = (custosFixos + lucroAlvo) / (1 − c − t).
 */
export function computeGoal(i: GoalInput): GoalResult {
  const denom = 1 - i.commission - i.tax;
  const feasible = denom > 0;
  const requiredRevenue = feasible
    ? (i.totalMonthlyFixedCost + i.desiredProfitMonth) / denom
    : 0;
  return {
    requiredRevenue,
    requiredPerHour: i.productiveHoursMonth > 0 ? requiredRevenue / i.productiveHoursMonth : 0,
    requiredPerDay: i.workingDaysMonth > 0 ? requiredRevenue / i.workingDaysMonth : 0,
    servicesNeeded:
      i.averageTicket && i.averageTicket > 0 ? requiredRevenue / i.averageTicket : null,
    requiredAverageTicket:
      i.plannedServices && i.plannedServices > 0 ? requiredRevenue / i.plannedServices : null,
    feasible,
  };
}
