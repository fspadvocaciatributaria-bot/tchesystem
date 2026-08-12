import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { computeQuoteTotals } from '@/lib/pricing';
import { useQuote, useSaveQuote, type QuoteItemInput } from './useQuotes';
import type { Enums } from '@/lib/supabase/database.types';

let k = 0;
const newKey = () => `qi${k++}`;

interface ServiceOption {
  id: string;
  name: string;
  service_price_formations: { id: string; price_recommended: number; price_min: number }[] | null;
}

export function QuoteEditorPage() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const { organization } = useOrg();
  const orgId = organization?.id;
  const save = useSaveQuote();

  const { data: customers } = useQuery({
    queryKey: ['customers-min', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, name').eq('organization_id', orgId!).order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ['services-formations', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, service_price_formations(id, price_recommended, price_min)')
        .eq('organization_id', orgId!)
        .order('name');
      if (error) throw error;
      return data as unknown as ServiceOption[];
    },
  });

  const { data: existing } = useQuote(id);

  const [customerId, setCustomerId] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Enums<'quote_status'>>('draft');
  const [discount, setDiscount] = useState(0);
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<QuoteItemInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !editing) return;
    if (existing) {
      setCustomerId(existing.customer_id ?? '');
      setCode(existing.code ?? '');
      setStatus(existing.status);
      setDiscount(existing.discount_amount);
      setValidUntil(existing.valid_until ?? '');
      setTerms(existing.terms ?? '');
      setNotes(existing.notes ?? '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const its: any[] = (existing as any).quote_items ?? [];
      setItems(
        its.map((it) => ({
          key: newKey(),
          service_id: it.service_id,
          formation_id: it.formation_id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
        })),
      );
      setInitialized(true);
    }
  }, [existing, editing, initialized]);

  const totals = useMemo(
    () => computeQuoteTotals(items.map((it) => ({ quantity: it.quantity, unitPrice: it.unit_price })), { type: 'amount', value: discount }),
    [items, discount],
  );

  function addServiceItem(serviceId: string) {
    const svc = services?.find((s) => s.id === serviceId);
    if (!svc) return;
    const f = svc.service_price_formations?.[0];
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        service_id: svc.id,
        formation_id: f?.id ?? null,
        description: svc.name,
        quantity: 1,
        unit_price: f?.price_recommended ?? 0,
        price_min: f?.price_min,
      },
    ]);
  }
  function updateItem(key: string, patch: Partial<QuoteItemInput>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }
  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  async function handleSave() {
    setError(null);
    try {
      const quoteId = await save.mutateAsync({
        id,
        customer_id: customerId || null,
        code: code || null,
        status,
        discount_amount: discount,
        valid_until: validUntil || null,
        terms: terms || null,
        notes: notes || null,
        items,
        subtotal: totals.subtotal,
        total: totals.total,
      });
      navigate(`/quotes/${quoteId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-xl font-semibold text-white">{editing ? 'Editar orçamento' : 'Novo orçamento'}</h1>

      <div className="card grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Cliente</label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Selecione…</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Código / identificação</label>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex.: ORC-001" />
        </div>
        <div>
          <label className="label">Válido até</label>
          <input className="input" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Enums<'quote_status'>)}>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceito</option>
            <option value="rejected">Recusado</option>
            <option value="expired">Expirado</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Itens</h2>
          <select
            className="input max-w-[220px]"
            value=""
            onChange={(e) => {
              if (e.target.value) addServiceItem(e.target.value);
              e.target.value = '';
            }}
          >
            <option value="">+ Adicionar serviço…</option>
            {services?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-muted">Adicione serviços com preço formado.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const below = it.price_min != null && it.unit_price < it.price_min;
              return (
                <div key={it.key} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="label">Descrição</label>
                    <input className="input" value={it.description} onChange={(e) => updateItem(it.key, { description: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Qtd</label>
                    <input className="input" type="number" step="1" value={it.quantity} onChange={(e) => updateItem(it.key, { quantity: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="col-span-3">
                    <label className="label">Valor unit.</label>
                    <input className={`input ${below ? 'border-critical' : ''}`} type="number" step="0.01" value={it.unit_price} onChange={(e) => updateItem(it.key, { unit_price: Number(e.target.value) || 0 })} />
                    {below && <p className="text-[10px] text-critical mt-0.5">Abaixo do mínimo ({formatBRL(it.price_min!)})</p>}
                  </div>
                  <div className="col-span-1 text-right text-xs text-gold pb-2">{formatBRL(it.quantity * it.unit_price)}</div>
                  <div className="col-span-1 pb-1">
                    <button className="text-critical text-xs" onClick={() => removeItem(it.key)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Desconto (R$)</label>
          <input className="input" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
        </div>
        <div className="flex flex-col justify-end text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatBRL(totals.subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Desconto</span><span>-{formatBRL(totals.discount)}</span></div>
          <div className="flex justify-between text-white font-semibold text-lg"><span>Total</span><span className="text-gold">{formatBRL(totals.total)}</span></div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Condições / prazo</label>
          <input className="input" value={terms} onChange={(e) => setTerms(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Observações</label>
          <textarea className="input min-h-[64px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-critical text-sm">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-primary" onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? 'Salvando…' : 'Salvar orçamento'}
        </button>
        <button className="btn-ghost" onClick={() => navigate('/quotes')}>Cancelar</button>
      </div>
    </div>
  );
}
