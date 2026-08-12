import { Link, useParams } from 'react-router-dom';
import { formatBRL } from '@/lib/money/format';
import { useOrg } from '@/features/organization/OrgProvider';
import { getLogoUrl } from '@/features/organization/logo';
import { useQuote } from './useQuotes';

/**
 * Visualização profissional do orçamento (print-ready via @media print).
 * Estruturado para futuramente gerar PDF (@react-pdf/renderer) sem refatoração.
 */
export function QuoteViewPage() {
  const { id } = useParams();
  const { organization, canWrite } = useOrg();
  const { data: quote, isLoading } = useQuote(id);

  if (isLoading) return <p className="text-muted">Carregando…</p>;
  if (!quote) return <p className="text-muted">Orçamento não encontrado.</p>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer = (quote as any).customers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = (quote as any).quote_items ?? [];

  function shareWhatsApp() {
    const empresa = organization?.trade_name || organization?.name || 'Orçamento';
    const linhas = [
      `*${empresa}* — Orçamento${quote!.code ? ' ' + quote!.code : ''}`,
      customer?.name ? `Cliente: ${customer.name}` : null,
      '',
      ...items.map((it) => `• ${it.description} — ${it.quantity}x ${formatBRL(it.unit_price)} = ${formatBRL(it.line_total)}`),
      '',
      `*Total: ${formatBRL(quote!.total)}*`,
      quote!.valid_until ? `Válido até ${new Date(quote!.valid_until).toLocaleDateString('pt-BR')}` : null,
      quote!.terms ? `Condições: ${quote!.terms}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n');
    const phone = (customer?.phone || '').replace(/\D/g, '');
    const base = phone ? `https://wa.me/55${phone}` : 'https://wa.me/';
    window.open(`${base}?text=${encodeURIComponent(linhas)}`, '_blank');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 no-print">
        <Link to="/quotes" className="text-xs text-muted hover:text-gold">← Voltar</Link>
        <div className="flex gap-2">
          {canWrite && (
            <Link to={`/quotes/${id}/edit`} className="btn-ghost">Editar</Link>
          )}
          <button className="btn-ghost" onClick={shareWhatsApp}>📱 WhatsApp</button>
          <button className="btn-primary" onClick={() => window.print()}>Imprimir / PDF</button>
        </div>
      </div>

      {/* Documento */}
      <div className="bg-white text-black rounded-xl2 p-8 print:p-0 print:rounded-none">
        <header className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
          <div>
            {getLogoUrl(organization?.logo_path) && (
              <img
                src={getLogoUrl(organization?.logo_path)!}
                alt="Logo"
                className="max-h-16 max-w-[220px] object-contain mb-2"
              />
            )}
            <h1 className="text-2xl font-bold text-black">{organization?.trade_name || organization?.name}</h1>
            {organization?.doc_number && <p className="text-xs text-gray-500">{organization.doc_number}</p>}
            {organization?.phone && <p className="text-xs text-gray-500">{organization.phone}</p>}
            {organization?.email && <p className="text-xs text-gray-500">{organization.email}</p>}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">ORÇAMENTO</div>
            {quote.code && <div className="text-sm text-gray-600">{quote.code}</div>}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(quote.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </header>

        {customer && (
          <section className="mb-6">
            <div className="text-xs uppercase text-gray-400 mb-1">Cliente</div>
            <div className="font-medium">{customer.name}</div>
            {customer.doc_number && <div className="text-sm text-gray-600">{customer.doc_number}</div>}
            {customer.phone && <div className="text-sm text-gray-600">{customer.phone}</div>}
          </section>
        )}

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-300 text-left text-gray-500">
              <th className="py-2">Descrição</th>
              <th className="py-2 text-right">Qtd</th>
              <th className="py-2 text-right">Valor unit.</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-gray-100">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatBRL(it.unit_price)}</td>
                <td className="py-2 text-right">{formatBRL(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1"><span className="text-gray-500">Subtotal</span><span>{formatBRL(quote.subtotal)}</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-500">Desconto</span><span>-{formatBRL(quote.discount_amount)}</span></div>
            <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-base">
              <span>Total</span><span>{formatBRL(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.terms && (
          <section className="mb-3">
            <div className="text-xs uppercase text-gray-400 mb-1">Condições</div>
            <p className="text-sm text-gray-700">{quote.terms}</p>
          </section>
        )}
        {quote.valid_until && (
          <p className="text-sm text-gray-600">Válido até {new Date(quote.valid_until).toLocaleDateString('pt-BR')}.</p>
        )}
        {quote.notes && <p className="text-xs text-gray-500 mt-4">{quote.notes}</p>}
      </div>
    </div>
  );
}
