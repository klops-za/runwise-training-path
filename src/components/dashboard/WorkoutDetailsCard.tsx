
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Target, Zap } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import type { WorkoutStructureJson } from '@/utils/workoutStructures';

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

  const renderStructuredWorkout = () => {
    if (!workout.details_json) return null;
    
    try {
      // Safe type checking and casting
      const detailsData = workout.details_json;
      
      // Check if it's an object and has the required 'main' property
      if (typeof detailsData === 'object' && 
          detailsData !== null && 
          !Array.isArray(detailsData) &&
          'main' in detailsData) {
        
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
                    <p>{segment.reps}x{(segment.distance * 1609).toFixed(0)}m @ {segment.pace} pace</p>
                  )}
                  {segment.reps && segment.duration && (
                    <p>{segment.reps}x{segment.duration}s @ {segment.effort} effort</p>
                  )}
                  {segment.distance && !segment.reps && (
                    <p>{convertDistance(segment.distance)} @ {segment.pace} pace</p>
                  )}
                  {segment.rest && <p className="text-xs">Rest: {segment.rest}s between reps</p>}
                  {segment.description && <p className="text-xs italic mt-1">{segment.description}</p>}
                  {segment.segments && (
                    <div className="ml-4 mt-2 space-y-1">
                      {segment.segments.map((subsegment, subIndex) => (
                        <p key={subIndex} className="text-xs">
                          {subsegment.distance && `${convertDistance(subsegment.distance)} @ ${subsegment.pace} pace`}
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
      }
      
      return null;
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
        <p className="text-card-foreground mb-3">{workout.description}</p>
        
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
