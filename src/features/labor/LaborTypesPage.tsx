import { CrudManager } from '@/components/crud/CrudManager';
import type { Tables } from '@/lib/supabase/database.types';

type LaborType = Tables<'labor_types'>;

/**
 * Tipos de mão de obra (ex.: tatuagem, retoque, edição). A remuneração por
 * profissional × tipo (labor_rates) é configurada na formação de preço/FASE 3.
 */
export function LaborTypesPage() {
  return (
    <CrudManager<LaborType>
      table="labor_types"
      title="Mão de obra"
      subtitle="Tipos de trabalho que seus profissionais executam."
      singular="tipo de mão de obra"
      orderBy="name"
      columns={[
        { header: 'Tipo', render: (r) => <span className="text-strong">{r.name}</span> },
        { header: 'Descrição', render: (r) => r.description ?? '—' },
        {
          header: 'Status',
          render: (r) => (r.is_active ? <span className="text-success">Ativo</span> : <span className="text-muted">Inativo</span>),
        },
      ]}
      fields={[
        { name: 'name', label: 'Nome do tipo', type: 'text', required: true, placeholder: 'Ex.: Tatuagem' },
        { name: 'description', label: 'Descrição', type: 'textarea' },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}
