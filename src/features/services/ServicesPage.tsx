import { CrudManager } from '@/components/crud/CrudManager';
import type { Tables } from '@/lib/supabase/database.types';

type Service = Tables<'services'>;

export function ServicesPage() {
  return (
    <CrudManager<Service>
      table="services"
      title="Serviços"
      subtitle="Serviços que você oferece. A formação de preço parte daqui."
      singular="serviço"
      orderBy="name"
      columns={[
        { header: 'Serviço', render: (r) => <span className="text-strong">{r.name}</span> },
        { header: 'Categoria', render: (r) => r.category ?? '—' },
        { header: 'Horas estimadas', render: (r) => `${r.estimated_hours}h` },
        {
          header: 'Status',
          render: (r) =>
            r.is_active ? (
              <span className="text-success">Ativo</span>
            ) : (
              <span className="text-muted">Inativo</span>
            ),
        },
      ]}
      fields={[
        { name: 'name', label: 'Nome do serviço', type: 'text', required: true },
        { name: 'category', label: 'Categoria', type: 'text', span: 1 },
        {
          name: 'estimated_hours',
          label: 'Horas estimadas',
          type: 'number',
          span: 1,
          help: 'Duração média de execução.',
        },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}
