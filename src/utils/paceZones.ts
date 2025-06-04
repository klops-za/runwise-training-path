
import { PACE_ZONES, EFFORT_LEVELS } from './workoutStructures';

// Map workout types to their typical pace zones
export const WORKOUT_TYPE_PACE_MAP = {
  'Easy': PACE_ZONES.EASY,
  'Recovery': PACE_ZONES.RECOVERY,
  'Long': PACE_ZONES.AEROBIC,
  'Tempo': PACE_ZONES.TEMPO,
  'Interval': PACE_ZONES.INTERVAL,
  'Hill': PACE_ZONES.INTERVAL,
  'Cross-training': 'N/A'
} as const;

// Map workout types to their typical effort levels
export const WORKOUT_TYPE_EFFORT_MAP = {
  'Easy': EFFORT_LEVELS.EASY,
  'Recovery': EFFORT_LEVELS.VERY_EASY,
  'Long': EFFORT_LEVELS.MODERATE,
  'Tempo': EFFORT_LEVELS.COMFORTABLE_HARD,
  'Interval': EFFORT_LEVELS.HARD,
  'Hill': EFFORT_LEVELS.VERY_HARD,
  'Cross-training': EFFORT_LEVELS.MODERATE
} as const;

// Helper function to get standardized pace for a workout type
export const getStandardPace = (workoutType: string): string => {
  return WORKOUT_TYPE_PACE_MAP[workoutType as keyof typeof WORKOUT_TYPE_PACE_MAP] || PACE_ZONES.EASY;
};

// Helper function to get standardized effort for a workout type
export const getStandardEffort = (workoutType: string): string => {
  return WORKOUT_TYPE_EFFORT_MAP[workoutType as keyof typeof WORKOUT_TYPE_EFFORT_MAP] || EFFORT_LEVELS.MODERATE;
};

// Helper function to validate if a pace zone is valid
export const isValidPaceZone = (pace: string): boolean => {
  return Object.values(PACE_ZONES).includes(pace as any);
};

// Helper function to validate if an effort level is valid
export const isValidEffortLevel = (effort: string): boolean => {
  return Object.values(EFFORT_LEVELS).includes(effort as any);
};
