// Formatação monetária e numérica pt-BR / BRL (D-007).
// Dinheiro é manipulado como number em reais; arredonda apenas na apresentação.

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formata um valor em Reais: 1250 -> "R$ 1.250,00". Trata null/NaN como 0. */
export function formatBRL(value: number | null | undefined): string {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return brl.format(n);
}

/** Formata uma fração como percentual: 0.3 -> "30%". */
export function formatPercent(fraction: number | null | undefined): string {
  const n = typeof fraction === 'number' && Number.isFinite(fraction) ? fraction : 0;
  return pct.format(n);
}

/** Arredonda para 2 casas (uso em apresentação/persistência final, nunca no meio do cálculo). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Converte string pt-BR ("1.250,50") em number. Retorna 0 para entradas inválidas. */
export function parseBRLNumber(input: string): number {
  if (!input) return 0;
  const normalized = input.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
