import { supabase } from '@/lib/supabase/client';
import type { NfeParsed } from '@/lib/nfe/parseNfe';
import type { TransactionType } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

const digits = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '');

/**
 * Detecta o sentido do título pelo CNPJ da empresa:
 * emitente == empresa → venda → a receber; destinatário == empresa → compra → a pagar.
 */
export function detectDirection(nfe: NfeParsed, companyCnpj: string | null): TransactionType | 'unknown' {
  const c = digits(companyCnpj);
  if (c) {
    if (digits(nfe.emitente.cnpj) === c) return 'receivable';
    if (digits(nfe.destinatario.cnpj) === c) return 'payable';
  }
  // Heurística: NFC-e (modelo 65) é quase sempre venda no varejo → a receber.
  if (nfe.model === 'NFC-e') return 'receivable';
  return 'unknown';
}

/** true se a nota (chave) já virou título nesta organização. */
export async function isImportedAsTransaction(orgId: string, chave: string | null): Promise<boolean> {
  if (!chave) return false;
  const { data } = await sb
    .from('transactions')
    .select('id')
    .eq('organization_id', orgId)
    .eq('xml_chave', chave)
    .is('deleted_at', null)
    .maybeSingle();
  return !!data;
}

/** Encontra/cria a pessoa (fornecedor p/ pagar, cliente p/ receber) a partir do XML. */
export async function findOrCreatePerson(
  orgId: string,
  nfe: NfeParsed,
  direction: TransactionType,
): Promise<{ table: 'suppliers' | 'customers'; id: string } | null> {
  const party = direction === 'payable' ? nfe.emitente : { nome: nfe.destinatario.nome, cnpj: nfe.destinatario.cnpj };
  const name = party.nome;
  if (!name) return null;
  const table = direction === 'payable' ? 'suppliers' : 'customers';

  const { data: existing } = await sb
    .from(table)
    .select('id')
    .eq('organization_id', orgId)
    .ilike('name', name)
    .maybeSingle();
  if (existing) return { table, id: existing.id };

  const row: Record<string, unknown> = { organization_id: orgId, name, doc_number: party.cnpj ?? null };
  if (direction === 'payable') {
    row.address = nfe.emitente.endereco ?? null;
    row.phone = nfe.emitente.telefone ?? null;
    row.is_active = true;
  }
  const { data, error } = await sb.from(table).insert(row).select('id').single();
  if (error) throw error;
  return { table, id: data.id };
}

export interface FinancialDraft {
  chave: string | null;
  direction: TransactionType | 'unknown';
  description: string;
  amount: number;
  emitente: string;
  numero: string | null;
  model: string;
  issue_date: string | null;
  duplicate: boolean;
}

/** Monta o rascunho de título a partir do XML (para a tela de conferência). */
export async function buildDraft(orgId: string, nfe: NfeParsed, companyCnpj: string | null): Promise<FinancialDraft> {
  const direction = detectDirection(nfe, companyCnpj);
  const duplicate = await isImportedAsTransaction(orgId, nfe.chave);
  const partyName = direction === 'payable' ? nfe.emitente.nome : nfe.destinatario.nome || nfe.emitente.nome;
  return {
    chave: nfe.chave,
    direction,
    description: `${partyName} — NF ${nfe.numero ?? ''}`.trim(),
    amount: nfe.totalNota,
    emitente: nfe.emitente.nome,
    numero: nfe.numero,
    model: nfe.model,
    issue_date: nfe.dataEmissao ? nfe.dataEmissao.slice(0, 10) : null,
    duplicate,
  };
}

export interface ConfirmArgs {
  orgId: string;
  nfe: NfeParsed;
  direction: TransactionType;
  description: string;
  amount: number;
  due_date: string;
  classification_category_id: string | null;
  financial_account_id: string | null;
}

/** Grava o título a partir do XML conferido. */
export async function confirmImport(a: ConfirmArgs): Promise<void> {
  const person = await findOrCreatePerson(a.orgId, a.nfe, a.direction);
  const row: Record<string, unknown> = {
    organization_id: a.orgId,
    type: a.direction,
    description: a.description,
    document_number: a.nfe.numero,
    document_type: a.nfe.model === 'NFC-e' ? 'nfce' : 'nfe',
    amount: a.amount,
    due_date: a.due_date,
    issue_date: a.nfe.dataEmissao ? a.nfe.dataEmissao.slice(0, 10) : null,
    status: 'pending',
    classification_category_id: a.classification_category_id,
    financial_account_id: a.financial_account_id,
    imported_from_xml: true,
    xml_chave: a.nfe.chave,
    supplier_id: person?.table === 'suppliers' ? person.id : null,
    customer_id: person?.table === 'customers' ? person.id : null,
  };
  const { error } = await sb.from('transactions').insert(row);
  if (error) throw error;
}
