// Tipos locais do módulo financeiro (tabelas ainda não estão nos tipos gerados).
export type ClassificationType = 'expense' | 'income';
export type FinAccountType = 'checking' | 'savings' | 'cash' | 'payment_card' | 'investment' | 'other';
export type TransactionType = 'payable' | 'receivable';
export type TransactionDocType = 'manual' | 'nfe' | 'nfce' | 'boleto' | 'receipt' | 'card_batch' | 'other';
export type TransactionStatus = 'pending' | 'partial' | 'paid' | 'cancelled';
export type PaymentMethod =
  | 'cash' | 'bank_transfer' | 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'check' | 'debit_note' | 'other';

export interface ClassificationCategory {
  id: string;
  organization_id: string;
  code: string | null;
  name: string;
  description: string | null;
  type: ClassificationType;
  parent_id: string | null;
  is_system: boolean;
  active: boolean;
  color: string | null;
}

export interface FinancialAccount {
  id: string;
  organization_id: string;
  bank_id: string | null;
  name: string;
  agency: string | null;
  account_number: string | null;
  digit: string | null;
  account_type: FinAccountType;
  initial_balance: number;
  owner_type: 'company' | 'partner';
  active: boolean;
}

export interface Transaction {
  id: string;
  organization_id: string;
  type: TransactionType;
  description: string;
  document_number: string | null;
  document_type: TransactionDocType;
  amount: number;
  due_date: string;
  issue_date: string | null;
  status: TransactionStatus;
  supplier_id: string | null;
  customer_id: string | null;
  classification_category_id: string | null;
  financial_account_id: string | null;
  paid_amount: number;
  payment_date: string | null;
  discount: number;
  surcharge_interest: number;
  late_fee: number;
  observation: string | null;
  imported_from_xml: boolean;
  xml_chave: string | null;
  installment_number: number | null;
  installments_total: number | null;
  created_at: string;
  // joins opcionais
  suppliers?: { name: string } | null;
  customers?: { name: string } | null;
  classification_categories?: { name: string; type: ClassificationType } | null;
  financial_accounts?: { name: string } | null;
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Dinheiro', bank_transfer: 'Transferência', pix: 'PIX', credit_card: 'Cartão crédito',
  debit_card: 'Cartão débito', boleto: 'Boleto', check: 'Cheque', debit_note: 'Nota de débito', other: 'Outro',
};

export const STATUS_LABEL: Record<TransactionStatus, string> = {
  pending: 'Pendente', partial: 'Parcial', paid: 'Pago', cancelled: 'Cancelado',
};

export const ACCOUNT_TYPE_LABEL: Record<FinAccountType, string> = {
  checking: 'Conta corrente', savings: 'Poupança', cash: 'Caixa', payment_card: 'Cartão',
  investment: 'Investimento', other: 'Outro',
};
