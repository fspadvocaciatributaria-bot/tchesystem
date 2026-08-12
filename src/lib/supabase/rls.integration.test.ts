import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * Teste de integração de segurança (RLS). Confirma que:
 *  - um cliente ANÔNIMO NÃO enxerga nenhuma linha das tabelas escopadas por organização;
 *  - o catálogo global de profissões é legível.
 *
 * Requer rede + credenciais. Rode com:
 *   FSP_TEST_SUPABASE_URL=... FSP_TEST_SUPABASE_ANON_KEY=... npm test
 * Sem essas variáveis, o teste é ignorado (mantém a suíte padrão offline).
 *
 * Cobre o critério do prompt (§36): acesso não autenticado deve ser negado pelo RLS.
 */
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const url = env.FSP_TEST_SUPABASE_URL;
const anon = env.FSP_TEST_SUPABASE_ANON_KEY;
const enabled = Boolean(url && anon);

describe.skipIf(!enabled)('RLS — isolamento (integração)', () => {
  // Só cria o cliente quando habilitado (evita erro de coleta sem credenciais).
  const client = createClient(url ?? 'http://localhost', anon ?? 'anon');

  it('anônimo não lê organizations (RLS nega)', async () => {
    const { data, error } = await client.from('organizations').select('id');
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it('anônimo não lê customers de nenhuma org', async () => {
    const { data } = await client.from('customers').select('id');
    expect(data ?? []).toHaveLength(0);
  });

  it('professions (catálogo global) é legível', async () => {
    const { data, error } = await client.from('professions').select('slug');
    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });
});
