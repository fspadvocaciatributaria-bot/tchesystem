import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import { useResourceList } from '@/hooks/useResource';
import { useOrgOptions } from '@/hooks/useOptions';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { useMovements, useRegisterMovement } from './useInventory';
import type { Tables, Enums } from '@/lib/supabase/database.types';

type Product = Tables<'products'>;
type MovementType = Enums<'movement_type'>;

const TYPE_LABEL: Record<MovementType, string> = {
  in: 'Entrada',
  out: 'Saída',
  adjustment: 'Ajuste',
};

export function InventoryPage() {
  const { canWrite } = useOrg();
  const { data: products } = useResourceList<Product>('products', { orderBy: 'name' });
  const suppliers = useOrgOptions('suppliers');
  const { data: movements, isLoading } = useMovements();
  const register = useRegisterMovement();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MovementType>('in');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [reason, setReason] = useState('');
  const [documentNo, setDocumentNo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const lowStock = (products ?? []).filter((p) => p.stock_current < p.stock_min);

  function reset() {
    setType('in');
    setProductId('');
    setQuantity('');
    setUnitCost('');
    setSupplierId('');
    setReason('');
    setDocumentNo('');
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register.mutateAsync({
        productId,
        type,
        quantity: Number(quantity),
        unitCost: type === 'in' ? Number(unitCost) : undefined,
        supplierId: type === 'in' ? supplierId || undefined : undefined,
        reason: type === 'adjustment' ? reason : reason || undefined,
        document: documentNo || undefined,
      });
      setOpen(false);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Estoque</h1>
          <p className="text-sm text-muted mt-1">Entradas, saídas e ajustes. O custo médio é recalculado nas entradas.</p>
        </div>
        {canWrite && (
          <button className="btn-primary shrink-0" onClick={() => { reset(); setOpen(true); }}>
            + Movimentação
          </button>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="card border-critical/40 mb-4">
          <p className="text-sm text-critical font-medium">⚠ {lowStock.length} produto(s) abaixo do estoque mínimo</p>
          <p className="text-xs text-muted mt-1">{lowStock.map((p) => p.name).join(', ')}</p>
        </div>
      )}

      {/* Visão de saldo por produto */}
      <div className="card overflow-x-auto p-0 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-ink-border">
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Estoque atual</th>
              <th className="px-4 py-3 font-medium">Mínimo</th>
              <th className="px-4 py-3 font-medium">Custo médio</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-ink-border/50 last:border-0">
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className={`px-4 py-3 ${p.stock_current < p.stock_min ? 'text-critical' : 'text-muted-soft'}`}>
                  {p.stock_current}
                </td>
                <td className="px-4 py-3 text-muted-soft">{p.stock_min}</td>
                <td className="px-4 py-3 text-gold">{formatBRL(p.avg_cost)}</td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Cadastre produtos primeiro (menu Produtos).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Histórico de movimentações */}
      <h2 className="text-sm font-semibold text-white mb-2">Histórico de movimentações</h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-ink-border">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Qtd</th>
              <th className="px-4 py-3 font-medium">Custo unit.</th>
              <th className="px-4 py-3 font-medium">Obs.</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Carregando…</td></tr>
            ) : (movements ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Nenhuma movimentação.</td></tr>
            ) : (
              (movements ?? []).map((m) => (
                <tr key={m.id} className="border-b border-ink-border/50 last:border-0">
                  <td className="px-4 py-3 text-muted">{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-white">{m.products?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={m.type === 'in' ? 'text-success' : m.type === 'out' ? 'text-critical' : 'text-warning'}>
                      {TYPE_LABEL[m.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-soft">{m.quantity}</td>
                  <td className="px-4 py-3 text-muted-soft">{m.unit_cost != null ? formatBRL(m.unit_cost) : '—'}</td>
                  <td className="px-4 py-3 text-muted">{m.reason ?? m.document_number ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova movimentação">
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Tipo</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as MovementType)}>
              <option value="in">Entrada (compra)</option>
              <option value="out">Saída (consumo)</option>
              <option value="adjustment">Ajuste (define o saldo)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Produto</label>
            <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">Selecione…</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name} (saldo: {p.stock_current})</option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="label">{type === 'adjustment' ? 'Novo saldo' : 'Quantidade'}</label>
            <input className="input" type="number" step="0.0001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          {type === 'in' && (
            <>
              <div className="col-span-1">
                <label className="label">Custo unitário (R$)</label>
                <input className="input" type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className="label">Fornecedor</label>
                <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {type === 'adjustment' && (
            <div className="col-span-2">
              <label className="label">Justificativa (obrigatória)</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>
          )}
          <div className="col-span-2">
            <label className="label">Documento / observação</label>
            <input className="input" value={documentNo} onChange={(e) => setDocumentNo(e.target.value)} />
          </div>
          {error && <p className="text-critical text-xs col-span-2">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" disabled={register.isPending}>
              {register.isPending ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
