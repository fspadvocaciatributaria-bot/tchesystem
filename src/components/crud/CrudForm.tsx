import { useState, type FormEvent } from 'react';
import type { FieldConfig } from './types';

/** Converte valores do formulário (strings) para o tipo do campo. */
function coerce(field: FieldConfig, raw: unknown): unknown {
  if (field.type === 'number' || field.type === 'currency') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (field.type === 'percent') {
    // usuário digita em %, armazenamos fração
    const n = Number(raw);
    return Number.isFinite(n) ? n / 100 : 0;
  }
  if (field.type === 'checkbox') return Boolean(raw);
  if (raw === '') return null;
  return raw;
}

function initialValue(field: FieldConfig, existing: Record<string, unknown> | null): unknown {
  const v = existing?.[field.name];
  if (v === undefined || v === null) return field.defaultValue ?? (field.type === 'checkbox' ? false : '');
  if (field.type === 'percent') return typeof v === 'number' ? v * 100 : v;
  return v;
}

export function CrudForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  submitting,
  error,
  suggestions,
}: {
  fields: FieldConfig[];
  initial: Record<string, unknown> | null;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
  submitting: boolean;
  error?: string | null;
  suggestions?: Record<string, string[]>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of fields) v[f.name] = initialValue(f, initial);
    return v;
  });

  function set(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const out: Record<string, unknown> = {};
    for (const f of fields) out[f.name] = coerce(f, values[f.name]);
    onSubmit(out);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      {fields.map((f) => (
        <div key={f.name} className={f.span === 1 ? 'col-span-1' : 'col-span-2'}>
          {f.type !== 'checkbox' && <label className="label">{f.label}</label>}
          {f.type === 'textarea' ? (
            <textarea
              className="input min-h-[72px]"
              value={String(values[f.name] ?? '')}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
            />
          ) : f.type === 'select' ? (
            <select
              className="input"
              value={String(values[f.name] ?? '')}
              onChange={(e) => set(f.name, e.target.value)}
              required={f.required}
            >
              <option value="">Selecione…</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'checkbox' ? (
            <label className="flex items-center gap-2 text-sm text-muted-soft mt-5">
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => set(f.name, e.target.checked)}
                className="accent-gold"
              />
              {f.label}
            </label>
          ) : (
            <>
              <input
                className="input"
                type={f.type === 'text' ? 'text' : 'number'}
                step={f.type === 'currency' || f.type === 'percent' ? '0.01' : 'any'}
                value={String(values[f.name] ?? '')}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                list={
                  f.type === 'text' && suggestions?.[f.name]?.length ? `sug-${f.name}` : undefined
                }
              />
              {f.type === 'text' && suggestions?.[f.name]?.length ? (
                <datalist id={`sug-${f.name}`}>
                  {suggestions[f.name].map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              ) : null}
            </>
          )}
          {f.help && <p className="text-[11px] text-muted mt-1">{f.help}</p>}
        </div>
      ))}
      {error && <p className="text-critical text-xs col-span-2">{error}</p>}
      <div className="col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
