-- =============================================================================
-- FSP — Trigger de criação de profile no signup + seed do catálogo de profissões
-- =============================================================================

-- Cria automaticamente a linha em profiles quando um usuário se cadastra (auth.users).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Catálogo global de profissões/nichos (pré-semeado).
insert into professions (slug, name) values
  ('tatuador', 'Tatuador'),
  ('fotografo', 'Fotógrafo'),
  ('barbeiro', 'Barbeiro'),
  ('cabeleireiro', 'Cabeleireiro'),
  ('manicure', 'Manicure'),
  ('mecanico', 'Mecânico'),
  ('eletricista', 'Eletricista'),
  ('marceneiro', 'Marceneiro'),
  ('designer', 'Designer'),
  ('videomaker', 'Videomaker'),
  ('esteticista', 'Esteticista'),
  ('outros', 'Outros')
on conflict (slug) do nothing;
