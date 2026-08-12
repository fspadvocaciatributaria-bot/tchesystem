// Conteúdo da Central de Ajuda. Editável em um só lugar (data-driven).

export interface HelpTopic {
  id: string;
  icon: string;
  title: string;
  summary: string;
  body: string[]; // parágrafos
  steps?: string[]; // passo a passo opcional
  route?: string; // link "abrir tela"
}

export interface HelpSection {
  id: string;
  title: string;
  topics: HelpTopic[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'inicio',
    title: 'Começando',
    topics: [
      {
        id: 'visao-geral',
        icon: '🧭',
        title: 'O que é o TcheSystem',
        summary: 'Descubra quanto cobrar antes de dizer o preço ao cliente.',
        body: [
          'O TcheSystem ajuda você a descobrir o preço certo de cada serviço — cobrindo seus custos, sua mão de obra e a margem de lucro que você definiu — e depois transforma esse preço em orçamento, controla o estoque e mostra se o negócio está dando lucro.',
          'A ideia central: não é uma calculadora genérica. Cada profissional tem uma realidade (custos, horas, metas) diferente, e o sistema transforma a SUA realidade em um preço objetivo.',
        ],
        steps: [
          'Configure sua empresa e produtividade em Configurações.',
          'Cadastre profissionais, produtos, custos fixos e variáveis.',
          'Crie um serviço e faça a formação de preço.',
          'Gere um orçamento para o cliente a partir do preço formado.',
          'Registre entradas/saídas no fluxo de caixa e acompanhe o dashboard.',
        ],
      },
      {
        id: 'cadeia',
        icon: '🔗',
        title: 'A cadeia: Preço → Serviço → Orçamento → Cliente',
        summary: 'Entenda a diferença entre formar preço e fazer orçamento.',
        body: [
          'Formação de preço é a construção do preço ideal de um serviço (ex.: Tattoo Blackwork, 5h). Ela calcula custo, preço mínimo, recomendado e premium.',
          'Orçamento é usar aquele preço já formado para criar uma proposta a um cliente específico (com desconto, condições, validade).',
          'Ou seja: primeiro você forma o preço uma vez; depois reutiliza esse preço em vários orçamentos.',
        ],
      },
    ],
  },
  {
    id: 'cadastros',
    title: 'Cadastros',
    topics: [
      {
        id: 'profissionais',
        icon: '🧑‍🔧',
        title: 'Profissionais e Mão de obra',
        summary: 'Quem executa os serviços e como é remunerado.',
        body: [
          'Cadastre cada profissional (nome, especialidade, contato). Em Mão de obra você define os tipos de trabalho executados (ex.: tatuagem, retoque, edição).',
          'Na formação de preço você informa quantas horas de cada profissional o serviço consome e o valor/hora — o sistema calcula o custo de mão de obra.',
        ],
        route: '/professionals',
      },
      {
        id: 'produtos-estoque',
        icon: '📦',
        title: 'Produtos e Estoque',
        summary: 'Materiais com custo médio ponderado.',
        body: [
          'Cadastre os materiais (agulhas, tintas, etc.) com unidade e estoque mínimo. O estoque e o custo são atualizados pelo módulo Estoque.',
          'Em Estoque você registra entradas (compras), saídas (consumo) e ajustes. A cada entrada, o sistema recalcula o custo médio ponderado do produto — é esse custo médio que entra na formação de preço.',
        ],
        steps: [
          'Cadastre o produto em Produtos.',
          'Dê entrada da compra em Estoque (quantidade + custo unitário).',
          'O custo médio é calculado automaticamente.',
          'Ao usar o material num serviço, o custo médio é puxado na formação de preço.',
        ],
        route: '/inventory',
      },
      {
        id: 'custos',
        icon: '🏠',
        title: 'Custos fixos e variáveis',
        summary: 'A base do rateio por hora.',
        body: [
          'Custos fixos (aluguel, energia, salários) são convertidos para uma base mensal. O sistema soma tudo e divide pelas suas horas produtivas no mês para achar o custo fixo por hora.',
          'Esse custo por hora é rateado em cada serviço conforme a duração — assim o preço já cobre a estrutura do seu negócio.',
        ],
        route: '/costs/fixed',
      },
    ],
  },
  {
    id: 'precos',
    title: 'Preços e Metas',
    topics: [
      {
        id: 'formacao',
        icon: '💰',
        title: 'Formação de Preço',
        summary: 'Custo, mínimo, recomendado e premium — com explicação.',
        body: [
          'Você monta o serviço com componentes: mão de obra, materiais e custos adicionais. O sistema soma tudo e adiciona o rateio de custo fixo para chegar ao CUSTO de execução.',
          'A partir do custo, calcula quatro valores: CUSTO (piso), PREÇO MÍNIMO (margem mínima), PREÇO RECOMENDADO (margem ideal) e PREÇO PREMIUM (margem maior).',
          'Fórmula-mestra: Preço = Custo ÷ (1 − comissão − impostos − margem). Passe o mouse sobre cada valor para ver a composição.',
        ],
        route: '/pricing',
      },
      {
        id: 'meta',
        icon: '🎯',
        title: 'Minha Meta',
        summary: 'Quanto faturar para atingir o lucro desejado.',
        body: [
          'Informe quanto quer lucrar por mês. O sistema calcula o faturamento necessário, e quanto isso representa por hora, por dia e em número de serviços.',
          'Use para planejar: "se meu ticket médio for R$ 800, quantos clientes preciso atender?".',
        ],
        route: '/goals',
      },
    ],
  },
  {
    id: 'gestao',
    title: 'Orçamentos e Gestão',
    topics: [
      {
        id: 'orcamentos',
        icon: '📄',
        title: 'Orçamentos',
        summary: 'Proposta profissional a partir do preço formado.',
        body: [
          'Crie um orçamento escolhendo o cliente e adicionando serviços — o preço recomendado já vem carregado (e você pode ajustar). Se colocar um valor abaixo do preço mínimo, o sistema avisa.',
          'A visualização do orçamento é pronta para impressão/PDF, com sua logo e dados da empresa.',
        ],
        route: '/quotes',
      },
      {
        id: 'caixa-dashboard',
        icon: '💵',
        title: 'Fluxo de caixa e Dashboard',
        summary: 'Entradas, saídas e a visão do mês.',
        body: [
          'No Fluxo de caixa você lança entradas e saídas e vê os indicadores por período (hoje, semana, mês, etc.).',
          'O Dashboard resume o mês: faturamento, lucro, margem, meta atingida e alertas de estoque crítico, com gráfico dos últimos meses.',
        ],
        route: '/cashflow',
      },
    ],
  },
  {
    id: 'conceitos',
    title: 'Glossário',
    topics: [
      {
        id: 'glossario',
        icon: '📖',
        title: 'Termos importantes',
        summary: 'Custo médio, rateio, margem sobre o preço, horas produtivas…',
        body: [
          'Custo médio ponderado: média do custo de um material considerando todas as entradas. Recalculado a cada compra.',
          'Horas produtivas: horas realmente faturáveis no mês (dias trabalhados × horas produtivas/dia). Base do rateio de custo fixo.',
          'Rateio de custo fixo: custo fixo mensal ÷ horas produtivas × horas do serviço.',
          'Margem sobre o preço: a margem é uma fração do preço de venda, não do custo — por isso a fórmula usa Preço = Custo ÷ (1 − c − t − m).',
          'Preço mínimo × recomendado: o mínimo preserva a margem mínima; o recomendado busca a margem ideal que você configurou.',
        ],
      },
    ],
  },
];
