-- Lernfortschritt pro Person, synchronisiert über alle Geräte.
-- Zugriff ausschliesslich auf den eigenen Datensatz (Row Level Security).
-- Gespeichert werden nur Lernstand und E-Mail-Adresse (via Supabase Auth), keine Inhalte.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint progress_size check (pg_column_size(data) < 2000000)
);

alter table public.progress enable row level security;

create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress
  for delete using (auth.uid() = user_id);

revoke all on public.progress from anon;
grant select, insert, update, delete on public.progress to authenticated;
