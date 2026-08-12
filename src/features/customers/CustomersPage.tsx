import { CrudManager } from '@/components/crud/CrudManager';
import type { Tables } from '@/lib/supabase/database.types';

type Customer = Tables<'customers'>;

export function CustomersPage() {
  return (
    <CrudManager<Customer>
      table="customers"
      title="Clientes"
      subtitle="Cadastro de clientes para orçamentos."
      singular="cliente"
      orderBy="name"
      columns={[
        { header: 'Nome', render: (r) => <span className="text-white">{r.name}</span> },
        { header: 'Telefone', render: (r) => r.phone ?? '—' },
        { header: 'E-mail', render: (r) => r.email ?? '—' },
        { header: 'Documento', render: (r) => r.doc_number ?? '—' },
      ]}
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'doc_number', label: 'CPF/CNPJ', type: 'text', span: 1 },
        { name: 'phone', label: 'Telefone', type: 'text', span: 1 },
        { name: 'email', label: 'E-mail', type: 'text', span: 1 },
        { name: 'address', label: 'Endereço', type: 'text' },
        { name: 'notes', label: 'Observações', type: 'textarea' },
      ]}
    />
  );
}
