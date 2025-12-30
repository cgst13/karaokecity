
-- Create the queue table
create table public.karaoke_queue (
  id uuid default gen_random_uuid() primary key,
  video_id text not null,
  video_data jsonb not null,
  status text check (status in ('waiting', 'playing', 'finished')) default 'waiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table public.karaoke_queue;

-- Create a policy to allow public access (for simplicity in this demo)
-- In production, you would want proper RLS policies
alter table public.karaoke_queue enable row level security;

create policy "Allow public access"
  on public.karaoke_queue
  for all
  using (true)
  with check (true);
