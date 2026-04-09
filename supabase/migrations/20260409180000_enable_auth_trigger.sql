-- Explicitly wire the already-existing Siftly profile handler 
-- safely onto the locked Supabase Auth schema.
-- This guarantees every GitHub signup correctly replicates into public.profiles
-- bypassing all Row-Level Security blocks natively.

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
