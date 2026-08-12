import { CrudManager } from '@/components/crud/CrudManager';
import { useOrgOptions } from '@/hooks/useOptions';
import { formatBRL } from '@/lib/money/format';
import type { Tables, Enums } from '@/lib/supabase/database.types';

type Product = Tables<'products'>;

const UNIT_LABEL: Record<Enums<'unit_measure'>, string> = {
  unit: 'Unidade',
  ml: 'ml',
  liter: 'Litro',
  kg: 'kg',
  gram: 'Grama',
  meter: 'Metro',
  box: 'Caixa',
  pack: 'Pacote',
  hour: 'Hora',
  other: 'Outro',
};

export function ProductsPage() {
  const suppliers = useOrgOptions('suppliers');
  const categories = useOrgOptions('product_categories');

  return (
    <CrudManager<Product>
      table="products"
      title="Produtos / Materiais"
      subtitle="Catálogo de materiais. O estoque e o custo médio são atualizados pelo módulo Estoque."
      singular="produto"
      orderBy="name"
      columns={[
        { header: 'Produto', render: (r) => <span className="text-white">{r.name}</span> },
        { header: 'Unidade', render: (r) => UNIT_LABEL[r.unit] },
        { header: 'Estoque', render: (r) => `${r.stock_current}` },
        {
          header: 'Custo médio',
          render: (r) => <span className="text-gold">{formatBRL(r.avg_cost)}</span>,
        },
        {
          header: 'Mínimo',
          render: (r) =>
            r.stock_current < r.stock_min ? (
              <span className="text-critical">{r.stock_min} ⚠</span>
            ) : (
              r.stock_min
            ),
        },
      ]}
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'sku', label: 'SKU / código', type: 'text', span: 1 },
        {
          name: 'unit',
          label: 'Unidade de medida',
          type: 'select',
          span: 1,
          defaultValue: 'unit',
          options: (Object.keys(UNIT_LABEL) as Enums<'unit_measure'>[]).map((u) => ({
            value: u,
            label: UNIT_LABEL[u],
          })),
        },
        { name: 'category_id', label: 'Categoria', type: 'select', span: 1, options: categories },
        { name: 'supplier_id', label: 'Fornecedor', type: 'select', span: 1, options: suppliers },
        {
          name: 'reference_price',
          label: 'Preço de referência (R$)',
          type: 'currency',
          span: 1,
        },
        { name: 'stock_min', label: 'Estoque mínimo', type: 'number', span: 1, defaultValue: 0 },
        { name: 'stock_max', label: 'Estoque máximo', type: 'number', span: 1 },
        {
          name: 'is_active',
          label: 'Ativo',
          type: 'checkbox',
          defaultValue: true,
          help: 'Estoque e custo médio são geridos pelo módulo Estoque (entradas/saídas).',
        },
      ]}
    />
  );
}
