-- Add active_device_id to playlists table to track which device is controlling playback
alter table public.playlists 
add column active_device_id text;

-- Optional: Add is_playing to track pause/play state if needed later (not strictly required for "exclusive device" logic but good for sync)
alter table public.playlists 
add column is_playing boolean default false;
