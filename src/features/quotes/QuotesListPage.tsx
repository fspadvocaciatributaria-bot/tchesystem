import { Link } from 'react-router-dom';
import { formatBRL } from '@/lib/money/format';
import { useOrg } from '@/features/organization/OrgProvider';
import { useQuotesList } from './useQuotes';
import type { Enums } from '@/lib/supabase/database.types';

const STATUS_LABEL: Record<Enums<'quote_status'>, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  accepted: 'Aceito',
  rejected: 'Recusado',
  expired: 'Expirado',
};

export function QuotesListPage() {
  const { canWrite } = useOrg();
  const { data, isLoading } = useQuotesList();

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-strong">Orçamentos</h1>
          <p className="text-sm text-muted mt-1">Propostas criadas a partir dos preços formados.</p>
        </div>
        {canWrite && (
          <Link to="/quotes/new" className="btn-primary shrink-0">+ Novo orçamento</Link>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : !data || data.length === 0 ? (
        <div className="card border-dashed text-center py-10">
          <p className="text-muted text-sm">Nenhum orçamento ainda.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-ink-border">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((q) => (
                <tr key={q.id} className="border-b border-ink-border/50 last:border-0 hover:bg-ink-soft/40">
                  <td className="px-4 py-3 text-strong">{q.code ?? '—'}</td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="px-4 py-3 text-muted-soft">{(q as any).customers?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-soft">{STATUS_LABEL[q.status]}</td>
                  <td className="px-4 py-3 text-gold">{formatBRL(q.total)}</td>
                  <td className="px-4 py-3 text-muted">{new Date(q.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/quotes/${q.id}`} className="text-xs text-gold hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
