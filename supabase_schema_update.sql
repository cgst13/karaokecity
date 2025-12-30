-- Create playlists table
create table public.playlists (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add playlist_id to queue
alter table public.karaoke_queue 
add column playlist_id uuid references public.playlists(id) on delete cascade;

-- Enable RLS for playlists
alter table public.playlists enable row level security;

create policy "Allow public access playlists"
  on public.playlists
  for all
  using (true)
  with check (true);
