import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type WorkoutStructure = Database['public']['Tables']['workout_structures']['Row'];
type WorkoutType = Database['public']['Enums']['workout_type'];
type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type PhaseType = Database['public']['Enums']['phase_type'];
type RaceType = Database['public']['Enums']['race_type'];

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

export interface WorkoutPhaseSegment {
  duration?: number;
  pace?: string;
  description?: string;
}

export interface WorkoutStructureJson {
  warmup?: WorkoutPhaseSegment;
  main: WorkoutSegment[];
  cooldown?: WorkoutPhaseSegment;
  description?: string;
  min_duration?: number;
  min_distance?: number;
  max_distance?: number;
}

// Standardized pace zones for consistency
export const PACE_ZONES = {
  RECOVERY: 'recovery',
  EASY: 'easy',
  AEROBIC: 'aerobic',
  TEMPO: 'tempo',
  THRESHOLD: 'threshold',
  GOAL: 'goal',
  INTERVAL: 'interval',
  MILE: 'mile',
  VO2MAX: 'vo2max'
} as const;

// Standardized effort levels for consistency
export const EFFORT_LEVELS = {
  VERY_EASY: 'Very Easy',
  EASY: 'Easy',
  MODERATE: 'Moderate',
  COMFORTABLE_HARD: 'Comfortably Hard',
  HARD: 'Hard',
  VERY_HARD: 'Very Hard',
  RACE_EFFORT: 'Race Effort',
  MAXIMUM: 'Maximum'
} as const;

// Helper function to convert distance to meters with proper rounding
const convertDistanceToMeters = (distanceInMiles: number): string => {
  const meters = distanceInMiles * 1609.34;
  
  // Round to nearest 50m for distances under 1000m, nearest 100m for larger distances
  let roundedMeters;
  if (meters < 1000) {
    roundedMeters = Math.round(meters / 50) * 50;
  } else {
    roundedMeters = Math.round(meters / 100) * 100;
  }
  
  return `${roundedMeters}m`;
};

export const getWorkoutStructure = async (
  workoutType: WorkoutType,
  experienceLevel: ExperienceLevel,
  phase: PhaseType,
  raceDistance?: RaceType
): Promise<WorkoutStructure | null> => {
  console.log('Fetching workout structure with parameters:', {
    workoutType,
    experienceLevel,
    phase,
    raceDistance
  });

  let query = supabase
    .from('workout_structures')
    .select('*')
    .eq('workout_type', workoutType)
    .eq('experience_level', experienceLevel)
    .eq('phase', phase);

  // If race distance is provided, filter by it directly (no mapping needed)
  if (raceDistance) {
    query = query.eq('race_distance', raceDistance);
    console.log('Filtering by race distance:', raceDistance);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workout structure:', error);
    return null;
  }

  console.log('Found workout structure:', data ? 'Yes' : 'No');
  return data;
};

export const getWorkoutStructureFromPlan = async (
  planId: string,
  workoutType: WorkoutType,
  experienceLevel: ExperienceLevel,
  phase: PhaseType
): Promise<WorkoutStructure | null> => {
  console.log('Fetching workout structure with plan race type for plan:', planId);

  // First get the race type from the training plan
  const { data: planData, error: planError } = await supabase
    .from('training_plans')
    .select('race_type')
    .eq('id', planId)
    .maybeSingle();

  if (planError) {
    console.error('Error fetching training plan:', planError);
    return null;
  }

  if (!planData?.race_type) {
    console.warn('No race type found for training plan:', planId);
    return getWorkoutStructure(workoutType, experienceLevel, phase);
  }

  console.log('Found race type from plan:', planData.race_type);
  return getWorkoutStructure(workoutType, experienceLevel, phase, planData.race_type);
};

