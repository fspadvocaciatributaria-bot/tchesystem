import { CrudManager } from '@/components/crud/CrudManager';
import { useProfessionOptions } from '@/hooks/useOptions';
import type { Tables } from '@/lib/supabase/database.types';

type Professional = Tables<'professionals'>;

export function ProfessionalsPage() {
  const professions = useProfessionOptions();
  return (
    <CrudManager<Professional>
      table="professionals"
      title="Profissionais"
      subtitle="Quem executa os serviços. A mão de obra é vinculada a cada profissional."
      singular="profissional"
      orderBy="name"
      columns={[
        { header: 'Nome', render: (r) => <span className="text-white">{r.name}</span> },
        { header: 'Especialidade', render: (r) => r.specialty ?? '—' },
        { header: 'Telefone', render: (r) => r.phone ?? '—' },
        {
          header: 'Status',
          render: (r) => (r.is_active ? <span className="text-success">Ativo</span> : <span className="text-muted">Inativo</span>),
        },
      ]}
      fields={[
        { name: 'name', label: 'Nome', type: 'text', required: true },
        { name: 'profession_id', label: 'Profissão', type: 'select', span: 1, options: professions },
        { name: 'specialty', label: 'Especialidade', type: 'text', span: 1 },
        { name: 'doc_number', label: 'CPF/Documento', type: 'text', span: 1 },
        { name: 'internal_code', label: 'Código interno', type: 'text', span: 1 },
        { name: 'phone', label: 'Telefone', type: 'text', span: 1 },
        { name: 'email', label: 'E-mail', type: 'text', span: 1 },
        { name: 'bond_type', label: 'Tipo de vínculo', type: 'text', span: 1 },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true, span: 1 },
        { name: 'notes', label: 'Observações', type: 'textarea' },
      ]}
    />
  );
}
