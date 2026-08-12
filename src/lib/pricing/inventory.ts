// Custo médio ponderado de material (PRICING_RULES.md §5, D-002).

/**
 * Novo custo médio após uma ENTRADA de estoque.
 * Espelha a lógica da RPC register_inventory_movement (fonte da verdade no banco);
 * mantida aqui como função pura para simulação e testes no frontend.
 */
export function weightedAvgCostAfterEntry(
  currentStock: number,
  currentAvgCost: number,
  entryQty: number,
  entryUnitCost: number,
): number {
  const newStock = currentStock + entryQty;
  if (newStock <= 0) return currentAvgCost;
  return (currentStock * currentAvgCost + entryQty * entryUnitCost) / newStock;
}

/** Custo do material consumido em um serviço, ao custo médio vigente. */
export function materialCost(qtyUsed: number, avgCost: number): number {
  return Math.max(0, qtyUsed) * Math.max(0, avgCost);
}
