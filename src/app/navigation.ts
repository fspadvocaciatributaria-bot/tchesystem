// Itens de navegação compartilhados entre DesktopLayout (sidebar) e MobileLayout (bottom nav).

export interface NavItem {
  to: string;
  label: string;
  icon: string; // emoji simples no MVP; trocável por ícone SVG depois
  primaryMobile?: boolean; // aparece na bottom nav do mobile
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '📊', primaryMobile: true },
  { to: '/services', label: 'Serviços', icon: '🧾' },
  { to: '/pricing', label: 'Preços', icon: '💰', primaryMobile: true },
  { to: '/quotes', label: 'Orçamentos', icon: '📄', primaryMobile: true },
  { to: '/customers', label: 'Clientes', icon: '👤' },
  { to: '/professionals', label: 'Profissionais', icon: '🧑‍🔧' },
  { to: '/labor', label: 'Mão de obra', icon: '⏱️' },
  { to: '/products', label: 'Produtos', icon: '📦' },
  { to: '/suppliers', label: 'Fornecedores', icon: '🚚' },
  { to: '/inventory', label: 'Estoque', icon: '🏷️', primaryMobile: true },
  { to: '/importacao-xml', label: 'Importar XML', icon: '📥' },
  { to: '/costs/fixed', label: 'Custos fixos', icon: '🏠' },
  { to: '/costs/variable', label: 'Custos variáveis', icon: '🔁' },
  { to: '/cashflow', label: 'Fluxo de caixa', icon: '💵' },
  { to: '/goals', label: 'Minha meta', icon: '🎯' },
  { to: '/simulador', label: 'Simulador', icon: '🧮' },
  { to: '/settings', label: 'Configurações', icon: '⚙️' },
  { to: '/conta', label: 'Minha conta', icon: '👤' },
  { to: '/ajuda', label: 'Ajuda', icon: '❓' },
];

export const MOBILE_PRIMARY = NAV_ITEMS.filter((i) => i.primaryMobile);
