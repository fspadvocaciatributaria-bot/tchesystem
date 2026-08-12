import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HELP_SECTIONS, type HelpTopic } from './helpContent';

export function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);

  const q = query.trim().toLowerCase();
  const sections = HELP_SECTIONS.map((s) => ({
    ...s,
    topics: q
      ? s.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q) ||
            t.body.join(' ').toLowerCase().includes(q),
        )
      : s.topics,
  })).filter((s) => s.topics.length > 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-1">Central de Ajuda</h1>
      <p className="text-sm text-muted mb-4">
        Aprenda o que cada tela faz e os conceitos por trás dos cálculos.
      </p>

      <input
        className="input max-w-md mb-6"
        placeholder="🔎 Buscar na ajuda…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Índice */}
        {!q && (
          <nav className="hidden lg:block sticky top-4 self-start space-y-1">
            {HELP_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                  activeSection === s.id ? 'bg-ink-card text-gold' : 'text-muted hover:text-white'
                }`}
              >
                {s.title}
              </a>
            ))}
          </nav>
        )}

        <div className="space-y-8">
          {sections.length === 0 && <p className="text-muted text-sm">Nada encontrado para "{query}".</p>}
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-4">
              <h2 className="text-sm uppercase tracking-wide text-muted mb-3">{s.title}</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {s.topics.map((t) => (
                  <TopicCard key={t.id} topic={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: HelpTopic }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button className="w-full text-left" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-start gap-3">
          <span className="text-xl">{topic.icon}</span>
          <div className="flex-1">
            <div className="text-white font-medium">{topic.title}</div>
            <div className="text-xs text-muted mt-0.5">{topic.summary}</div>
          </div>
          <span className="text-muted text-xs">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-ink-border space-y-2">
          {topic.body.map((p, i) => (
            <p key={i} className="text-sm text-muted-soft leading-relaxed">
              {p}
            </p>
          ))}
          {topic.steps && (
            <ol className="mt-2 space-y-1 list-decimal list-inside text-sm text-muted-soft">
              {topic.steps.map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>
          )}
          {topic.route && (
            <Link to={topic.route} className="inline-block mt-2 text-xs text-gold hover:underline">
              Abrir tela →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
