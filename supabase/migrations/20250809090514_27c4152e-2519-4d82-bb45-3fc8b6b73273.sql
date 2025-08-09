-- Enforce active Premium subscription before generating plans
-- Update all generate_training_plan variants to check subscriptions

-- Variant 1: with full parameter set including plan name/description
CREATE OR REPLACE FUNCTION public.generate_training_plan(
  runner_uuid uuid,
  race_type_param race_type,
  experience_level_param experience_level_type,
  fitness_score_param numeric,
  training_days_param integer,
  race_date_param date,
  training_start_date_param date,
  plan_name_param text DEFAULT NULL,
  plan_description_param text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_id UUID;
  phase_duration_record RECORD;
  available_weeks INTEGER;
  base_weeks INTEGER;
  build_weeks INTEGER;
  peak_weeks INTEGER;
  taper_weeks INTEGER := 1;
  current_phase phase_type;
  week_num INTEGER;
  week_in_phase INTEGER;
  phase_weeks INTEGER;
  workout_date DATE;
  template_record RECORD;
  structure_record RECORD;
  workout_type_assigned workout_type;
  base_pace_per_mile NUMERIC;
  workout_pace TEXT;
  workout_intensity intensity_type;
  workout_description TEXT;
  workout_duration INTEGER;
  workout_distance NUMERIC;
  structure_id_assigned UUID := NULL;
  structure_json_data JSONB := NULL;
  workout_is_hard BOOLEAN := FALSE;
  hard_sessions_this_week INTEGER := 0;
  max_hard_sessions INTEGER := 2;
  week_start_date DATE;
  day_of_week_number INTEGER;
  default_plan_name TEXT;
  progressive_distance NUMERIC;
  progression_ratio NUMERIC;
  warmup_distance NUMERIC := 0;
  cooldown_distance NUMERIC := 0;
  main_distance NUMERIC;
BEGIN
  -- Enforce active Premium subscription
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.runner_id = runner_uuid
      AND s.is_active = true
      AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
      AND s.tier = 'Premium'::tier_type
  ) THEN
    RAISE EXCEPTION 'Active Premium subscription required to create training plans';
  END IF;

  -- Validate inputs
  IF training_days_param < 3 OR training_days_param > 6 THEN
    RAISE EXCEPTION 'Training days must be between 3 and 6';
  END IF;
  IF race_date_param <= training_start_date_param THEN
    RAISE EXCEPTION 'Race date must be after training start date';
  END IF;

  -- Archive existing active plans for this runner
  UPDATE public.training_plans 
  SET status = 'archived', updated_at = now()
  WHERE runner_id = runner_uuid AND status = 'active';

  -- Set default plan name if not provided
  default_plan_name := COALESCE(
    plan_name_param, 
    CONCAT(race_type_param::text, ' Training Plan - ', to_char(training_start_date_param, 'Mon YYYY'))
  );

  -- Get phase durations for the race type and experience level
  SELECT * INTO phase_duration_record
  FROM public.phase_durations
  WHERE race_type = race_type_param 
    AND experience_level = experience_level_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No phase duration found for race type % and experience level %', race_type_param, experience_level_param;
  END IF;

  -- Calculate available weeks
  available_weeks := CEIL((race_date_param - training_start_date_param)::numeric / 7);
  IF available_weeks < phase_duration_record.total_weeks THEN
    DECLARE
      compression_ratio NUMERIC;
      non_taper_weeks INTEGER;
    BEGIN
      non_taper_weeks := available_weeks - 1;
      compression_ratio := non_taper_weeks::numeric / (phase_duration_record.total_weeks - 1);
      base_weeks := GREATEST(1, ROUND(phase_duration_record.base_weeks * compression_ratio));
      build_weeks := GREATEST(1, ROUND(phase_duration_record.build_weeks * compression_ratio));
      peak_weeks := GREATEST(1, non_taper_weeks - base_weeks - build_weeks);
    END;
  ELSE
    base_weeks := phase_duration_record.base_weeks;
    build_weeks := phase_duration_record.build_weeks;
    peak_weeks := phase_duration_record.peak_weeks;
  END IF;

  -- Calculate base pace from fitness score
  base_pace_per_mile := GREATEST(300, 600 - (fitness_score_param * 3));

  -- Create the training plan with new fields
  INSERT INTO public.training_plans (
    runner_id, race_type, start_date, current_week, tier, name, description, status, plan_data
  ) VALUES (
    runner_uuid,
    race_type_param,
    training_start_date_param,
    1,
    'Free'::tier_type,
    default_plan_name,
    plan_description_param,
    'active',
    jsonb_build_object(
      'total_weeks', base_weeks + build_weeks + peak_weeks + taper_weeks,
      'base_weeks', base_weeks,
      'build_weeks', build_weeks,
      'peak_weeks', peak_weeks,
      'taper_weeks', taper_weeks,
      'generated_date', CURRENT_DATE,
      'runner_experience', experience_level_param,
      'training_days', training_days_param,
      'fitness_score', fitness_score_param
    )
  ) RETURNING id INTO plan_id;

  -- Generate workouts for each week (unchanged logic from previous version)
  FOR week_num IN 1..(base_weeks + build_weeks + peak_weeks + taper_weeks) LOOP
    IF week_num <= base_weeks THEN
      current_phase := 'Base';
      week_in_phase := week_num;
      phase_weeks := base_weeks;
    ELSIF week_num <= base_weeks + build_weeks THEN
      current_phase := 'Build';
      week_in_phase := week_num - base_weeks;
      phase_weeks := build_weeks;
    ELSIF week_num <= base_weeks + build_weeks + peak_weeks THEN
      current_phase := 'Peak';
      week_in_phase := week_num - base_weeks - build_weeks;
      phase_weeks := peak_weeks;
    ELSE
      current_phase := 'Taper';
      week_in_phase := week_num - base_weeks - build_weeks - peak_weeks;
      phase_weeks := taper_weeks;
    END IF;

    week_start_date := training_start_date_param + ((week_num - 1) * 7);
    hard_sessions_this_week := 0;

    FOR template_record IN 
      SELECT day_of_week, workout_type, workout_priority
      FROM public.weekly_schedule_templates
      WHERE training_days = training_days_param 
        AND phase = current_phase
      ORDER BY workout_priority ASC
    LOOP
      CASE template_record.day_of_week
        WHEN 'Sun' THEN day_of_week_number := 0;
        WHEN 'Mon' THEN day_of_week_number := 1;
        WHEN 'Tue' THEN day_of_week_number := 2;
        WHEN 'Wed' THEN day_of_week_number := 3;
        WHEN 'Thu' THEN day_of_week_number := 4;
        WHEN 'Fri' THEN day_of_week_number := 5;
        WHEN 'Sat' THEN day_of_week_number := 6;
      END CASE;

      workout_date := week_start_date + (day_of_week_number - EXTRACT(DOW FROM week_start_date))::integer;
      IF workout_date < week_start_date THEN
        workout_date := workout_date + 7;
      END IF;
      IF workout_date >= race_date_param THEN
        CONTINUE;
      END IF;

      workout_type_assigned := template_record.workout_type;

      SELECT is_hard INTO workout_is_hard
      FROM public.workout_intensity_rules
      WHERE workout_type = workout_type_assigned;

      IF workout_is_hard AND hard_sessions_this_week >= max_hard_sessions AND workout_type_assigned != 'Long' THEN
        workout_type_assigned := 'Easy';
        workout_is_hard := FALSE;
      END IF;
      IF workout_is_hard THEN
        hard_sessions_this_week := hard_sessions_this_week + 1;
      END IF;

      SELECT id, structure_json, min_distance, max_distance INTO structure_record
      FROM public.workout_structures
      WHERE workout_type = workout_type_assigned 
        AND experience_level = experience_level_param 
        AND phase = current_phase
        AND race_distance = race_type_param
      ORDER BY created_at DESC
      LIMIT 1;

      IF NOT FOUND THEN
        SELECT id, structure_json, min_distance, max_distance INTO structure_record
        FROM public.workout_structures
        WHERE workout_type = workout_type_assigned 
          AND experience_level = experience_level_param 
          AND phase = current_phase
          AND race_distance IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
      END IF;

      IF FOUND THEN
        structure_id_assigned := structure_record.id;
        structure_json_data := structure_record.structure_json;
        IF workout_type_assigned IN ('Easy', 'Long', 'Tempo') AND structure_record.min_distance IS NOT NULL AND structure_record.max_distance IS NOT NULL AND phase_weeks > 1 THEN
          progression_ratio := (week_in_phase - 1)::numeric / (phase_weeks - 1);
          main_distance := structure_record.min_distance + (progression_ratio * (structure_record.max_distance - structure_record.min_distance));
          main_distance := ROUND(main_distance, 1);
          IF structure_json_data ? 'warmup' AND (structure_json_data->'warmup') ? 'duration' THEN
            warmup_distance := (structure_json_data->'warmup'->>'duration')::numeric * 0.05;
          END IF;
          IF structure_json_data ? 'cooldown' AND (structure_json_data->'cooldown') ? 'duration' THEN
            cooldown_distance := (structure_json_data->'cooldown'->>'duration')::numeric * 0.05;
          END IF;
          structure_json_data := jsonb_set(
            structure_json_data,
            '{main,0,distance}',
            to_jsonb(main_distance)
          );
          progressive_distance := warmup_distance + main_distance + cooldown_distance;
        ELSE
          progressive_distance := COALESCE(
            (structure_json_data->>'min_distance')::NUMERIC,
            3 + (week_num * 0.2)
          );
        END IF;
      ELSE
        structure_id_assigned := NULL;
        structure_json_data := NULL;
        progressive_distance := 3 + (week_num * 0.2);
      END IF;

      CASE workout_type_assigned
        WHEN 'Easy', 'Recovery' THEN workout_intensity := 'Low';
        WHEN 'Tempo', 'Hill' THEN workout_intensity := 'Moderate';
        WHEN 'Interval', 'Long' THEN workout_intensity := 'High';
        ELSE 'Low';
      END CASE;

      CASE workout_type_assigned
        WHEN 'Easy' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile + 60) / 60), ':', LPAD(((base_pace_per_mile + 60) % 60)::text, 2, '0'));
        WHEN 'Recovery' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile + 90) / 60), ':', LPAD(((base_pace_per_mile + 90) % 60)::text, 2, '0'));
        WHEN 'Tempo' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile - 15) / 60), ':', LPAD(((base_pace_per_mile - 15) % 60)::text, 2, '0'));
        WHEN 'Interval' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile - 30) / 60), ':', LPAD(((base_pace_per_mile - 30) % 60)::text, 2, '0'));
        WHEN 'Long' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile + 30) / 60), ':', LPAD(((base_pace_per_mile + 30) % 60)::text, 2, '0'));
        WHEN 'Hill' THEN workout_pace := CONCAT(FLOOR((base_pace_per_mile - 10) / 60), ':', LPAD(((base_pace_per_mile - 10) % 60)::text, 2, '0'));
        WHEN 'Cross-training' THEN workout_pace := NULL;
        ELSE workout_pace := CONCAT(FLOOR(base_pace_per_mile / 60), ':', LPAD((base_pace_per_mile % 60)::text, 2, '0'));
      END CASE;

      IF structure_json_data IS NOT NULL THEN
        workout_description := COALESCE(
          structure_json_data->>'description',
          CASE workout_type_assigned
            WHEN 'Easy' THEN 'Easy run at comfortable conversational pace'
            WHEN 'Recovery' THEN 'Recovery run or walk-run intervals'
            WHEN 'Tempo' THEN 'Tempo run at comfortably hard effort'
            WHEN 'Interval' THEN 'Interval training with rest periods'
            WHEN 'Long' THEN 'Long run for endurance building'
            WHEN 'Hill' THEN 'Hill repeats for strength and power'
            WHEN 'Cross-training' THEN 'Cross-training activity (cycling, swimming, etc.)'
            ELSE 'General training run'
          END
        );
        workout_duration := COALESCE((structure_json_data->>'min_duration')::INTEGER, 30 + (week_num * 2));
        workout_distance := progressive_distance;
      ELSE
        CASE workout_type_assigned
          WHEN 'Easy' THEN 
            workout_description := 'Easy run at comfortable conversational pace';
            workout_duration := 30 + (week_num * 2);
            workout_distance := 3 + (week_num * 0.2);
          WHEN 'Recovery' THEN 
            workout_description := 'Recovery run or walk-run intervals';
            workout_duration := 20;
            workout_distance := 2;
          WHEN 'Tempo' THEN 
            workout_description := 'Tempo run at comfortably hard effort';
            workout_duration := 35 + week_num;
            workout_distance := 4 + (week_num * 0.15);
          WHEN 'Interval' THEN 
            workout_description := 'Interval training with rest periods';
            workout_duration := 40 + week_num;
            workout_distance := 4 + (week_num * 0.1);
          WHEN 'Long' THEN 
            workout_description := 'Long run for endurance building';
            workout_duration := 60 + (week_num * 5);
            workout_distance := 6 + (week_num * 0.5);
          WHEN 'Hill' THEN 
            workout_description := 'Hill repeats for strength and power';
            workout_duration := 35 + week_num;
            workout_distance := 4;
          WHEN 'Cross-training' THEN 
            workout_description := 'Cross-training activity (cycling, swimming, etc.)';
            workout_duration := 45;
            workout_distance := NULL;
          ELSE 
            workout_description := 'General training run';
            workout_duration := 30;
            workout_distance := 3;
        END CASE;
      END IF;

      INSERT INTO public.workouts (
        plan_id,
        date,
        type,
        intensity,
        description,
        duration,
        distance_target,
        pace_target,
        week_number,
        status,
        phase,
        structure_id,
        details_json
      ) VALUES (
        plan_id,
        workout_date,
        workout_type_assigned,
        workout_intensity,
        workout_description,
        workout_duration,
        workout_distance,
        workout_pace,
        week_num,
        CASE 
          WHEN workout_date < CURRENT_DATE THEN 'Completed'::workout_status_type
          ELSE 'Pending'::workout_status_type
        END,
        current_phase,
        structure_id_assigned,
        structure_json_data
      );

    END LOOP;
  END LOOP;
  RETURN plan_id;
