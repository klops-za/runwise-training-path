-- Harden leads RLS: remove public SELECT policy from leads
-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop commonly used permissive read policies if they exist
DROP POLICY IF EXISTS "Leads are viewable by everyone" ON public.leads;
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
