
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkoutType = Database['public']['Enums']['workout_type'];
type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type PhaseType = Database['public']['Enums']['phase_type'];
type DayOfWeekType = Database['public']['Enums']['day_of_week_type'];
type IntensityType = Database['public']['Enums']['intensity_type'];

interface WeeklyTemplate {
  day_of_week: DayOfWeekType;
  workout_type: WorkoutType;
  workout_priority: number;
}

export const generateTrainingPlanWithTemplates = async (
  runnerId: string,
  raceType: string,
  experienceLevel: ExperienceLevel,
  fitnessScore: number,
  trainingDays: number,
  raceDate: Date,
  trainingStartDate: Date
) => {
  try {
    // Call the existing Supabase function but we'll need to regenerate workouts with proper templates
    const { data: planData, error: planError } = await supabase.rpc('generate_training_plan', {
      runner_uuid: runnerId,
      race_type_param: raceType as any,
      experience_level_param: experienceLevel,
      fitness_score_param: fitnessScore,
      training_days_param: trainingDays,
      race_date_param: raceDate.toISOString().split('T')[0],
      training_start_date_param: trainingStartDate.toISOString().split('T')[0]
    });

    if (planError) {
      console.error('Error generating training plan:', planError);
      throw planError;
    }

    // Now regenerate workouts using proper templates
    if (planData) {
      await regenerateWorkoutsWithTemplates(planData, trainingDays, experienceLevel, trainingStartDate, raceDate);
    }

    return planData;
  } catch (error) {
    console.error('Error in generateTrainingPlanWithTemplates:', error);
    throw error;
  }
};

const regenerateWorkoutsWithTemplates = async (
  planId: string,
  trainingDays: number,
  experienceLevel: ExperienceLevel,
  startDate: Date,
  raceDate: Date
) => {
  try {
    // Get the current training plan to determine phase durations
    const { data: plan, error: planError } = await supabase
      .from('training_plans')
      .select('plan_data')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan data:', planError);
      return;
    }

    const planData = plan.plan_data as any;
    const totalWeeks = planData?.total_weeks || 16;
    const baseWeeks = planData?.base_weeks || 8;
    const buildWeeks = planData?.build_weeks || 4;
    const peakWeeks = planData?.peak_weeks || 3;

    // Delete existing workouts
    await supabase
      .from('workouts')
      .delete()
      .eq('plan_id', planId);

    // Get weekly templates for each phase
    const phases: PhaseType[] = ['Base', 'Build', 'Peak', 'Taper'];
    const templatesByPhase: Record<PhaseType, WeeklyTemplate[]> = {} as any;

    for (const phase of phases) {
      const { data: templates, error: templateError } = await supabase
        .from('weekly_schedule_templates')
        .select('day_of_week, workout_type, workout_priority')
        .eq('training_days', trainingDays)
        .eq('phase', phase)
        .order('workout_priority');

      if (templateError) {
        console.error(`Error fetching templates for ${phase}:`, templateError);
        continue;
      }

      templatesByPhase[phase] = templates || [];
    }

    // Generate workouts for each week
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      // Determine current phase
      let currentPhase: PhaseType;
      if (weekNum <= baseWeeks) {
        currentPhase = 'Base';
      } else if (weekNum <= baseWeeks + buildWeeks) {
        currentPhase = 'Build';
      } else if (weekNum <= baseWeeks + buildWeeks + peakWeeks) {
        currentPhase = 'Peak';
      } else {
        currentPhase = 'Taper';
      }

      const templates = templatesByPhase[currentPhase] || [];
      
      // Generate workouts for each template
      for (const template of templates) {
        const dayOffset = getDayOffset(template.day_of_week);
        const workoutDate = new Date(startDate);
        workoutDate.setDate(startDate.getDate() + ((weekNum - 1) * 7) + dayOffset);

        // Skip if workout date is past race date
        if (workoutDate >= raceDate) {
          continue;
        }

        // Get workout structure
        const { data: structure, error: structureError } = await supabase
          .from('workout_structures')
          .select('*')
          .eq('workout_type', template.workout_type)
          .eq('experience_level', experienceLevel)
          .eq('phase', currentPhase)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (structureError) {
          console.error('Error fetching workout structure:', structureError);
        }

        // Create workout
        const workoutData = {
          plan_id: planId,
          date: workoutDate.toISOString().split('T')[0],
          type: template.workout_type,
          intensity: getWorkoutIntensity(template.workout_type) as IntensityType,
          description: getWorkoutDescription(template.workout_type, structure?.structure_json),
          duration: getWorkoutDuration(template.workout_type, weekNum, structure?.structure_json),
          distance_target: getWorkoutDistance(template.workout_type, weekNum, structure?.structure_json),
          pace_target: getWorkoutPace(template.workout_type),
          week_number: weekNum,
          status: (workoutDate < new Date() ? 'Completed' : 'Pending') as Database['public']['Enums']['workout_status_type'],
          phase: currentPhase,
          structure_id: structure?.id || null,
          details_json: structure?.structure_json || null
        };

        const { error: insertError } = await supabase
          .from('workouts')
          .insert(workoutData);

        if (insertError) {
          console.error('Error inserting workout:', insertError);
        }
      }
    }
  } catch (error) {
    console.error('Error regenerating workouts:', error);
  }
};

