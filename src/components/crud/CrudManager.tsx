import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { CrudForm } from './CrudForm';
import type { ColumnConfig, FieldConfig } from './types';
import { useResourceList, useResourceMutations, type ResourceTable } from '@/hooks/useResource';
import { useOrg } from '@/features/organization/OrgProvider';

interface Props<T> {
  table: ResourceTable;
  title: string;
  subtitle?: string;
  singular: string; // ex.: "profissional"
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  orderBy?: string;
  select?: string;
}

/**
 * Tela CRUD completa: lista + criação/edição/remoção via modal.
 * Reutilizada por todos os cadastros (FASE 2). Respeita can_write (RLS no banco).
 */
export function CrudManager<T extends { id: string }>({
  table,
  title,
  subtitle,
  singular,
  columns,
  fields,
  orderBy = 'created_at',
  select,
}: Props<T>) {
  const { canWrite } = useOrg();
  const { data: rows, isLoading, error } = useResourceList<T>(table, { orderBy, select });
  const { create, update, remove } = useResourceMutations(table);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(row: T) {
    setEditing(row);
    setFormError(null);
    setOpen(true);
  }

  async function handleSubmit(values: Record<string, unknown>) {
    setFormError(null);
    try {
      if (editing) await update.mutateAsync({ id: editing.id, values });
      else await create.mutateAsync(values);
      setOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar');
    }
  }

  async function handleDelete(row: T) {
    if (!confirm(`Excluir este ${singular}?`)) return;
    try {
      await remove.mutateAsync(row.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl font-semibold text-strong">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
        {canWrite && (
          <button className="btn-primary shrink-0" onClick={openNew}>
            + Novo
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : error ? (
        <p className="text-critical text-sm">{(error as Error).message}</p>
      ) : !rows || rows.length === 0 ? (
        <div className="card border-dashed text-center py-10">
          <p className="text-muted text-sm">Nenhum registro ainda.</p>
          {canWrite && (
            <button className="btn-ghost mt-3" onClick={openNew}>
              Cadastrar o primeiro
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-ink-border">
                {columns.map((c, i) => (
                  <th key={i} className="px-4 py-3 font-medium">
                    {c.header}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink-border/50 last:border-0 hover:bg-ink-soft/40">
                  {columns.map((c, i) => (
                    <td key={i} className={`px-4 py-3 text-muted-soft ${c.className ?? ''}`}>
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {canWrite && (
                      <>
                        <button className="text-xs text-gold hover:underline mr-3" onClick={() => openEdit(row)}>
                          Editar
                        </button>
                        <button className="text-xs text-critical hover:underline" onClick={() => handleDelete(row)}>
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Editar ${singular}` : `Novo ${singular}`}
      >
        <CrudForm
          fields={fields}
          initial={editing as Record<string, unknown> | null}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitting={create.isPending || update.isPending}
          error={formError}
        />
      </Modal>
    </div>
  );
}
