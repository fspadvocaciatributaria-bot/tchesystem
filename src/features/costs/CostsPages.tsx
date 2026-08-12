import { CrudManager } from '@/components/crud/CrudManager';
import { formatBRL } from '@/lib/money/format';
import { toMonthly, type Periodicity } from '@/lib/pricing';
import type { Tables } from '@/lib/supabase/database.types';

type FixedCost = Tables<'fixed_costs'>;
type VariableCost = Tables<'variable_costs'>;

const PERIODICITY_LABEL: Record<Periodicity, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
  daily: 'Diário',
  custom: 'Personalizado',
};

export function FixedCostsPage() {
  return (
    <CrudManager<FixedCost>
      table="fixed_costs"
      title="Custos fixos"
      subtitle="Aluguel, energia, salários… convertidos para base mensal no rateio."
      singular="custo fixo"
      columns={[
        { header: 'Descrição', render: (r) => <span className="text-strong">{r.description}</span> },
        { header: 'Categoria', render: (r) => r.category ?? '—' },
        { header: 'Valor', render: (r) => formatBRL(r.amount) },
        { header: 'Periodicidade', render: (r) => PERIODICITY_LABEL[r.periodicity as Periodicity] },
        {
          header: 'Equivalente mensal',
          render: (r) => (
            <span className="text-gold">
              {formatBRL(
                toMonthly({
                  amount: r.amount,
                  periodicity: r.periodicity as Periodicity,
                  customFactor: r.custom_factor,
                  isActive: r.is_active,
                }),
              )}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'description', label: 'Descrição', type: 'text', required: true },
        { name: 'category', label: 'Categoria', type: 'text', span: 1 },
        { name: 'amount', label: 'Valor (R$)', type: 'currency', required: true, span: 1 },
        {
          name: 'periodicity',
          label: 'Periodicidade',
          type: 'select',
          span: 1,
          defaultValue: 'monthly',
          options: (Object.keys(PERIODICITY_LABEL) as Periodicity[]).map((p) => ({
            value: p,
            label: PERIODICITY_LABEL[p],
          })),
        },
        {
          name: 'custom_factor',
          label: 'Fator (se personalizado)',
          type: 'number',
          span: 1,
          help: 'Multiplicador para converter em base mensal.',
        },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true },
        { name: 'notes', label: 'Observações', type: 'textarea' },
      ]}
    />
  );
}

export function VariableCostsPage() {
  return (
    <CrudManager<VariableCost>
      table="variable_costs"
      title="Custos variáveis"
      subtitle="Custos que variam por serviço (materiais, deslocamento, taxas)."
      singular="custo variável"
      columns={[
        { header: 'Descrição', render: (r) => <span className="text-strong">{r.description}</span> },
        { header: 'Categoria', render: (r) => r.category ?? '—' },
        { header: 'Valor', render: (r) => formatBRL(r.amount) },
        {
          header: 'Status',
          render: (r) => (r.is_active ? <span className="text-success">Ativo</span> : <span className="text-muted">Inativo</span>),
        },
      ]}
      fields={[
        { name: 'description', label: 'Descrição', type: 'text', required: true },
        { name: 'category', label: 'Categoria', type: 'text', span: 1 },
        { name: 'amount', label: 'Valor (R$)', type: 'currency', required: true, span: 1 },
        { name: 'is_active', label: 'Ativo', type: 'checkbox', defaultValue: true },
        { name: 'notes', label: 'Observações', type: 'textarea' },
      ]}
    />
  );
}
