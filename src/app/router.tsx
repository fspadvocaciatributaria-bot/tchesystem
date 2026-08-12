import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrg } from '@/features/organization/OrgProvider';
import { LoginPage, SignupPage, RecoverPage } from '@/features/auth/AuthPages';
import { OnboardingPage } from '@/features/organization/OnboardingPage';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProfessionalsPage } from '@/features/professionals/ProfessionalsPage';
import { LaborTypesPage } from '@/features/labor/LaborTypesPage';
import { SuppliersPage } from '@/features/suppliers/SuppliersPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { ServicesPage } from '@/features/services/ServicesPage';
import { FixedCostsPage, VariableCostsPage } from '@/features/costs/CostsPages';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { PagePlaceholder } from '@/components/PagePlaceholder';

function Loading() {
  return <div className="min-h-full grid place-items-center text-muted">Carregando…</div>;
}

function ProtectedRoute() {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Exige organização; se não houver, manda para o onboarding.
function OrgGate() {
  const { organization, loading } = useOrg();
  if (loading) return <Loading />;
  if (!organization) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

function OnboardingGate() {
  const { organization, loading } = useOrg();
  if (loading) return <Loading />;
  if (organization) return <Navigate to="/" replace />;
  return <OnboardingPage />;
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
      { path: '/onboarding', element: <OnboardingGate /> },
      {
        element: <OrgGate />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <DashboardPage /> },
              { path: '/services', element: <ServicesPage /> },
              { path: '/pricing', element: ph('Formação de Preço', 'FASE 3', 'Módulo central de precificação.') },
              { path: '/quotes', element: ph('Orçamentos', 'FASE 4') },
              { path: '/customers', element: <CustomersPage /> },
              { path: '/professionals', element: <ProfessionalsPage /> },
              { path: '/labor', element: <LaborTypesPage /> },
              { path: '/products', element: <ProductsPage /> },
              { path: '/suppliers', element: <SuppliersPage /> },
              { path: '/inventory', element: ph('Estoque', 'FASE 2', 'Entradas, saídas e ajustes (em construção).') },
              { path: '/costs/fixed', element: <FixedCostsPage /> },
              { path: '/costs/variable', element: <VariableCostsPage /> },
              { path: '/cashflow', element: ph('Fluxo de caixa', 'FASE 5') },
              { path: '/goals', element: ph('Minha meta', 'FASE 3') },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
