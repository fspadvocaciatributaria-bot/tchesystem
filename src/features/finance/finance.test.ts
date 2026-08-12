import { describe, it, expect } from 'vitest';
import { openAmount, isOverdue, computeKpis, buildInstallments } from './finance';
import type { Transaction, FinancialAccount } from './types';

const tx = (o: Partial<Transaction>): Transaction => ({
  id: 'x', organization_id: 'o', type: 'payable', description: 'd', document_number: null,
  document_type: 'manual', amount: 100, due_date: '2026-01-01', issue_date: null, status: 'pending',
  supplier_id: null, customer_id: null, classification_category_id: null, financial_account_id: null,
  paid_amount: 0, payment_date: null, discount: 0, surcharge_interest: 0, late_fee: 0, observation: null,
  imported_from_xml: false, xml_chave: null, installment_number: null, installments_total: null,
  created_at: '', ...o,
});

describe('finance helpers', () => {
  it('openAmount', () => {
    expect(openAmount({ amount: 100, paid_amount: 40 })).toBe(60);
    expect(openAmount({ amount: 100, paid_amount: 100 })).toBe(0);
  });
  it('isOverdue', () => {
    expect(isOverdue({ status: 'pending', due_date: '2020-01-01' }, '2026-08-12')).toBe(true);
    expect(isOverdue({ status: 'paid', due_date: '2020-01-01' }, '2026-08-12')).toBe(false);
    expect(isOverdue({ status: 'pending', due_date: '2099-01-01' }, '2026-08-12')).toBe(false);
  });

  it('computeKpis: saldo, a pagar, a receber, vencidos', () => {
    const accounts: FinancialAccount[] = [
      { id: 'a', organization_id: 'o', bank_id: null, name: 'Caixa', agency: null, account_number: null, digit: null, account_type: 'cash', initial_balance: 1000, owner_type: 'company', active: true },
    ];
    const txs = [
      tx({ type: 'receivable', amount: 500, paid_amount: 500, status: 'paid' }), // recebido
      tx({ type: 'payable', amount: 200, paid_amount: 200, status: 'paid' }), // pago
      tx({ type: 'payable', amount: 300, paid_amount: 0, status: 'pending', due_date: '2020-01-01' }), // a pagar + vencido
      tx({ type: 'receivable', amount: 400, paid_amount: 100, status: 'partial', due_date: '2099-01-01' }), // a receber 300
    ];
    const k = computeKpis(txs, accounts, '2026-08-12');
    // saldo = inicial 1000 + recebido (500 + 100 parcial) − pago 200
    expect(k.saldoRealizado).toBe(1000 + 600 - 200);
    expect(k.aPagar).toBe(300);
    expect(k.aReceber).toBe(300);
    expect(k.vencidoCount).toBe(1);
    expect(k.vencidoValor).toBe(300);
  });

  it('buildInstallments soma exata ao total', () => {
    const p = buildInstallments(1000, 3, '2026-01-10', 30);
    expect(p).toHaveLength(3);
    expect(p.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(1000, 2);
    expect(p[0].due_date).toBe('2026-01-10');
    expect(p[1].due_date).toBe('2026-02-09');
    expect(p[2].installment_number).toBe(3);
  });
});
