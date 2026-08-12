import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { OrgProvider } from '@/features/organization/OrgProvider';
import { ThemeProvider } from '@/features/theme/ThemeProvider';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <OrgProvider>
            <RouterProvider router={router} />
          </OrgProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
