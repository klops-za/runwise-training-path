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

// Helper function to convert pace string to seconds per mile
const paceToSecondsPerMile = (pace: string): number => {
  // Handle different pace formats
  if (pace.includes(':')) {
    const [minutes, seconds] = pace.split(':').map(Number);
    return (minutes * 60) + seconds;
  }
  
  // Default pace mappings (in seconds per mile)
  const paceMap: { [key: string]: number } = {
    'recovery': 600, // 10:00/mile
    'easy': 540,     // 9:00/mile
    'aerobic': 510,  // 8:30/mile
    'tempo': 480,    // 8:00/mile
    'threshold': 480, // 8:00/mile
    'goal': 450,     // 7:30/mile
    'interval': 420, // 7:00/mile
    'mile': 390,     // 6:30/mile
    'vo2max': 390    // 6:30/mile
  };
  
  return paceMap[pace.toLowerCase()] || 540; // Default to easy pace
};

// Helper function to calculate distance based on time and pace (returns miles)
const calculateDistanceFromTime = (timeMinutes: number, pace: string): number => {
  const paceSecondsPerMile = paceToSecondsPerMile(pace);
  const timeSeconds = timeMinutes * 60;
  return timeSeconds / paceSecondsPerMile; // Returns distance in miles
};

// Helper function to convert distance to meters with proper rounding
const convertDistanceToMeters = (distanceInKm: number): string => {
  const meters = distanceInKm * 1000;
  
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
        // Convert km to miles for the convertDistance function
        const distanceInMiles = mainSegment.distance * 0.621371;
        const distanceStr = convertDistance ? convertDistance(distanceInMiles) : `${mainSegment.distance} km`;
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
        // Convert km to miles for the convertDistance function
        const distanceInMiles = mainSegment.distance * 0.621371;
        const distanceStr = convertDistance ? convertDistance(distanceInMiles) : `${mainSegment.distance} km`;
        mainDescription = `${distanceStr} long run @ ${mainSegment.pace || PACE_ZONES.EASY} pace`;
      } else {
        mainDescription = mainSegment?.description || 'Long endurance run';
      }
      break;
    
    case 'Easy':
      if (mainSegment?.distance) {
        // Convert km to miles for the convertDistance function
        const distanceInMiles = mainSegment.distance * 0.621371;
        const distanceStr = convertDistance ? convertDistance(distanceInMiles) : `${mainSegment.distance} km`;
        mainDescription = `${distanceStr} easy run @ ${mainSegment.pace || PACE_ZONES.EASY} pace`;
      } else {
        mainDescription = mainSegment?.description || `Easy run at ${EFFORT_LEVELS.EASY.toLowerCase()} pace`;
      }
      break;
    
    case 'Recovery':
      if (mainSegment?.distance) {
        // Convert km to miles for the convertDistance function
        const distanceInMiles = mainSegment.distance * 0.621371;
        const distanceStr = convertDistance ? convertDistance(distanceInMiles) : `${mainSegment.distance} km`;
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
  console.log('calculateWorkoutDistance called with:', structureJson);
  
  // Use min_distance from structure if available (convert km to miles)
  if (structureJson.min_distance) {
    console.log('Using min_distance from structure (km):', structureJson.min_distance);
    const milesDistance = structureJson.min_distance * 0.621371;
    console.log('Converted to miles:', milesDistance);
    return milesDistance;
  }

  let totalDistanceMiles = 0;
  const mainSegment = structureJson.main[0];
  
  console.log('Main segment:', mainSegment);
  
  // Calculate warmup distance
  if (structureJson.warmup?.duration) {
    const warmupPace = structureJson.warmup.pace || PACE_ZONES.EASY;
    const warmupDistance = calculateDistanceFromTime(structureJson.warmup.duration, warmupPace);
    console.log('Warmup distance calculated:', warmupDistance, 'miles from', structureJson.warmup.duration, 'min at', warmupPace);
    totalDistanceMiles += warmupDistance;
  }
  
  // Calculate main segment distance
  if (mainSegment?.reps && mainSegment?.distance) {
    // For interval workouts, distance is in km, convert to miles
    const mainDistanceKm = mainSegment.reps * mainSegment.distance;
    const mainDistanceMiles = mainDistanceKm * 0.621371;
    console.log('Main distance (interval):', mainDistanceMiles, 'miles (', mainDistanceKm, 'km) =', mainSegment.reps, 'x', mainSegment.distance, 'km');
    totalDistanceMiles += mainDistanceMiles;
  } else if (mainSegment?.segments) {
    // For segmented workouts, sum all segments
    const segmentDistanceMiles = mainSegment.segments.reduce((sum, segment) => {
      if (segment.distance) {
        const segmentMiles = segment.distance * 0.621371; // Convert km to miles
        console.log('Segment distance:', segmentMiles, 'miles (', segment.distance, 'km)');
        return sum + segmentMiles;
      } else if (segment.duration && segment.pace) {
        const calcDistance = calculateDistanceFromTime(segment.duration / 60, segment.pace);
        console.log('Calculated segment distance:', calcDistance, 'miles from', segment.duration, 's at', segment.pace);
        return sum + calcDistance;
      }
      return sum;
    }, 0);
    console.log('Total segments distance:', segmentDistanceMiles, 'miles');
    totalDistanceMiles += segmentDistanceMiles > 0 ? segmentDistanceMiles : (baseDistance || 3);
  } else if (mainSegment?.distance) {
    // Convert km to miles
    const mainDistanceMiles = mainSegment.distance * 0.621371;
    console.log('Main distance (direct):', mainDistanceMiles, 'miles (', mainSegment.distance, 'km)');
    totalDistanceMiles += mainDistanceMiles;
  } else if (mainSegment?.duration && mainSegment?.pace) {
    // Calculate distance from duration and pace
    const mainDistance = calculateDistanceFromTime(mainSegment.duration / 60, mainSegment.pace);
    console.log('Main distance (calculated from time/pace):', mainDistance, 'miles from', mainSegment.duration / 60, 'min at', mainSegment.pace);
    totalDistanceMiles += mainDistance;
  } else {
    // Fall back to base distance for main segment
    console.log('Using base distance for main:', baseDistance || 3, 'miles');
    totalDistanceMiles += baseDistance || 3;
  }
  
  // Calculate cooldown distance
  if (structureJson.cooldown?.duration) {
    const cooldownPace = structureJson.cooldown.pace || PACE_ZONES.EASY;
    const cooldownDistance = calculateDistanceFromTime(structureJson.cooldown.duration, cooldownPace);
    console.log('Cooldown distance calculated:', cooldownDistance, 'miles from', structureJson.cooldown.duration, 'min at', cooldownPace);
    totalDistanceMiles += cooldownDistance;
  }
  
  console.log('Total distance before rounding:', totalDistanceMiles, 'miles');
  const rounded = Math.round(totalDistanceMiles * 10) / 10;
  console.log('Total distance after rounding:', rounded, 'miles');
  
  return rounded; // Round to 1 decimal place, return in miles
};

