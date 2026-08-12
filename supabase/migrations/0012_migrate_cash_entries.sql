-- =============================================================================
-- FSP — Unifica o fluxo de caixa: migra cash_entries → transactions (pagos)
-- Decisão do usuário (12/08/2026): histórico unificado no módulo financeiro.
-- Idempotente (não duplica em re-execução). Ver docs/decisoes.md ADR-008.
-- =============================================================================

-- Conta "Caixa Geral" para orgs com cash_entries e sem conta financeira.
insert into financial_accounts (organization_id, name, account_type, owner_type)
select distinct ce.organization_id, 'Caixa Geral', 'cash'::fin_account_type, 'company'::fin_account_owner
from cash_entries ce
where not exists (select 1 from financial_accounts fa where fa.organization_id = ce.organization_id);

-- Converte cada cash_entry em uma transação paga.
insert into transactions (
  organization_id, type, description, amount, due_date, issue_date, status,
  paid_amount, payment_date, financial_account_id, document_type, imported_from_xml, observation
)
select
  ce.organization_id,
  (case when ce.direction = 'in' then 'receivable' else 'payable' end)::transaction_type,
  coalesce(nullif(ce.description, ''), case when ce.direction = 'in' then 'Entrada (migrado)' else 'Saída (migrado)' end),
  ce.amount, ce.entry_date, ce.entry_date, 'paid'::transaction_status,
  ce.amount, ce.entry_date,
  (select fa.id from financial_accounts fa where fa.organization_id = ce.organization_id order by fa.created_at asc limit 1),
  'manual'::transaction_doc_type, false, 'Migrado do fluxo de caixa antigo'
from cash_entries ce
where not exists (
  select 1 from transactions t
  where t.organization_id = ce.organization_id
    and t.observation = 'Migrado do fluxo de caixa antigo'
    and t.amount = ce.amount and t.due_date = ce.entry_date
    and t.type = (case when ce.direction = 'in' then 'receivable' else 'payable' end)::transaction_type
);
