-- checkins table
create table public.checkins (
  id bigint generated always as identity primary key,
  space_id uuid not null references auth.users(id),
  age_group text not null check (age_group in ('adult', 'teen', 'child')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.checkins enable row level security;

create policy "Users can insert own checkins"
  on public.checkins for insert
  to authenticated
  with check ((select auth.uid()) = space_id);

create policy "Users can read own checkins"
  on public.checkins for select
  to authenticated
  using ((select auth.uid()) = space_id);

create policy "Users can delete own checkins"
  on public.checkins for delete
  to authenticated
  using ((select auth.uid()) = space_id);

-- Indexes
create index idx_checkins_space_created
  on public.checkins (space_id, created_at);

create index idx_checkins_space_age_created
  on public.checkins (space_id, age_group, created_at);

-- Aggregation function
create or replace function public.get_checkin_stats(
  p_granularity text,
  p_age_group text,
  p_range_start timestamptz default null,
  p_range_end timestamptz default null
)
returns table (period timestamptz, count bigint)
language sql
security invoker
as $$
  select
    date_trunc(
      p_granularity,
      created_at at time zone 'America/New_York'
    ) as period,
    count(*)::bigint as count
  from public.checkins
  where space_id = (select auth.uid())
    and (p_age_group = 'all' or age_group = p_age_group)
    and (p_range_start is null or created_at >= p_range_start)
    and (p_range_end is null or created_at < p_range_end)
  group by period
  order by period
$$;
