-- Daily puzzle results — run this in the Supabase SQL editor.
-- Accepts anonymous submissions keyed by a client-generated device id;
-- reads happen only through the aggregate RPC below.

create table if not exists public.daily_results (
  id         uuid primary key default gen_random_uuid(),
  day        date not null,
  device_id  uuid not null,
  user_id    uuid references auth.users (id),
  hops       int  not null check (hops between 1 and 200),
  created_at timestamptz not null default now(),
  unique (day, device_id)
);

create index if not exists daily_results_day_idx on public.daily_results (day);

alter table public.daily_results enable row level security;

drop policy if exists "daily_results_insert" on public.daily_results;
create policy "daily_results_insert"
  on public.daily_results for insert
  to anon, authenticated
  with check (hops between 1 and 200);

-- No select policy on purpose: raw rows are not readable by clients.

create or replace function public.daily_distribution(p_day date)
returns table (hops int, n bigint)
language sql
security definer
set search_path = public
stable
as $$
  select hops, count(*) as n
  from public.daily_results
  where day = p_day
  group by hops
  order by hops;
$$;

grant execute on function public.daily_distribution(date) to anon, authenticated;
