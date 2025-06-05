export interface WorkoutStructureJson {
  warmup?: {
    duration: number;
    pace: string;
    description?: string;
  };
  main: Array<{
    distance: number;
    pace: string;
    description?: string;
    reps?: number;
    rest?: number;
    segments?: Array<{
      distance: number;
      pace: string;
      description?: string;
    }>;
  }>;
  cooldown?: {
    duration: number;
    pace: string;
    description?: string;
  };
  description?: string;
  min_duration?: number;
  min_distance?: number;
}

// Pace zones for training (time per km in minutes)
export const PACE_ZONES = {
  EASY: { min: 6.0, max: 7.0 },
  TEMPO: { min: 4.5, max: 5.5 },
  INTERVAL: { min: 3.5, max: 4.5 },
  RECOVERY: { min: 7.0, max: 8.0 },
  AEROBIC: { min: 5.5, max: 6.5 }
};

// Effort levels for different workout types
export const EFFORT_LEVELS = {
  EASY: 'conversational',
  TEMPO: 'comfortably hard',
  INTERVAL: 'hard',
  RECOVERY: 'very easy',
  LONG: 'steady',
  VERY_EASY: 'very easy',
  MODERATE: 'moderate',
  COMFORTABLE_HARD: 'comfortably hard',
  HARD: 'hard',
  VERY_HARD: 'very hard'
};

export const isValidWorkoutStructure = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check if it has a main array
  if (!Array.isArray(data.main)) return false;
  
  // Check if main has at least one element with required properties
  return data.main.length > 0 && 
         data.main.every((segment: any) => 
           typeof segment === 'object' && 
           (typeof segment.distance === 'number' || typeof segment.duration === 'number')
         );
};

export const calculateWorkoutDuration = (
  structure: WorkoutStructureJson,
  fallbackDuration?: number | null
): number | null => {
  try {
    let totalDuration = 0;
    
    // Add warmup duration
    if (structure.warmup?.duration) {
      totalDuration += structure.warmup.duration;
    }
    
    // Add main segment durations
    if (structure.main) {
      for (const segment of structure.main) {
        if (segment.reps && segment.distance) {
          // For interval workouts: estimate time based on pace and distance
          const estimatedTimePerRep = segment.distance * 6; // Rough estimate: 6 min/km
          const restTime = segment.rest || 0;
          totalDuration += (estimatedTimePerRep + (restTime / 60)) * segment.reps;
        } else if (segment.distance) {
          // For continuous runs: estimate time based on distance
          totalDuration += segment.distance * 6; // Rough estimate: 6 min/km
        } else if (segment.segments) {
          // For complex structured workouts
          for (const subsegment of segment.segments) {
            if (subsegment.distance) {
              totalDuration += subsegment.distance * 6;
            }
          }
        }
      }
    }
    
    // Add cooldown duration
    if (structure.cooldown?.duration) {
      totalDuration += structure.cooldown.duration;
    }
    
    return totalDuration > 0 ? Math.round(totalDuration) : fallbackDuration;
  } catch (error) {
    console.error('Error calculating workout duration:', error);
    return fallbackDuration;
  }
};

export const generateWorkoutDescription = (
  workoutType: string,
  structure: WorkoutStructureJson,
  convertDistance: (distanceInKm: number) => string,
  distanceKm?: number | null
): string => {
  try {
    const parts: string[] = [];
    
    // Add warmup if present
    if (structure.warmup) {
      const warmupDistance = structure.warmup.duration * 0.05; // Assume 5km/h warmup pace
      parts.push(`${structure.warmup.duration}-min warmup (${convertDistance(warmupDistance)})`);
    }
    
    // Add main workout description
    if (structure.main && structure.main.length > 0) {
      const mainSegment = structure.main[0];
      
      if (mainSegment.reps && mainSegment.distance) {
        // Interval and Hill workouts - show distance in meters for intervals and hills
        if (workoutType.toLowerCase() === 'interval' || workoutType.toLowerCase() === 'hill') {
          const repDistanceInMeters = Math.round(mainSegment.distance * 1000);
          const restTime = mainSegment.rest ? `${mainSegment.rest}s rest` : 'recovery';
          parts.push(`${mainSegment.reps} × ${repDistanceInMeters}m with ${restTime}`);
        } else {
          const repDistance = convertDistance(mainSegment.distance);
          const restTime = mainSegment.rest ? `${mainSegment.rest}s rest` : 'recovery';
          parts.push(`${mainSegment.reps} × ${repDistance} with ${restTime}`);
        }
      } else if (mainSegment.distance) {
        // Continuous run - show in meters for intervals and hills, km/miles for others
        if (workoutType.toLowerCase() === 'interval' || workoutType.toLowerCase() === 'hill') {
          const distanceInMeters = Math.round(mainSegment.distance * 1000);
          parts.push(`${distanceInMeters}m ${workoutType.toLowerCase()} run`);
        } else {
          const mainDistance = convertDistance(mainSegment.distance);
          parts.push(`${mainDistance} ${workoutType.toLowerCase()} run`);
        }
      } else if (mainSegment.segments && mainSegment.segments.length > 1) {
        // Complex structured workout
        const segmentDescriptions = mainSegment.segments.map(seg => {
          if (workoutType.toLowerCase() === 'interval' || workoutType.toLowerCase() === 'hill') {
            const segDistanceInMeters = Math.round(seg.distance * 1000);
            return `${segDistanceInMeters}m at ${seg.pace || 'target pace'}`;
          } else {
            return `${convertDistance(seg.distance)} at ${seg.pace || 'target pace'}`;
          }
        });
        parts.push(segmentDescriptions.join(' + '));
      } else if (distanceKm) {
        // Fallback to provided distance
        if (workoutType.toLowerCase() === 'interval' || workoutType.toLowerCase() === 'hill') {
          const distanceInMeters = Math.round(distanceKm * 1000);
          parts.push(`${distanceInMeters}m ${workoutType.toLowerCase()} run`);
        } else {
          parts.push(`${convertDistance(distanceKm)} ${workoutType.toLowerCase()} run`);
        }
      }
    } else if (distanceKm) {
      // No structure, use provided distance
      if (workoutType.toLowerCase() === 'interval' || workoutType.toLowerCase() === 'hill') {
        const distanceInMeters = Math.round(distanceKm * 1000);
        parts.push(`${distanceInMeters}m ${workoutType.toLowerCase()} run`);
      } else {
        parts.push(`${convertDistance(distanceKm)} ${workoutType.toLowerCase()} run`);
      }
    }
    
    // Add cooldown if present
    if (structure.cooldown) {
      const cooldownDistance = structure.cooldown.duration * 0.05; // Assume 5km/h cooldown pace
      parts.push(`${structure.cooldown.duration}-min cooldown (${convertDistance(cooldownDistance)})`);
    }
    
    return parts.length > 0 ? parts.join(' + ') : structure.description || `${workoutType} workout`;
    
  } catch (error) {
    console.error('Error generating workout description:', error);
    return structure.description || `${workoutType} workout`;
  }
};
