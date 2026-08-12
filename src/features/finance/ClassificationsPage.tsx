import { useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { useOrg } from '@/features/organization/OrgProvider';
import { useCategories, useCategoryMutations } from './useFinance';
import { seedDefaultCategories } from './seedCategories';
import type { ClassificationCategory, ClassificationType } from './types';

export function ClassificationsPage() {
  const { organization, canWrite } = useOrg();
  const { data: cats, isLoading } = useCategories();
  const { save, remove } = useCategoryMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassificationCategory | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Agrupa por tipo e organiza pais/filhos (2 níveis para exibição).
  const tree = useMemo(() => {
    const list = cats ?? [];
    const roots = list.filter((c) => !c.parent_id);
    const childrenOf = (id: string) => list.filter((c) => c.parent_id === id);
    return { roots, childrenOf };
  }, [cats]);

  function openNew(type: ClassificationType, parent?: ClassificationCategory) {
    setEditing(null);
    setForm({ name: '', type: parent?.type ?? type, parent_id: parent?.id ?? '', code: '', color: '' });
    setErr(null);
    setOpen(true);
  }
  function openEdit(c: ClassificationCategory) {
    setEditing(c);
    setForm({ name: c.name, type: c.type, parent_id: c.parent_id ?? '', code: c.code ?? '', color: c.color ?? '' });
    setErr(null);
    setOpen(true);
  }

  async function submit() {
    setErr(null);
    try {
      await save.mutateAsync({
        id: editing?.id,
        values: {
          name: form.name, type: form.type, parent_id: form.parent_id || null,
          code: form.code || null, color: form.color || null,
        },
      });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro');
    }
  }

  async function doSeed() {
    if (!organization) return;
    setSeeding(true);
    try {
      await seedDefaultCategories(organization.id);
    } finally {
      setSeeding(false);
      window.location.reload();
    }
  }

  function Row({ c, level }: { c: ClassificationCategory; level: number }) {
    return (
      <>
        <tr className="border-b border-ink-border/50">
          <td className="px-4 py-2" style={{ paddingLeft: 16 + level * 20 }}>
            <span className="text-strong">{c.name}</span>
            {c.code && <span className="text-xs text-muted ml-2">{c.code}</span>}
          </td>
          <td className="px-4 py-2 text-right whitespace-nowrap">
            {canWrite && (
              <>
                {level < 2 && <button className="text-xs text-muted hover:text-gold mr-3" onClick={() => openNew(c.type, c)}>+ sub</button>}
                <button className="text-xs text-gold hover:underline mr-3" onClick={() => openEdit(c)}>Editar</button>
                {!c.is_system && <button className="text-xs text-critical hover:underline" onClick={() => { if (confirm('Excluir?')) remove.mutate(c.id); }}>Excluir</button>}
              </>
            )}
          </td>
        </tr>
        {tree.childrenOf(c.id).map((ch) => <Row key={ch.id} c={ch} level={level + 1} />)}
      </>
    );
  }

  const byType = (t: ClassificationType) => tree.roots.filter((r) => r.type === t);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-strong">Classificações</h1>
          <p className="text-sm text-muted mt-1">Categorias de despesas e receitas (grupo → categoria → subcategoria).</p>
        </div>
        {canWrite && (cats ?? []).length === 0 && (
          <button className="btn-ghost" onClick={doSeed} disabled={seeding}>{seeding ? 'Criando…' : 'Criar categorias padrão'}</button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {(['expense', 'income'] as ClassificationType[]).map((t) => (
            <div key={t}>
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-sm font-semibold ${t === 'expense' ? 'text-critical' : 'text-success'}`}>
                  {t === 'expense' ? 'Despesas' : 'Receitas'}
                </h2>
                {canWrite && <button className="text-xs text-gold hover:underline" onClick={() => openNew(t)}>+ Grupo</button>}
              </div>
              <div className="card p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {byType(t).length === 0 ? (
                      <tr><td className="px-4 py-4 text-center text-muted">Nenhuma.</td></tr>
                    ) : byType(t).map((c) => <Row key={c.id} c={c} level={0} />)}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar classificação' : 'Nova classificação'}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Nome</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!!form.parent_id}>
              <option value="expense">Despesa</option><option value="income">Receita</option>
            </select></div>
          <div><label className="label">Código (opcional)</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DESP.01" /></div>
          <div className="col-span-2"><label className="label">Cor (opcional)</label>
            <input className="input" type="color" value={form.color || '#d4af37'} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
          {err && <p className="text-critical text-xs col-span-2">{err}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={submit} disabled={save.isPending || !form.name}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
