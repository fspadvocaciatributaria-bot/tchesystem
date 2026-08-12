import { supabase } from '@/lib/supabase/client';

/** URL pública da logo a partir do caminho salvo em organizations.logo_path. */
export function getLogoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data.publicUrl ?? null;
}

const ALLOWED = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Faz upload da logo para logos/{orgId}/... e retorna o caminho salvo. */
export async function uploadLogo(orgId: string, file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Formato inválido. Use PNG, JPG, SVG ou WEBP.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Arquivo muito grande (máx. 2 MB).');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${orgId}/logo_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('logos').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}
