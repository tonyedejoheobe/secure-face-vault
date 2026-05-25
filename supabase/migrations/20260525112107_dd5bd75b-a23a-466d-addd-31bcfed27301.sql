
create extension if not exists vector;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  face_embedding vector(128) not null,
  passcode_hash text not null,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_size bigint not null,
  file_path text not null,
  created_at timestamptz not null default now()
);

create index files_user_id_idx on public.files(user_id);

alter table public.users enable row level security;
alter table public.files enable row level security;

-- All client access denied; sensitive ops are mediated by edge functions using the service role
revoke all on public.users from anon, authenticated;
revoke all on public.files from anon, authenticated;

create or replace function public.match_user(
  query_embedding vector(128),
  match_threshold float
)
returns table (user_id uuid, passcode_hash text, distance float)
language sql
stable
security definer
set search_path = public
as $$
  select id as user_id, passcode_hash, (face_embedding <-> query_embedding) as distance
  from public.users
  where (face_embedding <-> query_embedding) < match_threshold
  order by face_embedding <-> query_embedding asc
  limit 1;
$$;

revoke all on function public.match_user(vector, float) from anon, authenticated;

-- Private storage bucket for user files
insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do nothing;