export const calculateWorkoutDuration = (
  structureJson: WorkoutStructureJson,
  baseDuration?: number
): number => {
  // Use min_duration from structure if available
  if (structureJson.min_duration) {
    return structureJson.min_duration;
  }

  let totalDuration = 0;
  const mainSegment = structureJson.main[0];
  
  // Add warmup duration
  if (structureJson.warmup?.duration) {
    totalDuration += structureJson.warmup.duration;
  }
  
  // Calculate main segment duration
  if (mainSegment?.reps && mainSegment?.duration) {
    // For interval workouts, calculate total time including rest
    const workTime = mainSegment.reps * (mainSegment.duration / 60); // convert seconds to minutes
    const restTime = (mainSegment.reps - 1) * ((mainSegment.rest || 90) / 60); // convert seconds to minutes
    totalDuration += workTime + restTime;
  } else if (mainSegment?.segments) {
    // For segmented workouts, sum all segment durations
    const segmentDuration = mainSegment.segments.reduce((sum, segment) => {
      if (segment.duration) {
        return sum + (segment.duration / 60); // convert seconds to minutes
      } else if (segment.distance && segment.pace) {
        // Calculate time from distance and pace (distance is in km, need to convert to miles)
        const distanceInMiles = segment.distance * 0.621371;
        const paceSecondsPerMile = paceToSecondsPerMile(segment.pace);
        const timeSeconds = distanceInMiles * paceSecondsPerMile;
        return sum + (timeSeconds / 60); // convert to minutes
      }
      return sum;
    }, 0);
    totalDuration += segmentDuration > 0 ? segmentDuration : (baseDuration || 30);
  } else if (mainSegment?.duration) {
    // Use duration from main segment if available (convert seconds to minutes)
    totalDuration += mainSegment.duration / 60;
  } else if (mainSegment?.distance && mainSegment?.pace) {
    // Calculate duration from distance and pace (distance is in km, convert to miles)
    const distanceInMiles = mainSegment.distance * 0.621371;
    const paceSecondsPerMile = paceToSecondsPerMile(segment.pace);
    const timeSeconds = distanceInMiles * paceSecondsPerMile;
    totalDuration += timeSeconds / 60; // convert to minutes
  } else {
    // Fall back to base duration for main segment
    totalDuration += baseDuration || 30;
  }
  
  // Add cooldown duration
  if (structureJson.cooldown?.duration) {
    totalDuration += structureJson.cooldown.duration;
  }
  
  return Math.round(totalDuration);
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
