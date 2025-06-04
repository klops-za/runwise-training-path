
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Target, Zap } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { isValidWorkoutStructure, type WorkoutStructureJson, PACE_ZONES, EFFORT_LEVELS } from '@/utils/workoutStructures';
import { getStandardPace, getStandardEffort } from '@/utils/paceZones';

type Workout = Database['public']['Tables']['workouts']['Row'];

interface WorkoutDetailsCardProps {
  workout: Workout;
  convertDistance: (distanceInMiles: number) => string;
}

const WorkoutDetailsCard = ({ workout, convertDistance }: WorkoutDetailsCardProps) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatPaceDisplay = (pace?: string) => {
    if (!pace) return 'Easy';
    return Object.values(PACE_ZONES).includes(pace as any) ? pace : getStandardPace(workout.type || 'Easy');
  };

  const formatEffortDisplay = (effort?: string) => {
    if (!effort) return 'Moderate';
    return Object.values(EFFORT_LEVELS).includes(effort as any) ? effort : getStandardEffort(workout.type || 'Easy');
  };

  const getStructuredDescription = () => {
    if (!workout.details_json) return workout.description;
    
    try {
      const detailsData = workout.details_json;
      
      if (!isValidWorkoutStructure(detailsData)) {
        return workout.description;
      }
      
      const structure = detailsData as WorkoutStructureJson;
      
      // Create unified display format
      const phases: string[] = [];
      
      // Add warmup if present
      if (structure.warmup) {
        phases.push(`Warmup: ${structure.warmup.duration}min @ ${structure.warmup.pace || 'easy'} pace`);
      }
      
      // Add main workout
      const mainSegment = structure.main[0];
      if (mainSegment) {
        if (workout.type === 'Interval' && mainSegment?.reps && mainSegment?.distance) {
          phases.push(`${mainSegment.reps}x${(mainSegment.distance * 1609).toFixed(0)}m @ ${formatPaceDisplay(mainSegment.pace)} pace${mainSegment.rest ? ` with ${mainSegment.rest}s rest` : ''}`);
        } else if (workout.type === 'Tempo' && mainSegment?.distance) {
          phases.push(`${convertDistance(mainSegment.distance)} @ ${formatPaceDisplay(mainSegment.pace)} pace`);
        } else if (workout.type === 'Hill' && mainSegment?.reps && mainSegment?.duration) {
          phases.push(`${mainSegment.reps}x${mainSegment.duration}s hill repeats @ ${formatEffortDisplay(mainSegment.effort)} effort${mainSegment.rest ? ` with ${mainSegment.rest}s recovery` : ''}`);
        } else if (mainSegment?.distance) {
          phases.push(`${convertDistance(mainSegment.distance)} @ ${formatPaceDisplay(mainSegment.pace)} pace`);
        } else if (mainSegment?.description) {
          phases.push(mainSegment.description);
        }
      }
      
      // Add cooldown if present
      if (structure.cooldown) {
        phases.push(`Cooldown: ${structure.cooldown.duration}min @ ${structure.cooldown.pace || 'easy'} pace`);
      }
      
      // Return unified description or fall back
      if (phases.length > 0) {
        return phases.join('\n');
      }
      
      return structure.description || workout.description;
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workout.type || 'Workout'}</CardTitle>
          {workout.intensity && (
            <Badge className={getIntensityColor(workout.intensity)}>
              {workout.intensity}
            </Badge>
          )}
        </div>
        {workout.date && (
          <p className="text-sm text-muted-foreground">
            {new Date(workout.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-card-foreground mb-3 whitespace-pre-line">{getStructuredDescription()}</div>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
          {workout.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {workout.duration} min
            </div>
          )}
          {workout.distance_target && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {convertDistance(workout.distance_target)}
            </div>
          )}
          {workout.pace_target && (
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              {workout.pace_target}
            </div>
          )}
        </div>

        {workout.notes && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Notes:</strong> {workout.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutDetailsCard;
