-- Budget app schema. Paste into the Supabase SQL editor and run.
--
-- Rows are owned by the signed-in Supabase auth user, and row level security
-- keeps every account to its own budget.

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  section text not null check (section in ('income', 'fixed', 'flexible', 'saving')),
  name text not null default '',
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_items_owner_idx
  on public.budget_items (owner_id, section, position);

alter table public.budget_items enable row level security;

drop policy if exists "Owners read their budget items" on public.budget_items;
create policy "Owners read their budget items"
  on public.budget_items for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners insert their budget items" on public.budget_items;
create policy "Owners insert their budget items"
  on public.budget_items for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners update their budget items" on public.budget_items;
create policy "Owners update their budget items"
  on public.budget_items for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners delete their budget items" on public.budget_items;
create policy "Owners delete their budget items"
  on public.budget_items for delete to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists budget_items_set_updated_at on public.budget_items;
create trigger budget_items_set_updated_at
  before update on public.budget_items
  for each row execute function public.set_updated_at();
