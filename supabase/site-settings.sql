-- Travel Story: shared settings table
-- Run this once in Supabase SQL Editor.
create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.touch_site_settings_updated_at();

alter table public.site_settings enable row level security;

-- The Next.js server route uses SUPABASE_SERVICE_ROLE_KEY, so no public
-- insert/update policy is needed. The table stays inaccessible directly
-- through the anonymous browser key.
