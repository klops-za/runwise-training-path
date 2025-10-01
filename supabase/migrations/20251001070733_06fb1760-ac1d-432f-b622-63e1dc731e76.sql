-- Verify RLS is enabled on runners table (it should already be)
ALTER TABLE public.runners ENABLE ROW LEVEL SECURITY;

-- Add database documentation marking sensitive PII fields
COMMENT ON TABLE public.runners IS 'CONTAINS SENSITIVE PII: This table stores personal runner profiles with highly sensitive data. RLS policies enforce strict access control - users can only access their own data. Never query this table without user authentication and ID filtering.';

COMMENT ON COLUMN public.runners.email IS 'SENSITIVE PII: Email address - must never be exposed publicly';
COMMENT ON COLUMN public.runners.first_name IS 'SENSITIVE PII: Personal name - must never be exposed publicly';
COMMENT ON COLUMN public.runners.last_name IS 'SENSITIVE PII: Personal name - must never be exposed publicly';
COMMENT ON COLUMN public.runners.age IS 'SENSITIVE PII: Age - must never be exposed publicly';
COMMENT ON COLUMN public.runners.gender IS 'SENSITIVE PII: Gender - must never be exposed publicly';
COMMENT ON COLUMN public.runners.height_cm IS 'SENSITIVE PII: Physical measurement - must never be exposed publicly';
COMMENT ON COLUMN public.runners.weight_kg IS 'SENSITIVE PII: Physical measurement - must never be exposed publicly';
COMMENT ON COLUMN public.runners.injury_history IS 'SENSITIVE PII: Medical history - must never be exposed publicly';

-- Add an explicit deny policy for anonymous users as an additional safeguard
-- This provides defense-in-depth even though the existing policies already restrict access
CREATE POLICY "Deny all anonymous access to runners"
ON public.runners
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Verify the existing policies are properly configured
-- The policies already exist and are correct, this just documents them:
-- 1. "Users can view their own profile" - SELECT with (auth.uid() = id)
-- 2. "Users can insert their own profile" - INSERT with (auth.uid() = id)
-- 3. "Users can update their own profile" - UPDATE with (auth.uid() = id)
-- 4. "Users can delete their own profile" - DELETE with (auth.uid() = id)

-- Add a check constraint to ensure email is always provided (data integrity)
-- This prevents accidentally creating profiles without email
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'runners_email_not_empty'
  ) THEN
    ALTER TABLE public.runners 
    ADD CONSTRAINT runners_email_not_empty 
    CHECK (email IS NOT NULL AND email != '');
  END IF;
END $$;