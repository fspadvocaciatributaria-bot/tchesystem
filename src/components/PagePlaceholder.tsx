interface Props {
  title: string;
  phase: string;
  description?: string;
}

/** Placeholder de módulo ainda não implementado (indica a fase de entrega). */
export function PagePlaceholder({ title, phase, description }: Props) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">{title}</h1>
      <p className="text-sm text-muted mb-6">{description ?? 'Módulo em construção.'}</p>
      <div className="card border-dashed">
        <span className="inline-block text-xs px-2 py-1 rounded bg-ink-soft text-gold border border-ink-border">
          {phase}
        </span>
        <p className="text-sm text-muted mt-3">
          Esta tela será implementada na {phase}. A fundação (auth, layouts, tokens de design,
          motor de precificação e schema do banco) já está pronta.
        </p>
      </div>
    </div>
  );
}
