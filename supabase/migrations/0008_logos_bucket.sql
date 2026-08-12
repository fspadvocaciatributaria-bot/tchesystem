-- =============================================================================
-- FSP — Bucket de logos (Supabase Storage) + políticas
-- Caminho: logos/{organization_id}/arquivo.ext. Leitura pública; escrita por org.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');

drop policy if exists "logos_write" on storage.objects;
create policy "logos_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and auth_can_write((storage.foldername(name))[1]::uuid));

drop policy if exists "logos_update" on storage.objects;
create policy "logos_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and auth_can_write((storage.foldername(name))[1]::uuid));

drop policy if exists "logos_delete" on storage.objects;
create policy "logos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos' and auth_can_write((storage.foldername(name))[1]::uuid));
