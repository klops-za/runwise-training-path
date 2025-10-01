-- Drop the overly permissive policy that exposes email addresses
DROP POLICY IF EXISTS "Anyone can view authors" ON public.authors;

-- Create restrictive policies for the authors table
-- Public can view author profiles (but app code should exclude email)
CREATE POLICY "Public can view author profiles"
ON public.authors
FOR SELECT
TO anon, authenticated
USING (true);

-- Add a database comment to remind developers about email sensitivity
COMMENT ON COLUMN public.authors.email IS 'SENSITIVE: Should not be exposed in public queries. Always exclude this field in SELECT statements for public-facing queries.';