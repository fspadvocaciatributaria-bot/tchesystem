import { supabase } from '@/lib/supabase/client';

/**
 * Popula a organização atual com dados demonstrativos (Studio Black — tatuagem).
 * Usa as mesmas rotas de escrita do app (incl. RPC de estoque), respeitando RLS.
 * Retorna um resumo do que foi criado.
 */
export async function seedStudioBlack(orgId: string): Promise<string> {
  const created: string[] = [];

  // Profissionais
  const { data: profs, error: pErr } = await supabase
    .from('professionals')
    .insert([
      { organization_id: orgId, name: 'João', specialty: 'Blackwork', is_active: true },
      { organization_id: orgId, name: 'Maria', specialty: 'Fineline', is_active: true },
      { organization_id: orgId, name: 'Carlos', specialty: 'Recepção/Administrativo', is_active: true },
    ])
    .select('id, name');
  if (pErr) throw pErr;
  created.push(`${profs.length} profissionais`);

  // Tipo de mão de obra
  await supabase.from('labor_types').insert({ organization_id: orgId, name: 'Tatuagem', is_active: true });

  // Fornecedor
  const { data: sup } = await supabase
    .from('suppliers')
    .insert({ organization_id: orgId, name: 'Distribuidora Tattoo Supply', is_active: true })
    .select('id')
    .single();

  // Produtos
  const productsSeed = [
    { name: 'Agulhas RL', unit: 'unit' as const, stock_min: 20 },
    { name: 'Tinta Preta', unit: 'ml' as const, stock_min: 50 },
    { name: 'Luvas', unit: 'unit' as const, stock_min: 30 },
    { name: 'Filme PVC', unit: 'meter' as const, stock_min: 10 },
    { name: 'Pomada cicatrizante', unit: 'unit' as const, stock_min: 5 },
  ];
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .insert(productsSeed.map((p) => ({ organization_id: orgId, supplier_id: sup?.id ?? null, ...p })))
    .select('id, name');
  if (prodErr) throw prodErr;
  created.push(`${products.length} produtos`);

  // Entradas de estoque (via RPC — recalcula custo médio)
  const stockEntries: Record<string, { qty: number; cost: number }> = {
    'Agulhas RL': { qty: 100, cost: 1.5 },
    'Tinta Preta': { qty: 500, cost: 0.8 },
    'Luvas': { qty: 200, cost: 0.6 },
    'Filme PVC': { qty: 50, cost: 2.0 },
    'Pomada cicatrizante': { qty: 30, cost: 12.0 },
  };
  for (const p of products) {
    const s = stockEntries[p.name];
    if (!s) continue;
    await supabase.rpc('register_inventory_movement', {
      p_org: orgId,
      p_product: p.id,
      p_type: 'in',
      p_qty: s.qty,
      p_unit_cost: s.cost,
      p_supplier: sup?.id ?? undefined,
      p_document: 'Compra inicial (demo)',
    });
  }
  created.push('entradas de estoque');

  // Custos fixos
  await supabase.from('fixed_costs').insert([
    { organization_id: orgId, description: 'Aluguel', category: 'Instalações', amount: 2500, periodicity: 'monthly', is_active: true },
    { organization_id: orgId, description: 'Energia', category: 'Utilidades', amount: 400, periodicity: 'monthly', is_active: true },
    { organization_id: orgId, description: 'Internet', category: 'Utilidades', amount: 150, periodicity: 'monthly', is_active: true },
    { organization_id: orgId, description: 'Contador', category: 'Serviços', amount: 600, periodicity: 'monthly', is_active: true },
  ]);
  created.push('custos fixos');

  // Custos variáveis
  await supabase.from('variable_costs').insert([
    { organization_id: orgId, description: 'Taxa de máquina de cartão', category: 'Taxas', amount: 3.5, is_active: true },
  ]);

  // Serviços
  const { data: services } = await supabase
    .from('services')
    .insert([
      { organization_id: orgId, name: 'Tattoo pequena', category: 'Tatuagem', estimated_hours: 1, is_active: true },
      { organization_id: orgId, name: 'Tattoo média', category: 'Tatuagem', estimated_hours: 3, is_active: true },
      { organization_id: orgId, name: 'Tattoo grande (Blackwork)', category: 'Tatuagem', estimated_hours: 5, is_active: true },
    ])
    .select('id, name');
  created.push(`${services?.length ?? 0} serviços`);

  // Clientes
  await supabase.from('customers').insert([
    { organization_id: orgId, name: 'João da Silva', phone: '(11) 99999-0001' },
    { organization_id: orgId, name: 'Ana Souza', phone: '(11) 99999-0002' },
  ]);
  created.push('clientes');

  // Meta
  await supabase.from('goals').insert({ organization_id: orgId, professional_id: null, desired_profit_month: 15000 });

  // Fluxo de caixa (exemplos do mês atual)
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from('cash_entries').insert([
    { organization_id: orgId, direction: 'in', category: 'Serviços', description: 'Tattoo média — Ana', amount: 800, entry_date: today },
    { organization_id: orgId, direction: 'in', category: 'Serviços', description: 'Tattoo pequena — João', amount: 300, entry_date: today },
    { organization_id: orgId, direction: 'out', category: 'Materiais', description: 'Reposição de tintas', amount: 250, entry_date: today },
  ]);
  created.push('lançamentos de caixa');

  return created.join(', ');
}
