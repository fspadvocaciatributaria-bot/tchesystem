import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';

/** Escolhe o layout por largura de tela (docs/SCREENS.md). */
export function AppLayout() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
}
