create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  function_name text not null,
  created_at    timestamptz not null default now(),
  form_inputs   jsonb not null,
  test_cases    jsonb not null
);

create index if not exists sessions_user_id_idx
  on public.sessions using btree (user_id);

create index if not exists sessions_function_name_idx
  on public.sessions using btree (function_name);

create index if not exists sessions_created_at_idx
  on public.sessions using btree (created_at desc);
