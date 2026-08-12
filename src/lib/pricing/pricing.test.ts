import { describe, it, expect } from 'vitest';
import {
  monthlyFactor,
  totalMonthlyFixedCost,
  weightedAvgCostAfterEntry,
  materialCost,
  laborComponentCost,
  totalCommissionPercent,
  productiveHoursPerMonth,
  fixedCostPerHour,
  fixedCostShare,
  executionCost,
  computePrice,
  computePriceTiers,
  computeHourlyValue,
  computeGoal,
  computeQuoteTotals,
  resolveDiscount,
} from './index';

describe('periodicity (§1, D-001)', () => {
  it('converte periodicidades para base mensal', () => {
    expect(monthlyFactor('monthly')).toBe(1);
    expect(monthlyFactor('weekly')).toBeCloseTo(4.3333, 3);
    expect(monthlyFactor('yearly')).toBeCloseTo(0.08333, 4);
    expect(monthlyFactor('daily')).toBeCloseTo(30.4375, 4);
    expect(monthlyFactor('custom', 2.5)).toBe(2.5);
    expect(monthlyFactor('custom', null)).toBe(0);
  });

  it('soma custos fixos mensais ignorando inativos', () => {
    const total = totalMonthlyFixedCost([
      { amount: 1000, periodicity: 'monthly' },
      { amount: 1200, periodicity: 'yearly' }, // 100/mês
      { amount: 500, periodicity: 'monthly', isActive: false }, // ignorado
    ]);
    expect(total).toBeCloseTo(1100, 6);
  });
});

describe('inventory — custo médio ponderado (§5, D-002)', () => {
  it('recalcula o custo médio na entrada', () => {
    // 100 un a R$1,00; entra 100 un a R$2,00 => média 1,50
    expect(weightedAvgCostAfterEntry(100, 1, 100, 2)).toBeCloseTo(1.5, 6);
  });
  it('parte de zero corretamente', () => {
    expect(weightedAvgCostAfterEntry(0, 0, 100, 1)).toBeCloseTo(1, 6);
  });
  it('custo do material consumido', () => {
    expect(materialCost(5, 1)).toBe(5);
    expect(materialCost(-5, 1)).toBe(0);
  });
});

describe('labor — modelos de remuneração (§4)', () => {
  it('hourly', () => {
    expect(laborComponentCost({ model: 'hourly', hours: 5, hourlyValue: 150 })).toBe(750);
  });
  it('per_service', () => {
    expect(laborComponentCost({ model: 'per_service', serviceValue: 300 })).toBe(300);
  });
  it('monthly_cost rateado por hora produtiva', () => {
    // 3300/mês, 132 h produtivas => 25/h; 5h => 125
    const c = laborComponentCost({
      model: 'monthly_cost',
      hours: 5,
      monthlyValue: 3300,
      productiveHoursMonth: 132,
    });
    expect(c).toBeCloseTo(125, 6);
  });
  it('commission_percent não entra no custo fixo', () => {
    expect(laborComponentCost({ model: 'commission_percent', commissionPercent: 0.3 })).toBe(0);
    expect(
      totalCommissionPercent([
        { model: 'commission_percent', commissionPercent: 0.3 },
        { model: 'hourly', hours: 1, hourlyValue: 10 },
      ]),
    ).toBeCloseTo(0.3, 6);
  });
});

describe('rateio de custo fixo (§2)', () => {
  it('horas produtivas mensais', () => {
    expect(productiveHoursPerMonth({ workingDaysPerMonth: 22, productiveHoursPerDay: 6 })).toBe(132);
  });
  it('custo fixo por hora e rateio', () => {
    expect(fixedCostPerHour(6600, 132)).toBeCloseTo(50, 6);
    expect(fixedCostShare(50, 5)).toBe(250);
  });
  it('guarda contra divisão por zero', () => {
    expect(fixedCostPerHour(6600, 0)).toBe(0);
  });
});

