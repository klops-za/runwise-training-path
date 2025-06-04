
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
      const mainSegment = structure.main[0];
      
      // Format structured descriptions for interval and tempo workouts
      if (workout.type === 'Interval' && mainSegment?.reps && mainSegment?.distance) {
        return `${mainSegment.reps}x${(mainSegment.distance * 1609).toFixed(0)}m @ ${formatPaceDisplay(mainSegment.pace)} pace with ${mainSegment.rest || 90}s rest`;
      }
      
      if (workout.type === 'Tempo' && mainSegment?.distance) {
        return `${convertDistance(mainSegment.distance)} @ ${formatPaceDisplay(mainSegment.pace)} pace`;
      }
      
      if (workout.type === 'Hill' && mainSegment?.reps && mainSegment?.duration) {
        return `${mainSegment.reps}x${mainSegment.duration}s hill repeats @ ${formatEffortDisplay(mainSegment.effort)} effort with ${mainSegment.rest || 90}s recovery`;
      }
      
      // For other workout types, use the original description
      return workout.description;
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description;
    }
  };

  const renderStructuredWorkout = () => {
    if (!workout.details_json) return null;
    
    try {
      const detailsData = workout.details_json;
      
      if (!isValidWorkoutStructure(detailsData)) {
        return null;
      }
      
      const structure = detailsData as WorkoutStructureJson;
      
      return (
        <div className="mt-4 space-y-3">
          {structure.warmup && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="h-4 w-4 mr-2" />
              Warmup: {structure.warmup} minutes
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Main Workout</h4>
            {structure.main.map((segment, index) => (
              <div key={index} className="text-sm text-blue-800 dark:text-blue-200">
                {segment.reps && segment.distance && (
                  <p>{segment.reps}x{(segment.distance * 1609).toFixed(0)}m @ {formatPaceDisplay(segment.pace)} pace</p>
                )}
                {segment.reps && segment.duration && (
                  <p>{segment.reps}x{segment.duration}s @ {formatEffortDisplay(segment.effort)} effort</p>
                )}
                {segment.distance && !segment.reps && (
                  <p>{convertDistance(segment.distance)} @ {formatPaceDisplay(segment.pace)} pace</p>
                )}
                {segment.rest && <p className="text-xs">Rest: {segment.rest}s between reps</p>}
                {segment.description && <p className="text-xs italic mt-1">{segment.description}</p>}
                {segment.segments && (
                  <div className="ml-4 mt-2 space-y-1">
                    {segment.segments.map((subsegment, subIndex) => (
                      <p key={subIndex} className="text-xs">
                        {subsegment.distance && `${convertDistance(subsegment.distance)} @ ${formatPaceDisplay(subsegment.pace)} pace`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {structure.cooldown && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Target className="h-4 w-4 mr-2" />
              Cooldown: {structure.cooldown} minutes
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return null;
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
        <p className="text-card-foreground mb-3">{getStructuredDescription()}</p>
        
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

        {renderStructuredWorkout()}

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