END;
$$;

-- Variant 2: mid parameter set
CREATE OR REPLACE FUNCTION public.generate_training_plan(
  runner_uuid uuid,
  race_type_param race_type,
  experience_level_param experience_level_type,
  fitness_score_param numeric,
  training_days_param integer,
  race_date_param date,
  training_start_date_param date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Premium subscription check
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.runner_id = runner_uuid
      AND s.is_active = true
      AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
      AND s.tier = 'Premium'::tier_type
  ) THEN
    RAISE EXCEPTION 'Active Premium subscription required to create training plans';
  END IF;

  -- Delegate to full version with nulls
  RETURN public.generate_training_plan(
    runner_uuid,
    race_type_param,
    experience_level_param,
    fitness_score_param,
    training_days_param,
    race_date_param,
    training_start_date_param,
    NULL,
    NULL
  );
END;
$$;

-- Variant 3: simplest version
CREATE OR REPLACE FUNCTION public.generate_training_plan(
  runner_uuid uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  runner_record RECORD;
BEGIN
  -- Premium subscription check
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.runner_id = runner_uuid
      AND s.is_active = true
      AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
      AND s.tier = 'Premium'::tier_type
  ) THEN
    RAISE EXCEPTION 'Active Premium subscription required to create training plans';
  END IF;

  SELECT * INTO runner_record FROM public.runners WHERE id = runner_uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Runner not found';
  END IF;

  -- Call into mid-variant with values from runner record
  RETURN public.generate_training_plan(
    runner_uuid,
    runner_record.race_goal,
    runner_record.experience_level,
    COALESCE(runner_record.fitness_score, 50),
    COALESCE(runner_record.training_days, 5),
    runner_record.race_date,
    COALESCE(runner_record.training_start_date, CURRENT_DATE)
  );
END;
$$;