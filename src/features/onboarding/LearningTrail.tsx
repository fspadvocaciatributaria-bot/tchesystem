import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from './useProgress';

/**
 * Trilha de aprendizado (Primeiros Passos) — checklist guiado para novos usuários.
 * O progresso é calculado a partir dos dados reais; some sozinho quando concluído.
 */
export function LearningTrail() {
  const { data: steps, isLoading } = useProgress();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading || !steps) return null;

  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);

  // Concluída: mostra um resumo discreto e dispensável.
  if (done === total) return null;

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="card mb-6 border-gold/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div>
            <h2 className="text-white font-semibold text-sm">Primeiros passos</h2>
            <p className="text-xs text-muted">
              {done} de {total} concluídos — vamos deixar seu sistema pronto para usar.
            </p>
          </div>
        </div>
        <button className="text-xs text-muted hover:text-white" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? 'Expandir' : 'Recolher'}
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="mt-3 h-2 rounded-full bg-ink-soft overflow-hidden">
        <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>

      {!collapsed && (
        <ul className="mt-4 space-y-1.5">
          {steps.map((s) => (
            <li key={s.key}>
              <Link
                to={s.route}
                className={`flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-ink-soft/50 transition-colors ${
                  s.done ? 'opacity-60' : ''
                }`}
              >
                <span className={`mt-0.5 ${s.done ? 'text-success' : 'text-muted'}`}>
                  {s.done ? '✓' : '○'}
                </span>
                <span className="flex-1">
                  <span className={`text-sm ${s.done ? 'line-through text-muted' : 'text-white'}`}>
                    {s.label}
                  </span>
                  {!s.done && <span className="block text-xs text-muted">{s.hint}</span>}
                </span>
                {!s.done && s.key === nextStep?.key && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold self-center">
                    próximo
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