export const generateWorkoutDescription = (
  workoutType: WorkoutType,
  structureJson: WorkoutStructureJson,
  convertDistance?: (distance: number) => string
): string => {
  // Use description from structure if available
  if (structureJson.description) {
    return structureJson.description;
  }

  const mainSegment = structureJson.main[0];
  let mainDescription = '';
  
  // Generate main workout description
  switch (workoutType) {
    case 'Interval':
      if (mainSegment?.reps && mainSegment?.distance) {
        const distanceInMeters = convertDistanceToMeters(mainSegment.distance);
        const restTime = mainSegment.rest || 90;
        mainDescription = `${mainSegment.reps}x${distanceInMeters} @ ${mainSegment.pace || PACE_ZONES.INTERVAL} pace with ${restTime}s rest`;
      } else {
        mainDescription = mainSegment?.description || 'Interval training session';
      }
      break;
    
    case 'Tempo':
      if (mainSegment?.distance) {
        const distanceStr = convertDistance ? convertDistance(mainSegment.distance) : `${mainSegment.distance} miles`;
        mainDescription = `${distanceStr} @ ${mainSegment.pace || PACE_ZONES.TEMPO} pace`;
      } else {
        mainDescription = mainSegment?.description || 'Tempo run at threshold pace';
      }
      break;
    
    case 'Hill':
      if (mainSegment?.reps && mainSegment?.duration) {
        const restTime = mainSegment.rest || 120;
        mainDescription = `${mainSegment.reps}x${mainSegment.duration}s hill repeats @ ${mainSegment.effort || EFFORT_LEVELS.HARD} effort with ${restTime}s recovery`;
      } else {
        mainDescription = mainSegment?.description || 'Hill repeat session';
      }
      break;
    
    case 'Long':
      if (mainSegment?.segments && mainSegment.segments.length > 1) {
        mainDescription = `Long run with varied pace segments`;
      } else if (mainSegment?.distance) {
        const distanceStr = convertDistance ? convertDistance(mainSegment.distance) : `${mainSegment.distance} miles`;
        mainDescription = `${distanceStr} long run @ ${mainSegment.pace || PACE_ZONES.EASY} pace`;
      } else {
        mainDescription = mainSegment?.description || 'Long endurance run';
      }
      break;
    
    case 'Easy':
      if (mainSegment?.distance) {
        const distanceStr = convertDistance ? convertDistance(mainSegment.distance) : `${mainSegment.distance} miles`;
        mainDescription = `${distanceStr} easy run @ ${mainSegment.pace || PACE_ZONES.EASY} pace`;
      } else {
        mainDescription = mainSegment?.description || `Easy run at ${EFFORT_LEVELS.EASY.toLowerCase()} pace`;
      }
      break;
    
    case 'Recovery':
      if (mainSegment?.distance) {
        const distanceStr = convertDistance ? convertDistance(mainSegment.distance) : `${mainSegment.distance} miles`;
        mainDescription = `${distanceStr} recovery run @ ${mainSegment.pace || PACE_ZONES.RECOVERY} pace`;
      } else {
        mainDescription = mainSegment?.description || `Recovery run at ${EFFORT_LEVELS.VERY_EASY.toLowerCase()} pace`;
      }
      break;
    
    case 'Cross-training':
      mainDescription = mainSegment?.description || structureJson.description || 'Cross-training activity';
      break;
    
    default:
      mainDescription = 'Training run';
  }

  // Add warmup and cooldown information if available
  const parts = [];
  
  // Add warmup
  if (structureJson.warmup) {
    const warmupParts = [];
    if (structureJson.warmup.duration) {
      warmupParts.push(`${structureJson.warmup.duration}min`);
    }
    if (structureJson.warmup.pace) {
      warmupParts.push(`@ ${structureJson.warmup.pace}`);
    }
    if (structureJson.warmup.description) {
      warmupParts.push(structureJson.warmup.description);
    }
    if (warmupParts.length === 0) {
      warmupParts.push('warmup');
    }
    parts.push(`Warmup: ${warmupParts.join(' ')}`);
  }

  // Add main workout
  parts.push(mainDescription);

  // Add cooldown
  if (structureJson.cooldown) {
    const cooldownParts = [];
    if (structureJson.cooldown.duration) {
      cooldownParts.push(`${structureJson.cooldown.duration}min`);
    }
    if (structureJson.cooldown.pace) {
      cooldownParts.push(`@ ${structureJson.cooldown.pace}`);
    }
    if (structureJson.cooldown.description) {
      cooldownParts.push(structureJson.cooldown.description);
    }
    if (cooldownParts.length === 0) {
      cooldownParts.push('cooldown');
    }
    parts.push(`Cooldown: ${cooldownParts.join(' ')}`);
  }

  return parts.join(' | ');
};

export const calculateWorkoutDistance = (
  structureJson: WorkoutStructureJson,
  baseDistance?: number
): number => {
  // Use min_distance from structure if available
  if (structureJson.min_distance) {
    return structureJson.min_distance;
  }

  const mainSegment = structureJson.main[0];
  
  // For interval workouts, calculate total distance including reps
  if (mainSegment?.reps && mainSegment?.distance) {
    const intervalDistance = mainSegment.reps * mainSegment.distance;
    const warmupDistance = structureJson.warmup?.duration ? structureJson.warmup.duration / 10 : 0; // rough conversion
    const cooldownDistance = structureJson.cooldown?.duration ? structureJson.cooldown.duration / 10 : 0; // rough conversion
    return intervalDistance + warmupDistance + cooldownDistance;
  }
  
  // For segmented workouts, sum all segments
  if (mainSegment?.segments) {
    const segmentDistance = mainSegment.segments.reduce((sum, segment) => 
      sum + (segment.distance || 0), 0
    );
    return segmentDistance > 0 ? segmentDistance : (baseDistance || 3);
  }
  
  // Use distance from main segment if available
  if (mainSegment?.distance) {
    return mainSegment.distance;
  }
  
  // Fall back to base distance
  return baseDistance || 3;
};

export const calculateWorkoutDuration = (
  structureJson: WorkoutStructureJson,
  baseDuration?: number
): number => {
  // Use min_duration from structure if available
  if (structureJson.min_duration) {
    return structureJson.min_duration;
  }

  const warmup = structureJson.warmup?.duration || 0;
  const cooldown = structureJson.cooldown?.duration || 0;
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
  return baseDuration || 30;
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
