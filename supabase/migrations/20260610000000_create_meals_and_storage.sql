-- One row per captured meal, owned by the authenticated user.
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  calories integer not null default 0,
  photo_path text,
  mood text,
  captured_at timestamptz not null default now(),
  reminder_at timestamptz,
  mood_logged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists meals_user_captured_idx on public.meals (user_id, captured_at desc);

alter table public.meals enable row level security;

create policy "meals_select_own" on public.meals
  for select using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals
  for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals
  for delete using (auth.uid() = user_id);

-- Private bucket for meal photos.
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

-- Storage RLS: users manage only photos under their own uid/ folder.
create policy "meal_photos_select_own" on storage.objects
  for select using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "meal_photos_insert_own" on storage.objects
  for insert with check (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "meal_photos_delete_own" on storage.objects
  for delete using (bucket_id = 'meal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
