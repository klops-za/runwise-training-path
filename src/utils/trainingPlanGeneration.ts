
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type RaceType = Database['public']['Enums']['race_type'];

// Map profile race types to database race distance values
const mapRaceTypeToDistance = (raceType: RaceType): string => {
  switch (raceType) {
    case '5K':
      return '5K';
    case '10K':
      return '10K';
    case 'Half Marathon':
      return 'Half Marathon';
    case 'Marathon':
      return '42.2K'; // Database uses 42.2K for Marathon
    default:
      return '5K'; // Default fallback
  }
};

export const generateTrainingPlanWithTemplates = async (
  runnerId: string,
  raceType: RaceType,
  experienceLevel: ExperienceLevel,
  fitnessScore: number,
  trainingDays: number,
  raceDate: Date,
  trainingStartDate: Date
) => {
  try {
    console.log('Generating training plan with mapped race distance...', {
      runnerId,
      raceType,
      mappedRaceDistance: mapRaceTypeToDistance(raceType),
      experienceLevel,
      fitnessScore,
      trainingDays,
      raceDate: raceDate.toISOString().split('T')[0],
      trainingStartDate: trainingStartDate.toISOString().split('T')[0]
    });

    // Map the race type to the correct database distance value
    const raceDistance = mapRaceTypeToDistance(raceType);

    // Call the Supabase function with the properly mapped race distance
    const { data: planData, error: planError } = await supabase.rpc('generate_training_plan', {
      runner_uuid: runnerId,
      race_type_param: raceType,
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

    console.log('Training plan generated successfully with ID:', planData);
    return planData;
  } catch (error) {
    console.error('Error in generateTrainingPlanWithTemplates:', error);
    throw error;
  }
};
