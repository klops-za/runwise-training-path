-- Cap all warmup and cooldown durations at 10 minutes in workout_structures
-- Update any existing structures that have warmup > 10 or cooldown > 10

UPDATE public.workout_structures
SET structure_json = jsonb_set(
  structure_json,
  '{warmup,duration}',
  '10'::jsonb
)
WHERE structure_json->'warmup'->>'duration' IS NOT NULL
  AND (structure_json->'warmup'->>'duration')::numeric > 10;

UPDATE public.workout_structures
SET structure_json = jsonb_set(
  structure_json,
  '{cooldown,duration}',
  '10'::jsonb
)
WHERE structure_json->'cooldown'->>'duration' IS NOT NULL
  AND (structure_json->'cooldown'->>'duration')::numeric > 10;