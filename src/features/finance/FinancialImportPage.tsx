import { useState, type DragEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { parseNfe, type NfeParsed } from '@/lib/nfe/parseNfe';
import { useAccounts, useCategories } from './useFinance';
import { buildDraft, confirmImport, type FinancialDraft } from './financialImport';
import type { TransactionType } from './types';

interface Item {
  fileName: string;
  nfe?: NfeParsed;
  draft?: FinancialDraft;
  error?: string;
  imported?: boolean;
  // campos editáveis na conferência
  direction: TransactionType | 'unknown';
  due_date: string;
  classification_category_id: string;
  financial_account_id: string;
  description: string;
}

function addDays(iso: string | null, days: number): string {
  const d = iso ? new Date(iso + 'T00:00:00') : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function FinancialImportPage() {
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const companyCnpj = organization?.doc_number ?? null;
  const { data: accounts } = useAccounts();
  const { data: cats } = useCategories();
  const qc = useQueryClient();

  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    if (!orgId) return;
    const arr = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.xml'));
    const next: Item[] = [];
    for (const file of arr) {
      try {
        const nfe = parseNfe(await file.text());
        const draft = await buildDraft(orgId, nfe, companyCnpj);
        // vencimento sugerido: a pagar = emissão + 30d; a receber = emissão
        const due = draft.direction === 'payable' ? addDays(draft.issue_date, 30) : draft.issue_date ?? new Date().toISOString().slice(0, 10);
        next.push({
          fileName: file.name, nfe, draft,
          direction: draft.direction, due_date: due,
          classification_category_id: '', financial_account_id: '', description: draft.description,
        });
      } catch (e) {
        next.push({ fileName: file.name, error: e instanceof Error ? e.message : 'Erro', direction: 'unknown', due_date: '', classification_category_id: '', financial_account_id: '', description: '' });
      }
    }
    setItems((prev) => [...prev, ...next]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function update(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function importAll() {
    if (!orgId) return;
    setBusy(true);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      const it = updated[i];
      if (!it.nfe || it.error || it.draft?.duplicate || it.imported) continue;
      if (it.direction === 'unknown') continue;
      try {
        await confirmImport({
          orgId, nfe: it.nfe, direction: it.direction, description: it.description,
          amount: it.draft!.amount, due_date: it.due_date,
          classification_category_id: it.classification_category_id || null,
          financial_account_id: it.financial_account_id || null,
        });
        updated[i] = { ...it, imported: true };
      } catch (e) {
        updated[i] = { ...it, error: e instanceof Error ? e.message : 'Erro ao gravar' };
      }
      setItems([...updated]);
    }
    setBusy(false);
    qc.invalidateQueries({ queryKey: ['fin-transactions'] });
  }

  const pending = items.filter((it) => it.nfe && !it.error && !it.draft?.duplicate && !it.imported && it.direction !== 'unknown').length;
  const catsFor = (dir: string) => (cats ?? []).filter((c) => c.type === (dir === 'payable' ? 'expense' : 'income'));

  return (
    <div>
      <h1 className="text-xl font-semibold text-strong mb-1">Importar XML → Financeiro</h1>
      <p className="text-sm text-muted mb-2">
        Importe NF-e/NFC-e e gere contas a pagar (compras) ou a receber (vendas) automaticamente.
      </p>
      {!companyCnpj && (
        <p className="text-xs text-warning mb-4">
          Dica: preencha o CNPJ da sua empresa em Configurações para detectar automaticamente se cada nota é a pagar ou a receber.
        </p>
      )}

      {canWrite && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`card border-dashed block text-center py-10 cursor-pointer transition-colors ${dragOver ? 'border-gold bg-ink-soft/40' : ''}`}
        >
          <div className="text-3xl mb-2">📥</div>
          <div className="text-sm text-strong">Arraste os XML aqui ou clique para selecionar</div>
          <div className="text-xs text-muted mt-1">NF-e (55) e NFC-e (65)</div>
          <input type="file" accept=".xml,application/xml,text/xml" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </label>
      )}

      {items.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-strong">Conferência ({items.length})</h2>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setItems([])} disabled={busy}>Limpar</button>
              {canWrite && <button className="btn-primary" onClick={importAll} disabled={busy || pending === 0}>{busy ? 'Importando…' : `Importar ${pending}`}</button>}
            </div>
          </div>

          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-strong text-sm font-medium">{it.draft?.emitente ?? it.fileName}</span>
                      {it.nfe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink-soft text-muted border border-ink-border">{it.nfe.model}</span>}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {it.error ? it.error : `NF ${it.draft?.numero ?? '—'} · ${formatBRL(it.draft?.amount ?? 0)}`}
                    </div>
                  </div>
                  <div className="text-xs">
                    {it.error ? <span className="text-critical">Erro</span>
                      : it.imported ? <span className="text-success">✓ Importado</span>
                      : it.draft?.duplicate ? <span className="text-warning">Já importado</span>
                      : <span className="text-gold">Pronto</span>}
                  </div>
                </div>

                {it.nfe && !it.error && !it.draft?.duplicate && !it.imported && (
                  <div className="mt-3 pt-3 border-t border-ink-border grid sm:grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="label">Sentido</label>
                      <select className="input" value={it.direction} onChange={(e) => update(i, { direction: e.target.value as TransactionType })}>
                        <option value="unknown">Selecione…</option>
                        <option value="payable">A pagar</option>
                        <option value="receivable">A receber</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Vencimento</label>
                      <input className="input" type="date" value={it.due_date} onChange={(e) => update(i, { due_date: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Classificação</label>
                      <select className="input" value={it.classification_category_id} onChange={(e) => update(i, { classification_category_id: e.target.value })}>
                        <option value="">—</option>
                        {catsFor(it.direction).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Conta</label>
                      <select className="input" value={it.financial_account_id} onChange={(e) => update(i, { financial_account_id: e.target.value })}>
                        <option value="">—</option>
                        {(accounts ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Descrição</label>
                      <input className="input" value={it.description} onChange={(e) => update(i, { description: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
