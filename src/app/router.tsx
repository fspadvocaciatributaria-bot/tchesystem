import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginPage, SignupPage, RecoverPage } from '@/features/auth/AuthPages';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PagePlaceholder } from '@/components/PagePlaceholder';

function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) {
    return <div className="min-h-full grid place-items-center text-muted">Carregando…</div>;
  }
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const ph = (title: string, phase: string, description?: string) => (
  <PagePlaceholder title={title} phase={phase} description={description} />
);

export const router = createBrowserRouter([
  { path: '/login', element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute> },
  { path: '/signup', element: <PublicOnlyRoute><SignupPage /></PublicOnlyRoute> },
  { path: '/recover', element: <PublicOnlyRoute><RecoverPage /></PublicOnlyRoute> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/services', element: ph('Serviços', 'FASE 2') },
          { path: '/pricing', element: ph('Formação de Preço', 'FASE 3', 'Módulo central de precificação.') },
          { path: '/quotes', element: ph('Orçamentos', 'FASE 4') },
          { path: '/customers', element: ph('Clientes', 'FASE 2') },
          { path: '/professionals', element: ph('Profissionais', 'FASE 2') },
          { path: '/labor', element: ph('Mão de obra', 'FASE 2') },
          { path: '/products', element: ph('Produtos', 'FASE 2') },
          { path: '/inventory', element: ph('Estoque', 'FASE 2') },
          { path: '/costs/fixed', element: ph('Custos fixos', 'FASE 2') },
          { path: '/costs/variable', element: ph('Custos variáveis', 'FASE 2') },
          { path: '/cashflow', element: ph('Fluxo de caixa', 'FASE 5') },
          { path: '/goals', element: ph('Minha meta', 'FASE 3') },
          { path: '/settings', element: ph('Configurações', 'FASE 2') },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
