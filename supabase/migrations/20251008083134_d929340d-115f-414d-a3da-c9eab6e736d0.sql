-- Security fix: Restrict related_articles modifications to service role only
-- This prevents malicious users from manipulating article relationships

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert related articles" ON public.related_articles;
DROP POLICY IF EXISTS "Authenticated users can update related articles" ON public.related_articles;
DROP POLICY IF EXISTS "Authenticated users can delete related articles" ON public.related_articles;

-- Keep the public read access (anyone can view related articles)
-- The existing "Anyone can view related articles" policy remains unchanged

-- Create service role only policies for modifications
CREATE POLICY "Service role can insert related articles"
  ON public.related_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update related articles"
  ON public.related_articles
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete related articles"
  ON public.related_articles
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'service_role');