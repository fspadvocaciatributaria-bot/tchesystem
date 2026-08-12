import { useState, type DragEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';
import { parseNfe, type NfeParsed } from '@/lib/nfe/parseNfe';
import { applyNota, isDuplicate, type ImportResult } from './importService';

interface Preview {
  fileName: string;
  parsed?: NfeParsed;
  error?: string;
  duplicate?: boolean;
  result?: ImportResult;
}

export function ImportXmlPage() {
  const { organization, canWrite } = useOrg();
  const orgId = organization?.id;
  const qc = useQueryClient();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    if (!orgId) return;
    const arr = Array.from(files).filter((f) => f.name.toLowerCase().endsWith('.xml'));
    const next: Preview[] = [];
    for (const file of arr) {
      try {
        const text = await file.text();
        const parsed = parseNfe(text);
        const duplicate = await isDuplicate(orgId, parsed.chave);
        next.push({ fileName: file.name, parsed, duplicate });
      } catch (e) {
        next.push({ fileName: file.name, error: e instanceof Error ? e.message : 'Erro ao ler' });
      }
    }
    setPreviews((prev) => [...prev, ...next]);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  async function importAll() {
    if (!orgId) return;
    setBusy(true);
    const updated = [...previews];
    for (let i = 0; i < updated.length; i++) {
      const p = updated[i];
      if (!p.parsed || p.error || p.duplicate || p.result) continue;
      const result = await applyNota(orgId, p.parsed);
      updated[i] = { ...p, result, duplicate: result.status === 'duplicada' };
      setPreviews([...updated]);
    }
    setBusy(false);
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['inventory_movements'] });
    qc.invalidateQueries({ queryKey: ['options'] });
  }

  const pending = previews.filter((p) => p.parsed && !p.duplicate && !p.error && !p.result).length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-strong mb-1">Importação de XML (NF-e / NFC-e)</h1>
      <p className="text-sm text-muted mb-6">
        Importe arquivos XML de notas fiscais para cadastrar fornecedores, produtos e dar entrada no estoque
        automaticamente. O custo médio é recalculado em cada entrada.
      </p>

      {canWrite && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`card border-dashed block text-center py-10 cursor-pointer transition-colors ${
            dragOver ? 'border-gold bg-ink-soft/40' : ''
          }`}
        >
          <div className="text-3xl mb-2">📥</div>
          <div className="text-sm text-strong">Arraste os XML aqui ou clique para selecionar</div>
          <div className="text-xs text-muted mt-1">Aceita múltiplos arquivos (.xml) de NF-e e NFC-e</div>
          <input
            type="file"
            accept=".xml,application/xml,text/xml"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      )}

      {previews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-strong">Notas ({previews.length})</h2>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setPreviews([])} disabled={busy}>
                Limpar
              </button>
              {canWrite && (
                <button className="btn-primary" onClick={importAll} disabled={busy || pending === 0}>
                  {busy ? 'Importando…' : `Importar ${pending} nota(s)`}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {previews.map((p, i) => (
              <PreviewCard key={i} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ p }: { p: Preview }) {
  if (p.error) return <span className="text-xs text-critical">Erro</span>;
  if (p.result?.status === 'importada') return <span className="text-xs text-success">✓ Importada</span>;
  if (p.duplicate) return <span className="text-xs text-warning">Duplicada (já importada)</span>;
  return <span className="text-xs text-gold">Pronta</span>;
}

function PreviewCard({ p }: { p: Preview }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <button className="text-left flex-1" onClick={() => setOpen((v) => !v)}>
          <div className="flex items-center gap-2">
            <span className="text-strong text-sm font-medium">{p.parsed?.emitente.nome ?? p.fileName}</span>
            {p.parsed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink-soft text-muted border border-ink-border">
                {p.parsed.model}
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {p.error
              ? p.error
              : `${p.parsed?.itens.length ?? 0} itens · ${formatBRL(p.parsed?.totalNota ?? 0)} · NF ${p.parsed?.numero ?? '—'}`}
          </div>
          {p.result?.message && <div className="text-xs text-critical mt-0.5">{p.result.message}</div>}
        </button>
        <StatusBadge p={p} />
      </div>

      {open && p.parsed && (
        <div className="mt-3 pt-3 border-t border-ink-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-2">Produto</th>
                <th className="py-1 pr-2">Qtd</th>
                <th className="py-1 pr-2">Custo un.</th>
                <th className="py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {p.parsed.itens.map((it, i) => (
                <tr key={i} className="text-muted-soft">
                  <td className="py-1 pr-2">{it.descricao}</td>
                  <td className="py-1 pr-2">{it.quantidade} {it.unidade}</td>
                  <td className="py-1 pr-2">{formatBRL(it.valorUnitario)}</td>
                  <td className="py-1">{formatBRL(it.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
