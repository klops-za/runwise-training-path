
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkoutStructure = Database['public']['Tables']['workout_structures']['Row'];
type WorkoutType = Database['public']['Enums']['workout_type'];
type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type PhaseType = Database['public']['Enums']['phase_type'];

export interface WorkoutSegment {
  distance?: number;
  duration?: number;
  pace?: string;
  effort?: string;
  reps?: number;
  rest?: number;
  description?: string;
  segments?: WorkoutSegment[];
}

export interface WorkoutStructureJson {
  warmup?: number;
  main: WorkoutSegment[];
  cooldown?: number;
  description?: string;
  min_duration?: number;
  min_distance?: number;
  max_distance?: number;
}

export const getWorkoutStructure = async (
  workoutType: WorkoutType,
  experienceLevel: ExperienceLevel,
  phase: PhaseType
): Promise<WorkoutStructure | null> => {
  const { data, error } = await supabase
    .from('workout_structures')
    .select('*')
    .eq('workout_type', workoutType)
    .eq('experience_level', experienceLevel)
    .eq('phase', phase)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workout structure:', error);
    return null;
  }

  return data;
};

export const generateWorkoutDescription = (
  workoutType: WorkoutType,
  structureJson: WorkoutStructureJson,
  distance?: number,
  duration?: number
): string => {
  // Use description from structure if available
  if (structureJson.description) {
    return structureJson.description;
  }

  const mainSegment = structureJson.main[0];
  
  switch (workoutType) {
    case 'Interval':
      if (mainSegment?.reps && mainSegment?.distance) {
        return `${mainSegment.reps}x${mainSegment.distance * 1609}m @ ${mainSegment.pace || '5K'} pace with ${mainSegment.rest || 90}s rest`;
      }
      return mainSegment?.description || 'Interval training session';
    
    case 'Tempo':
      if (mainSegment?.distance) {
        return `${mainSegment.distance} mile tempo run at comfortably hard effort`;
      }
      return mainSegment?.description || 'Tempo run at threshold pace';
    
    case 'Hill':
      if (mainSegment?.reps && mainSegment?.duration) {
        return `${mainSegment.reps}x${mainSegment.duration}s hill repeats with ${mainSegment.rest || 90}s recovery`;
      }
      return mainSegment?.description || 'Hill repeat session';
    
    case 'Long':
      if (mainSegment?.segments && mainSegment.segments.length > 1) {
        return `${distance || 'Long'} mile run with varied pace segments`;
      }
      return mainSegment?.description || 'Long endurance run';
    
    case 'Easy':
      return mainSegment?.description || 'Easy run at conversational pace';
    
    case 'Recovery':
      return mainSegment?.description || 'Recovery run at very easy pace';
    
    case 'Cross-training':
      return mainSegment?.description || 'Cross-training activity';
    
    default:
      return 'Training run';
  }
};

export const calculateWorkoutDistance = (
  structureJson: WorkoutStructureJson,
  baseDistance: number
): number => {
  // Use min_distance from structure if available
  if (structureJson.min_distance) {
    return structureJson.min_distance;
  }

  const mainSegment = structureJson.main[0];
  
  // For interval workouts, calculate total distance including reps
  if (mainSegment?.reps && mainSegment?.distance) {
    const intervalDistance = mainSegment.reps * mainSegment.distance;
    const warmupCooldown = ((structureJson.warmup || 0) + (structureJson.cooldown || 0)) / 10; // rough conversion
    return intervalDistance + warmupCooldown;
  }
  
  // For segmented workouts, sum all segments
  if (mainSegment?.segments) {
    const segmentDistance = mainSegment.segments.reduce((sum, segment) => 
      sum + (segment.distance || 0), 0
    );
    return segmentDistance > 0 ? segmentDistance : baseDistance;
  }
  
  // Use distance from main segment if available
  if (mainSegment?.distance) {
    return mainSegment.distance;
  }
  
  // Fall back to base distance
  return baseDistance;
};

export const calculateWorkoutDuration = (
  structureJson: WorkoutStructureJson,
  baseDuration: number
): number => {
  // Use min_duration from structure if available
  if (structureJson.min_duration) {
    return structureJson.min_duration;
  }

  const warmup = structureJson.warmup || 0;
  const cooldown = structureJson.cooldown || 0;
  const mainSegment = structureJson.main[0];
  
  // For interval workouts, calculate total time including rest
  if (mainSegment?.reps && mainSegment?.duration) {
    const workTime = mainSegment.reps * mainSegment.duration / 60; // convert seconds to minutes
    const restTime = (mainSegment.reps - 1) * (mainSegment.rest || 90) / 60;
    return warmup + workTime + restTime + cooldown;
  }
  
  // For time-based segments
  if (mainSegment?.duration) {
    return warmup + mainSegment.duration + cooldown;
  }
  
  // Fall back to base duration
  return baseDuration;
};

export const isValidWorkoutStructure = (data: any): data is WorkoutStructureJson => {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    'main' in data &&
    Array.isArray(data.main)
  );
};
