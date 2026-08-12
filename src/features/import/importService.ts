import { supabase } from '@/lib/supabase/client';
import type { NfeParsed } from '@/lib/nfe/parseNfe';
import type { Enums } from '@/lib/supabase/database.types';

type Unit = Enums<'unit_measure'>;

/** Mapeia a unidade comercial da nota para o enum de unidade do sistema. */
function mapUnit(u: string): Unit {
  const x = u.trim().toUpperCase();
  const map: Record<string, Unit> = {
    UN: 'unit', UND: 'unit', PC: 'pack', PCT: 'pack', PECA: 'unit',
    ML: 'ml', L: 'liter', LT: 'liter', KG: 'kg', G: 'gram', GR: 'gram',
    M: 'meter', MT: 'meter', CX: 'box', H: 'hour', HR: 'hour',
  };
  return map[x] ?? 'other';
}

export interface ImportResult {
  chave: string | null;
  status: 'importada' | 'duplicada' | 'erro';
  supplierName?: string;
  itemsImported?: number;
  message?: string;
}

/** true se a nota (chave) já foi importada nesta organização. */
export async function isDuplicate(orgId: string, chave: string | null): Promise<boolean> {
  if (!chave) return false;
  // imported_invoices ainda não está nos tipos gerados — cast controlado.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('imported_invoices' as any) as any)
    .select('id')
    .eq('organization_id', orgId)
    .eq('chave', chave)
    .maybeSingle();
  return !!data;
}

async function findOrCreateSupplier(orgId: string, nfe: NfeParsed): Promise<string> {
  const name = nfe.emitente.nome;
  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .eq('organization_id', orgId)
    .ilike('name', name)
    .maybeSingle();
  if (existing) return existing.id;

  const notes = [nfe.emitente.cnpj && `CNPJ: ${nfe.emitente.cnpj}`, nfe.emitente.ie && `IE: ${nfe.emitente.ie}`, nfe.emitente.endereco]
    .filter(Boolean)
    .join(' · ');
  const { data, error } = await supabase
    .from('suppliers')
    .insert({ organization_id: orgId, name, phone: nfe.emitente.telefone, notes: notes || null, is_active: true })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function findOrCreateProduct(
  orgId: string,
  supplierId: string,
  item: NfeParsed['itens'][number],
): Promise<string> {
  // Tenta por SKU (código do produto na nota); depois por nome.
  if (item.codigo) {
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('organization_id', orgId)
      .eq('sku', item.codigo)
      .maybeSingle();
    if (data) return data.id;
  }
  const { data: byName } = await supabase
    .from('products')
    .select('id')
    .eq('organization_id', orgId)
    .ilike('name', item.descricao)
    .maybeSingle();
  if (byName) return byName.id;

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: orgId,
      name: item.descricao,
      sku: item.codigo || item.ean || null,
      unit: mapUnit(item.unidade),
      supplier_id: supplierId,
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

/**
 * Aplica uma nota: cria/atualiza fornecedor e produtos, gera entradas de estoque
 * (via RPC, que recalcula o custo médio) e registra a nota para controle de duplicidade.
 */
export async function applyNota(orgId: string, nfe: NfeParsed): Promise<ImportResult> {
  try {
    if (await isDuplicate(orgId, nfe.chave)) {
      return { chave: nfe.chave, status: 'duplicada' };
    }
    const supplierId = await findOrCreateSupplier(orgId, nfe);
    let imported = 0;
    for (const item of nfe.itens) {
      if (item.quantidade <= 0) continue;
      const productId = await findOrCreateProduct(orgId, supplierId, item);
      const { error } = await supabase.rpc('register_inventory_movement', {
        p_org: orgId,
        p_product: productId,
        p_type: 'in',
        p_qty: item.quantidade,
        p_unit_cost: item.valorUnitario,
        p_supplier: supplierId,
        p_document: nfe.numero ? `NF ${nfe.numero}` : 'Importação XML',
      });
      if (error) throw error;
      imported++;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('imported_invoices' as any) as any).insert({
      organization_id: orgId,
      chave: nfe.chave ?? `sem-chave-${Date.now()}`,
      model: nfe.model,
      numero: nfe.numero,
      serie: nfe.serie,
      emit_cnpj: nfe.emitente.cnpj,
      emit_nome: nfe.emitente.nome,
      total: nfe.totalNota,
      issued_at: nfe.dataEmissao,
      supplier_id: supplierId,
      items_count: imported,
    });

    return { chave: nfe.chave, status: 'importada', supplierName: nfe.emitente.nome, itemsImported: imported };
  } catch (e) {
    return { chave: nfe.chave, status: 'erro', message: e instanceof Error ? e.message : 'Erro' };
  }
}
