import { supabase } from '@/lib/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

/** Cria as classificações padrão (despesas e receitas) na organização. */
export async function seedDefaultCategories(orgId: string) {
  const groups: { code: string; name: string; type: 'expense' | 'income'; subs: string[] }[] = [
    { code: 'DESP.01', name: 'Pessoal', type: 'expense', subs: ['Salários', 'Pró-labore', 'Encargos'] },
    { code: 'DESP.02', name: 'Operacional', type: 'expense', subs: ['Aluguel', 'Energia', 'Internet', 'Materiais', 'Fretes'] },
    { code: 'DESP.03', name: 'Financeiro/Tributos', type: 'expense', subs: ['Impostos', 'Taxas bancárias', 'Juros'] },
    { code: 'DESP.04', name: 'Fornecedor/Mercadorias', type: 'expense', subs: ['Compra de materiais'] },
    { code: 'REC.01', name: 'Vendas', type: 'income', subs: ['Venda de produtos', 'Serviços'] },
    { code: 'REC.02', name: 'Financeiras', type: 'income', subs: ['Juros recebidos', 'Rendimentos'] },
    { code: 'REC.03', name: 'Outras receitas', type: 'income', subs: ['Devoluções', 'Ressarcimentos'] },
  ];

  for (const g of groups) {
    const { data: parent, error } = await sb
      .from('classification_categories')
      .insert({ organization_id: orgId, code: g.code, name: g.name, type: g.type, is_system: true })
      .select('id')
      .single();
    if (error) throw error;
    if (g.subs.length) {
      const rows = g.subs.map((s, i) => ({
        organization_id: orgId,
        code: `${g.code}.${String(i + 1).padStart(2, '0')}`,
        name: s,
        type: g.type,
        parent_id: parent.id,
      }));
      await sb.from('classification_categories').insert(rows);
    }
  }
}
