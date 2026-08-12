import { CrudManager } from '@/components/crud/CrudManager';
import type { Tables } from '@/lib/supabase/database.types';

type Supplier = Tables<'suppliers'>;

export function SuppliersPage() {
  return (
    <CrudManager<Supplier>
      table="suppliers"
      title="Fornecedores"
      subtitle="Fornecedores dos seus produtos e materiais."
      singular="fornecedor"
      orderBy="name"
      columns={[
        { header: 'Nome', render: (r) => <span className="text-strong">{r.name}</span> },
        { header: 'Telefone', render: (r) => r.phone ?? '—' },
        { header: 'E-mail', render: (r) => r.email ?? '—' },
      ]}
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'phone', label: 'Telefone', type: 'text', span: 1 },
        { name: 'email', label: 'E-mail', type: 'text', span: 1 },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true },
        { name: 'notes', label: 'Observações', type: 'textarea' },
      ]}
    />
  );
}
