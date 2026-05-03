create table if not exists public.metaverse_snapshots (
  id text primary key,
  title text not null,
  summary jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists metaverse_snapshots_created_at_idx
  on public.metaverse_snapshots (created_at desc);

create table if not exists public.metaverse_action_audits (
  id text primary key,
  type text not null default 'safe_action',
  target text,
  endpoint text,
  payload jsonb,
  source text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint metaverse_action_audits_status_check
    check (status in ('draft', 'reviewing', 'approved', 'rejected', 'previewed'))
);

create index if not exists metaverse_action_audits_created_at_idx
  on public.metaverse_action_audits (created_at desc);

create index if not exists metaverse_action_audits_status_idx
  on public.metaverse_action_audits (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_metaverse_snapshots_updated_at
  on public.metaverse_snapshots;

create trigger set_metaverse_snapshots_updated_at
before update on public.metaverse_snapshots
for each row
execute function public.set_updated_at();

drop trigger if exists set_metaverse_action_audits_updated_at
  on public.metaverse_action_audits;

create trigger set_metaverse_action_audits_updated_at
before update on public.metaverse_action_audits
for each row
execute function public.set_updated_at();

alter table public.metaverse_snapshots enable row level security;
alter table public.metaverse_action_audits enable row level security;

drop policy if exists "service role can manage metaverse snapshots"
  on public.metaverse_snapshots;

create policy "service role can manage metaverse snapshots"
on public.metaverse_snapshots
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role can manage metaverse action audits"
  on public.metaverse_action_audits;

create policy "service role can manage metaverse action audits"
on public.metaverse_action_audits
for all
to service_role
using (true)
with check (true);

notify pgrst, 'reload schema';
