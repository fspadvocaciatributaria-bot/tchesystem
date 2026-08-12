import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Ícone de informação com tooltip explicando a origem/fórmula de um valor
 * (rastreabilidade). Opcionalmente leva à tela de origem ("Ver origem").
 */
export function InfoTooltip({
  text,
  origin,
  originRoute,
}: {
  text: ReactNode;
  origin?: string;
  originRoute?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Explicação"
        className="ml-1 w-4 h-4 rounded-full bg-ink-soft border border-ink-border text-[10px] text-muted hover:text-strong inline-flex items-center justify-center leading-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-ink-card border border-ink-border p-2.5 text-[11px] text-muted-soft shadow-lg font-normal normal-case text-left"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span className="block">{text}</span>
          {origin && <span className="block mt-1 text-muted">Origem: {origin}</span>}
          {originRoute && (
            <Link to={originRoute} className="block mt-1 text-gold hover:underline" onClick={() => setOpen(false)}>
              Ver origem →
            </Link>
          )}
        </span>
      )}
    </span>
  );
}
