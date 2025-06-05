
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
        // Interval workout
        const repDistance = convertDistance(mainSegment.distance);
        const restTime = mainSegment.rest ? `${mainSegment.rest}s rest` : 'recovery';
        parts.push(`${mainSegment.reps} × ${repDistance} with ${restTime}`);
      } else if (mainSegment.distance) {
        // Continuous run - use the calculated distance from the database
        const mainDistance = convertDistance(mainSegment.distance);
        parts.push(`${mainDistance} ${workoutType.toLowerCase()} run`);
      } else if (mainSegment.segments && mainSegment.segments.length > 1) {
        // Complex structured workout
        const segmentDescriptions = mainSegment.segments.map(seg => 
          `${convertDistance(seg.distance)} at ${seg.pace || 'target pace'}`
        );
        parts.push(segmentDescriptions.join(' + '));
      } else if (distanceKm) {
        // Fallback to provided distance
        parts.push(`${convertDistance(distanceKm)} ${workoutType.toLowerCase()} run`);
      }
    } else if (distanceKm) {
      // No structure, use provided distance
      parts.push(`${convertDistance(distanceKm)} ${workoutType.toLowerCase()} run`);
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