describe('preço — fórmula-mestra (§6, §7, D-003, D-004)', () => {
  const cost = executionCost({
    laborCost: 750,
    materialCost: 50,
    additionalCost: 0,
    fixedCostShare: 250,
  });

  it('CUSTO de execução soma os componentes', () => {
    expect(cost).toBe(1050);
  });

  it('P = CUSTO / (1 − c − t − m)', () => {
    // custo 1000, comissão 0, imposto 0, margem 0.30 => 1000/0.7 = 1428.57...
    const r = computePrice({ cost: 1000, commission: 0, tax: 0, margin: 0.3 });
    expect(r.price).toBeCloseTo(1428.5714, 3);
    expect(r.profitValue).toBeCloseTo(428.5714, 3);
    expect(r.feasible).toBe(true);
  });

  it('decompõe comissão, imposto e lucro sobre o preço', () => {
    const r = computePrice({ cost: 1000, commission: 0.1, tax: 0.06, margin: 0.24 });
    // denom = 0.6 => preço 1666.67
    expect(r.price).toBeCloseTo(1666.6667, 3);
    expect(r.commissionValue).toBeCloseTo(166.6667, 3);
    expect(r.taxValue).toBeCloseTo(100, 3);
    expect(r.profitValue).toBeCloseTo(400, 3);
    // custo + comissão + imposto + lucro == preço
    expect(r.cost + r.commissionValue + r.taxValue + r.profitValue).toBeCloseTo(r.price, 6);
  });

  it('marca inviável quando c+t+m >= 1', () => {
    const r = computePrice({ cost: 1000, commission: 0.5, tax: 0.3, margin: 0.3 });
    expect(r.feasible).toBe(false);
    expect(r.price).toBe(0);
  });

  it('os quatro valores respeitam min <= rec <= premium', () => {
    const t = computePriceTiers({
      cost: 1000,
      commission: 0,
      tax: 0,
      marginMin: 0.1,
      marginRecommended: 0.3,
      marginPremium: 0.5,
    });
    expect(t.cost).toBe(1000);
    expect(t.min.price).toBeLessThan(t.recommended.price);
    expect(t.recommended.price).toBeLessThan(t.premium.price);
  });
});

describe('valor da hora (§8)', () => {
  it('calcula custo/hora e valores mínimo/recomendado', () => {
    const r = computeHourlyValue({
      fixedCostPerHour: 50,
      variableCostPerHour: 0,
      laborCostPerHour: 0,
      commission: 0,
      tax: 0,
      marginMin: 0.1,
      marginRecommended: 0.3,
    });
    expect(r.costPerHour).toBe(50);
    expect(r.minPerHour).toBeCloseTo(50 / 0.9, 4);
    expect(r.recommendedPerHour).toBeCloseTo(50 / 0.7, 4);
  });
});

describe('meta de lucro (§9, D-005)', () => {
  it('faturamento necessário = (fixos + lucro)/(1 − c − t)', () => {
    const g = computeGoal({
      desiredProfitMonth: 15000,
      totalMonthlyFixedCost: 5000,
      commission: 0,
      tax: 0,
      productiveHoursMonth: 132,
      workingDaysMonth: 22,
      averageTicket: 800,
    });
    expect(g.requiredRevenue).toBe(20000);
    expect(g.requiredPerHour).toBeCloseTo(20000 / 132, 4);
    expect(g.requiredPerDay).toBeCloseTo(20000 / 22, 4);
    expect(g.servicesNeeded).toBeCloseTo(25, 6);
  });
  it('desconta comissão e imposto da receita', () => {
    const g = computeGoal({
      desiredProfitMonth: 9000,
      totalMonthlyFixedCost: 1000,
      commission: 0.1,
      tax: 0.1,
      productiveHoursMonth: 100,
      workingDaysMonth: 20,
    });
    // (1000+9000)/0.8 = 12500
    expect(g.requiredRevenue).toBe(12500);
  });
});

describe('orçamento (§10)', () => {
  it('subtotal, desconto e total', () => {
    const q = computeQuoteTotals(
      [
        { quantity: 1, unitPrice: 850 },
        { quantity: 2, unitPrice: 100 },
      ],
      { type: 'amount', value: 50 },
    );
    expect(q.subtotal).toBe(1050);
    expect(q.discount).toBe(50);
    expect(q.total).toBe(1000);
  });
  it('desconto percentual e nunca negativo', () => {
    expect(resolveDiscount(1000, { type: 'percent', value: 0.1 })).toBe(100);
    expect(resolveDiscount(100, { type: 'amount', value: 999 })).toBe(100); // limitado ao subtotal
  });
});
