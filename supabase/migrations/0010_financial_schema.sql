-- =============================================================================
-- FSP — Módulo Financeiro (Contas a Pagar/Receber + Fluxo de Caixa)
-- Multi-tenant (organization_id) + soft delete + índices. RLS em 0011.
-- =============================================================================
create type classification_type as enum ('expense', 'income');
create type fin_account_type    as enum ('checking','savings','cash','payment_card','investment','other');
create type fin_account_owner   as enum ('company','partner');
create type transaction_type    as enum ('payable','receivable');
create type transaction_doc_type as enum ('manual','nfe','nfce','boleto','receipt','card_batch','other');
create type transaction_status  as enum ('pending','partial','paid','cancelled');
create type payment_method      as enum ('cash','bank_transfer','pix','credit_card','debit_card','boleto','check','debit_note','other');

create table banks (
  id uuid primary key default gen_random_uuid(),
  bank_code text not null, name text not null, active boolean not null default true
);
alter table banks enable row level security;
create policy banks_read on banks for select using (true);
insert into banks (bank_code, name) values
  ('001','Banco do Brasil'),('237','Bradesco'),('341','Itaú'),('104','Caixa Econômica'),
  ('033','Santander'),('260','Nubank'),('077','Inter'),('336','C6 Bank'),('745','Citibank'),
  ('041','Banrisul'),('004','Banco do Nordeste'),('021','Banestes'),('212','Banco Original'),
  ('389','Mercantil do Brasil'),('102','XP Investimentos'),('748','Sicredi'),('756','Sicoob'),('070','BRB');

create table classification_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text, name text not null, description text,
  type classification_type not null,
  parent_id uuid references classification_categories(id) on delete restrict,
  is_system boolean not null default false, active boolean not null default true, color text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index idx_classif_org on classification_categories(organization_id);
create index idx_classif_parent on classification_categories(parent_id);
create trigger trg_classif_upd before update on classification_categories for each row execute function set_updated_at();

create table financial_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  bank_id uuid references banks(id),
  name text not null, agency text, account_number text, digit text,
  account_type fin_account_type not null default 'cash',
  initial_balance numeric(14,4) not null default 0,
  owner_type fin_account_owner not null default 'company', active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index idx_finacc_org on financial_accounts(organization_id);
create trigger trg_finacc_upd before update on financial_accounts for each row execute function set_updated_at();

-- Enriquecer fornecedores (reusar + enriquecer clientes/fornecedores existentes)
alter table suppliers add column if not exists doc_number text;
alter table suppliers add column if not exists address text;

create table transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type transaction_type not null, description text not null, document_number text,
  document_type transaction_doc_type not null default 'manual',
  amount numeric(14,4) not null, due_date date not null, issue_date date,
  status transaction_status not null default 'pending',
  supplier_id uuid references suppliers(id) on delete restrict,
  customer_id uuid references customers(id) on delete restrict,
  classification_category_id uuid references classification_categories(id) on delete restrict,
  financial_account_id uuid references financial_accounts(id) on delete restrict,
  paid_amount numeric(14,4) not null default 0, payment_date date,
  discount numeric(14,4) not null default 0, surcharge_interest numeric(14,4) not null default 0,
  late_fee numeric(14,4) not null default 0, observation text,
  imported_from_xml boolean not null default false, xml_chave text,
  installment_number int, installments_total int,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  constraint amount_pos check (amount >= 0), constraint paid_nonneg check (paid_amount >= 0)
);
create index idx_tx_org on transactions(organization_id);
create index idx_tx_due on transactions(due_date);
create index idx_tx_status on transactions(status);
create index idx_tx_type on transactions(type);
create index idx_tx_supplier on transactions(supplier_id);
create index idx_tx_customer on transactions(customer_id);
create index idx_tx_classif on transactions(classification_category_id);
create index idx_tx_finacc on transactions(financial_account_id);
create index idx_tx_chave on transactions(organization_id, xml_chave);
create trigger trg_tx_upd before update on transactions for each row execute function set_updated_at();

create table transaction_payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  paid_amount numeric(14,4) not null, payment_date date not null default current_date,
  payment_method payment_method not null default 'pix',
  financial_account_id uuid references financial_accounts(id) on delete restrict,
  receipt_reference text, observation text, created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint pay_pos check (paid_amount > 0)
);
create index idx_txpay_org on transaction_payments(organization_id);
create index idx_txpay_tx on transaction_payments(transaction_id);
