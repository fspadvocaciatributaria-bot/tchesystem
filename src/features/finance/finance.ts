// Lógica financeira pura e testável do módulo Contas a Pagar/Receber.
import type { Transaction, FinancialAccount, TransactionStatus } from './types';

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Saldo em aberto de um título (valor − já pago). */
export function openAmount(t: Pick<Transaction, 'amount' | 'paid_amount'>): number {
  return Math.max(0, t.amount - t.paid_amount);
}

/** Está vencido? Pendente/parcial com vencimento antes de hoje. */
export function isOverdue(t: Pick<Transaction, 'status' | 'due_date'>, ref = todayISO()): boolean {
  return (t.status === 'pending' || t.status === 'partial') && t.due_date < ref;
}

/** É projeção? Pendente/parcial ainda não pago (entra no fluxo previsto). */
export function isProjected(t: Pick<Transaction, 'status'>): boolean {
  return t.status === 'pending' || t.status === 'partial';
}

export interface FinanceKpis {
  saldoRealizado: number; // contas: saldo inicial + recebido − pago
  aPagar: number; // pendente/parcial payable (em aberto)
  aReceber: number; // pendente/parcial receivable (em aberto)
  projetado30: number; // (a receber − a pagar) com vencimento nos próximos 30 dias
  vencidoValor: number;
  vencidoCount: number;
}

/**
 * KPIs do painel. saldoRealizado = saldo inicial das contas + entradas pagas − saídas pagas.
 */
export function computeKpis(
  txs: Transaction[],
  accounts: FinancialAccount[],
  ref = todayISO(),
): FinanceKpis {
  const initial = accounts.filter((a) => a.active).reduce((s, a) => s + a.initial_balance, 0);
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const in30ISO = in30.toISOString().slice(0, 10);

  let recebido = 0, pago = 0, aPagar = 0, aReceber = 0, projPag = 0, projRec = 0, vencidoValor = 0, vencidoCount = 0;

  for (const t of txs) {
    if (t.status === 'cancelled') continue;
    if (t.type === 'receivable') recebido += t.paid_amount;
    else pago += t.paid_amount;

    if (isProjected(t)) {
      const open = openAmount(t);
      if (t.type === 'payable') aPagar += open;
      else aReceber += open;
      if (t.due_date <= in30ISO) {
        if (t.type === 'payable') projPag += open;
        else projRec += open;
      }
      if (isOverdue(t, ref)) {
        vencidoValor += open;
        vencidoCount += 1;
      }
    }
  }

  return {
    saldoRealizado: initial + recebido - pago,
    aPagar,
    aReceber,
    projetado30: projRec - projPag,
    vencidoValor,
    vencidoCount,
  };
}

/** Status efetivo para exibição (vencido é derivado, não é um status armazenado). */
export function displayStatus(t: Pick<Transaction, 'status' | 'due_date'>): TransactionStatus | 'overdue' {
  if (isOverdue(t)) return 'overdue';
  return t.status;
}

export interface Installment {
  installment_number: number;
  installments_total: number;
  amount: number;
  due_date: string;
}

/** Gera N parcelas a partir de um valor total, 1ª data e intervalo em dias. */
export function buildInstallments(total: number, count: number, firstDue: string, intervalDays: number): Installment[] {
  const n = Math.max(1, Math.floor(count));
  const base = Math.floor((total / n) * 100) / 100;
  const parcelas: Installment[] = [];
  let acumulado = 0;
  const first = new Date(firstDue + 'T00:00:00');
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    const amount = isLast ? Math.round((total - acumulado) * 100) / 100 : base;
    acumulado += amount;
    const d = new Date(first);
    d.setDate(first.getDate() + i * intervalDays);
    parcelas.push({
      installment_number: i + 1,
      installments_total: n,
      amount,
      due_date: d.toISOString().slice(0, 10),
    });
  }
  return parcelas;
}