const getDayOffset = (dayOfWeek: DayOfWeekType): number => {
  const dayMap: Record<DayOfWeekType, number> = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  };
  return dayMap[dayOfWeek] || 0;
};

const getWorkoutIntensity = (workoutType: WorkoutType): IntensityType => {
  const intensityMap: Record<WorkoutType, IntensityType> = {
    'Easy': 'Low',
    'Recovery': 'Low',
    'Long': 'High',
    'Tempo': 'Moderate',
    'Interval': 'High',
    'Hill': 'Moderate',
    'Cross-training': 'Low'
  };
  return intensityMap[workoutType] || 'Low';
};

const getWorkoutDescription = (workoutType: WorkoutType, structureJson?: any): string => {
  if (structureJson?.description) {
    return structureJson.description;
  }

  const descriptionMap: Record<WorkoutType, string> = {
    'Easy': 'Easy run at comfortable conversational pace',
    'Recovery': 'Recovery run or walk-run intervals',
    'Long': 'Long run for endurance building',
    'Tempo': 'Tempo run at comfortably hard effort',
    'Interval': 'Interval training with rest periods',
    'Hill': 'Hill repeats for strength and power',
    'Cross-training': 'Cross-training activity (cycling, swimming, etc.)'
  };
  return descriptionMap[workoutType] || 'General training run';
};

const getWorkoutDuration = (workoutType: WorkoutType, weekNum: number, structureJson?: any): number => {
  if (structureJson?.min_duration) {
    return structureJson.min_duration;
  }

  const baseDuration: Record<WorkoutType, number> = {
    'Easy': 30,
    'Recovery': 20,
    'Long': 60,
    'Tempo': 35,
    'Interval': 40,
    'Hill': 35,
    'Cross-training': 45
  };

  const base = baseDuration[workoutType] || 30;
  const progression = workoutType === 'Long' ? weekNum * 5 : weekNum * 2;
  return base + progression;
};

const getWorkoutDistance = (workoutType: WorkoutType, weekNum: number, structureJson?: any): number => {
  if (structureJson?.min_distance) {
    return structureJson.min_distance;
  }

  const baseDistance: Record<WorkoutType, number> = {
    'Easy': 3,
    'Recovery': 2,
    'Long': 6,
    'Tempo': 4,
    'Interval': 4,
    'Hill': 4,
    'Cross-training': 0
  };

  const base = baseDistance[workoutType] || 3;
  const progression = workoutType === 'Long' ? weekNum * 0.5 : weekNum * 0.2;
  return workoutType === 'Cross-training' ? 0 : base + progression;
};

const getWorkoutPace = (workoutType: WorkoutType): string | null => {
  const paceMap: Record<WorkoutType, string | null> = {
    'Easy': '7:30',
    'Recovery': '8:00',
    'Long': '7:45',
    'Tempo': '7:00',
    'Interval': '6:30',
    'Hill': '6:45',
    'Cross-training': null
  };
  return paceMap[workoutType];
};
