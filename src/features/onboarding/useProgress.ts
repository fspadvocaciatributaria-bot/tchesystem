import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';

export interface TrailStep {
  key: string;
  label: string;
  hint: string;
  route: string;
  done: boolean;
}

async function count(table: string, orgId: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase.from(table as any) as any)
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);
  if (error) return 0;
  return count ?? 0;
}

/** Progresso da trilha de aprendizado, derivado dos dados reais da organização. */
export function useProgress() {
  const { organization } = useOrg();
  const orgId = organization?.id;

  return useQuery({
    queryKey: ['trail-progress', orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<TrailStep[]> => {
      const id = orgId!;
      const [pros, prods, moves, fixed, services, formations, customers, quotes, cash] =
        await Promise.all([
          count('professionals', id),
          count('products', id),
          count('inventory_movements', id),
          count('fixed_costs', id),
          count('services', id),
          count('service_price_formations', id),
          count('customers', id),
          count('quotes', id),
          count('transactions', id),
        ]);

      return [
        { key: 'settings', label: 'Configurar produtividade e margens', hint: 'Defina dias/horas e as margens em Configurações — base dos cálculos.', route: '/settings', done: true },
        { key: 'pro', label: 'Cadastrar um profissional', hint: 'Quem executa os serviços.', route: '/professionals', done: pros > 0 },
        { key: 'fixed', label: 'Lançar custos fixos', hint: 'Aluguel, energia… entram no rateio por hora.', route: '/costs/fixed', done: fixed > 0 },
        { key: 'prod', label: 'Cadastrar um produto', hint: 'Materiais usados nos serviços.', route: '/products', done: prods > 0 },
        { key: 'stock', label: 'Dar entrada no estoque', hint: 'Gera o custo médio do material.', route: '/inventory', done: moves > 0 },
        { key: 'service', label: 'Criar um serviço', hint: 'A base da formação de preço.', route: '/services', done: services > 0 },
        { key: 'price', label: 'Fazer a formação de preço', hint: 'Descubra custo, mínimo e recomendado.', route: '/pricing', done: formations > 0 },
        { key: 'customer', label: 'Cadastrar um cliente', hint: 'Para gerar orçamentos.', route: '/customers', done: customers > 0 },
        { key: 'quote', label: 'Criar um orçamento', hint: 'Proposta profissional a partir do preço.', route: '/quotes', done: quotes > 0 },
        { key: 'cash', label: 'Registrar um lançamento financeiro', hint: 'Contas a pagar/receber no módulo Financeiro.', route: '/financeiro/lancamentos', done: cash > 0 },
      ];
    },
  });
}
