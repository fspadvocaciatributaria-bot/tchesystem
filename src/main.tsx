import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './index.css';

// App carregou com sucesso: libera o "para-quedas" de recarga (index.html) para futuras falhas.
try {
  sessionStorage.removeItem('tche_reloaded');
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
