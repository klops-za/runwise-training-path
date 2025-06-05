
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type RaceType = Database['public']['Enums']['race_type'];

export const generateTrainingPlanWithName = async (
  runnerId: string,
  raceType: RaceType,
  experienceLevel: ExperienceLevel,
  fitnessScore: number,
  trainingDays: number,
  raceDate: Date,
  trainingStartDate: Date,
  planName: string,
  planDescription?: string
) => {
  try {
    console.log('Generating training plan with custom name...', {
      runnerId,
      raceType,
      experienceLevel,
      fitnessScore,
      trainingDays,
      raceDate: raceDate.toISOString().split('T')[0],
      trainingStartDate: trainingStartDate.toISOString().split('T')[0],
      planName,
      planDescription
    });

    const { data: planData, error: planError } = await supabase.rpc('generate_training_plan', {
      runner_uuid: runnerId,
      race_type_param: raceType,
      experience_level_param: experienceLevel,
      fitness_score_param: fitnessScore,
      training_days_param: trainingDays,
      race_date_param: raceDate.toISOString().split('T')[0],
      training_start_date_param: trainingStartDate.toISOString().split('T')[0],
      plan_name_param: planName,
      plan_description_param: planDescription
    });

    if (planError) {
      console.error('Error generating training plan:', planError);
      throw planError;
    }

    console.log('Training plan generated successfully with ID:', planData);
    return planData;
  } catch (error) {
    console.error('Error in generateTrainingPlanWithName:', error);
    throw error;
  }
};

export const getActiveTrainingPlan = async (runnerId: string) => {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('runner_id', runnerId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error fetching active training plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getActiveTrainingPlan:', error);
    throw error;
  }
};

export const getAllTrainingPlans = async (runnerId: string) => {
  try {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('runner_id', runnerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching training plans:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllTrainingPlans:', error);
    throw error;
  }
};
