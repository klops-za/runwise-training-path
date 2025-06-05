
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Target, Zap } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { isValidWorkoutStructure, type WorkoutStructureJson, generateWorkoutDescription } from '@/utils/workoutStructures';

type Workout = Database['public']['Tables']['workouts']['Row'];

interface WorkoutDetailsCardProps {
  workout: Workout;
  convertDistance: (distanceInKm: number) => string;
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

  const getStructuredDescription = () => {
    if (!workout.details_json) return workout.description;
    
    try {
      const detailsData = workout.details_json;
      
      if (!isValidWorkoutStructure(detailsData)) {
        return workout.description;
      }
      
      const structure = detailsData as WorkoutStructureJson;
      
      // Use distance_target from database (already in km) as primary source
      const distanceKm = workout.distance_target;
      
      // Use the new unified description generator with distance in km
      const generatedDescription = generateWorkoutDescription(
        workout.type || 'Easy', 
        structure, 
        convertDistance,
        distanceKm
      );
      
      return generatedDescription || workout.description;
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description;
    }
  };

  const getDisplayDistance = () => {
    // Use distance_target from database as primary and only source (already in km)
    if (workout.distance_target) {
      return convertDistance(workout.distance_target);
    }
    return null;
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
        <div className="text-card-foreground mb-3">{getStructuredDescription()}</div>
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
          {workout.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {workout.duration} min
            </div>
          )}
          {getDisplayDistance() && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {getDisplayDistance()}
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
