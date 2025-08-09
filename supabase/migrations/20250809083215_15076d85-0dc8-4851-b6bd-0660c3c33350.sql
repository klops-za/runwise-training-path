-- 1) Add BEFORE UPDATE trigger on public.leads to call update_leads_updated_at()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_leads_updated_at'
      AND n.nspname = 'public'
      AND c.relname = 'leads'
  ) THEN
    CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leads_updated_at();
  END IF;
END $$;

-- 2) Drop incorrect RLS policies comparing email to auth.uid()::text
-- runners
DROP POLICY IF EXISTS "Users can insert their own runner profile" ON public.runners;
DROP POLICY IF EXISTS "Users can update their own runner profile" ON public.runners;
DROP POLICY IF EXISTS "Users can view their own runner profile" ON public.runners;

-- training_plans (email-based duplicate)
DROP POLICY IF EXISTS "Users can insert their own training plans" ON public.training_plans;

-- workouts (email-based duplicates)
DROP POLICY IF EXISTS "Users can insert their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;

-- subscriptions (all three were email-based)
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;

-- 3) Add correct RLS policies for subscriptions (runner_id = auth.uid())
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Clean up any previous versions of these policies to avoid duplicates
DROP POLICY IF EXISTS "Subscriptions - users can select own" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions - users can insert own" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions - users can update own" ON public.subscriptions;

CREATE POLICY "Subscriptions - users can select own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (runner_id = auth.uid());

CREATE POLICY "Subscriptions - users can insert own"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (runner_id = auth.uid());

CREATE POLICY "Subscriptions - users can update own"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (runner_id = auth.uid())
  WITH CHECK (runner_id = auth.uid());

-- 4) Enable RLS and create policies for reference tables
-- phase_durations
ALTER TABLE public.phase_durations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Phase durations - authenticated can select" ON public.phase_durations;
DROP POLICY IF EXISTS "Phase durations - service role can insert" ON public.phase_durations;
DROP POLICY IF EXISTS "Phase durations - service role can update" ON public.phase_durations;
DROP POLICY IF EXISTS "Phase durations - service role can delete" ON public.phase_durations;

CREATE POLICY "Phase durations - authenticated can select"
  ON public.phase_durations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Phase durations - service role can insert"
  ON public.phase_durations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Phase durations - service role can update"
  ON public.phase_durations
  FOR UPDATE
  TO anon, authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Phase durations - service role can delete"
  ON public.phase_durations
  FOR DELETE
  TO anon, authenticated
  USING (auth.role() = 'service_role');

-- workout_structures
ALTER TABLE public.workout_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workout structures - authenticated can select" ON public.workout_structures;
DROP POLICY IF EXISTS "Workout structures - service role can insert" ON public.workout_structures;
DROP POLICY IF EXISTS "Workout structures - service role can update" ON public.workout_structures;
DROP POLICY IF EXISTS "Workout structures - service role can delete" ON public.workout_structures;

CREATE POLICY "Workout structures - authenticated can select"
  ON public.workout_structures
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Workout structures - service role can insert"
  ON public.workout_structures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Workout structures - service role can update"
  ON public.workout_structures
  FOR UPDATE
  TO anon, authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Workout structures - service role can delete"
  ON public.workout_structures
  FOR DELETE
  TO anon, authenticated
  USING (auth.role() = 'service_role');

-- weekly_schedule_templates
ALTER TABLE public.weekly_schedule_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Weekly templates - authenticated can select" ON public.weekly_schedule_templates;
DROP POLICY IF EXISTS "Weekly templates - service role can insert" ON public.weekly_schedule_templates;
DROP POLICY IF EXISTS "Weekly templates - service role can update" ON public.weekly_schedule_templates;
DROP POLICY IF EXISTS "Weekly templates - service role can delete" ON public.weekly_schedule_templates;

CREATE POLICY "Weekly templates - authenticated can select"
  ON public.weekly_schedule_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Weekly templates - service role can insert"
  ON public.weekly_schedule_templates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Weekly templates - service role can update"
  ON public.weekly_schedule_templates
  FOR UPDATE
  TO anon, authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Weekly templates - service role can delete"
  ON public.weekly_schedule_templates
  FOR DELETE
  TO anon, authenticated
  USING (auth.role() = 'service_role');

-- workout_intensity_rules
ALTER TABLE public.workout_intensity_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Intensity rules - authenticated can select" ON public.workout_intensity_rules;
DROP POLICY IF EXISTS "Intensity rules - service role can insert" ON public.workout_intensity_rules;
DROP POLICY IF EXISTS "Intensity rules - service role can update" ON public.workout_intensity_rules;
DROP POLICY IF EXISTS "Intensity rules - service role can delete" ON public.workout_intensity_rules;

CREATE POLICY "Intensity rules - authenticated can select"
  ON public.workout_intensity_rules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Intensity rules - service role can insert"
  ON public.workout_intensity_rules
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Intensity rules - service role can update"
  ON public.workout_intensity_rules
  FOR UPDATE
  TO anon, authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Intensity rules - service role can delete"
  ON public.workout_intensity_rules
  FOR DELETE
  TO anon, authenticated
  USING (auth.role() = 'service_role');