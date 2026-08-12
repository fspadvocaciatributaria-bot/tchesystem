// Cálculo de orçamento (PRICING_RULES.md §10).

export interface QuoteLine {
  quantity: number;
  unitPrice: number;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  total: number;
}

/** Desconto pode ser informado como valor absoluto ou percentual do subtotal. */
export function resolveDiscount(
  subtotal: number,
  discount: { type: 'amount' | 'percent'; value: number },
): number {
  const raw =
    discount.type === 'percent'
      ? subtotal * Math.max(0, discount.value)
      : Math.max(0, discount.value);
  return Math.min(raw, subtotal); // desconto nunca excede o subtotal
}

export function computeQuoteTotals(
  lines: QuoteLine[],
  discount: { type: 'amount' | 'percent'; value: number },
): QuoteTotals {
  const subtotal = lines.reduce(
    (sum, l) => sum + Math.max(0, l.quantity) * Math.max(0, l.unitPrice),
    0,
  );
  const disc = resolveDiscount(subtotal, discount);
  return { subtotal, discount: disc, total: Math.max(0, subtotal - disc) };
}
