create table if not exists public.metaverse_agent_generations (
  id bigserial primary key,
  lane text not null,
  prompt text not null,
  draft text not null,
  author_name text,
  author_race text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint metaverse_agent_generations_status_check
    check (status in ('draft', 'reviewing', 'approved', 'rejected'))
);

create index if not exists metaverse_agent_generations_created_at_idx
  on public.metaverse_agent_generations (created_at desc);

create index if not exists metaverse_agent_generations_status_idx
  on public.metaverse_agent_generations (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_metaverse_agent_generations_updated_at
  on public.metaverse_agent_generations;

create trigger set_metaverse_agent_generations_updated_at
before update on public.metaverse_agent_generations
for each row
execute function public.set_updated_at();

alter table public.metaverse_agent_generations enable row level security;

drop policy if exists "service role can manage metaverse agent generations"
  on public.metaverse_agent_generations;

create policy "service role can manage metaverse agent generations"
on public.metaverse_agent_generations
for all
to service_role
using (true)
with check (true);

notify pgrst, 'reload schema';
