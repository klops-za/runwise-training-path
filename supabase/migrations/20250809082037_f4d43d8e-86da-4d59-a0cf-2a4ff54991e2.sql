-- Enable RLS on leads (safety)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on leads to avoid duplicates
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'leads'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.leads', pol.policyname);
  END LOOP;
END $$;

-- Allow inserts from anon and authenticated users (lead capture)
CREATE POLICY "Leads - allow inserts for anyone"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Restrict read/update/delete to service role only (operational access)
CREATE POLICY "Leads - service role can select"
  ON public.leads
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Leads - service role can update"
  ON public.leads
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Leads - service role can delete"
  ON public.leads
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Ensure the update function has proper search_path
CREATE OR REPLACE FUNCTION public.update_leads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
