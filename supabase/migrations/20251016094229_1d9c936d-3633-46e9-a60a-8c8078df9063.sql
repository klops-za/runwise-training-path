-- Update RLS policies for leads table
-- Force all lead creation through rate-limited edge function

-- Drop existing public insert policy
DROP POLICY IF EXISTS "Leads - allow inserts for anyone" ON public.leads;

-- Create new policy that only allows service role (edge function) to insert
CREATE POLICY "Leads - service role can insert"
ON public.leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- Keep existing service role policies for other operations
-- (Already exist: select, update, delete for service_role)