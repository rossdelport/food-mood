-- Per-call log used by the analyze-meal function to rate-limit each user.
-- Only the service role (edge function) reads/writes it; RLS denies clients.
create table if not exists public.analyze_log (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists analyze_log_user_time on public.analyze_log (user_id, created_at desc);

alter table public.analyze_log enable row level security;
