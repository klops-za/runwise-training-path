
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Play, Plus, RefreshCw } from 'lucide-react';
import WorkoutDetailsCard from './WorkoutDetailsCard';
import type { Database } from '@/integrations/supabase/types';
import { isValidWorkoutStructure, type WorkoutStructureJson, PACE_ZONES } from '@/utils/workoutStructures';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];

interface TrainingStatusCardProps {
  trainingPlan: TrainingPlan | null;
  currentWeekWorkouts: Workout[];
  currentWeek: number;
  generatingPlan: boolean;
  onGenerateTrainingPlan: () => void;
  convertDistance: (distanceInMiles: number) => string;
}

const TrainingStatusCard = ({ 
  trainingPlan, 
  currentWeekWorkouts, 
  currentWeek, 
  generatingPlan, 
  onGenerateTrainingPlan,
  convertDistance 
}: TrainingStatusCardProps) => {
  const getWorkoutDisplayDescription = (workout: Workout) => {
    if (!workout.details_json) {
      return workout.description || 'No description available';
    }
    
    try {
      const detailsData = workout.details_json;
      
      if (!isValidWorkoutStructure(detailsData)) {
        return workout.description || 'No description available';
      }
      
      const structure = detailsData as WorkoutStructureJson;
      const mainSegment = structure.main[0];
      
      // Format structured descriptions for interval and tempo workouts
      if (workout.type === 'Interval' && mainSegment?.reps && mainSegment?.distance) {
        return `${mainSegment.reps}x${(mainSegment.distance * 1609).toFixed(0)}m @ ${mainSegment.pace || 'Interval'} pace`;
      }
      
      if (workout.type === 'Tempo' && mainSegment?.distance) {
        return `${convertDistance(mainSegment.distance)} @ ${mainSegment.pace || 'Tempo'} pace`;
      }
      
      if (workout.type === 'Hill' && mainSegment?.reps && mainSegment?.duration) {
        return `${mainSegment.reps}x${mainSegment.duration}s hill repeats`;
      }
      
      // Use structured description if available
      if (mainSegment?.description) {
        return mainSegment.description;
      }
      
      // For other workout types, use the original description
      return workout.description || 'No description available';
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description || 'No description available';
    }
  };

  const renderWorkoutStructurePreview = (workout: Workout) => {
    if (!workout.details_json) return null;
    
    try {
      const detailsData = workout.details_json;
      
      if (!isValidWorkoutStructure(detailsData)) {
        return null;
      }
      
      const structure = detailsData as WorkoutStructureJson;
      
      return (
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          {structure.warmup && (
            <div>Warmup: {structure.warmup.duration}min @ {structure.warmup.pace} pace</div>
          )}
          <div className="font-medium text-foreground">
            Main: {getWorkoutDisplayDescription(workout)}
          </div>
          {structure.cooldown && (
            <div>Cooldown: {structure.cooldown.duration}min @ {structure.cooldown.pace} pace</div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return null;
    }
  };

  if (!trainingPlan) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
        <CardHeader>
          <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            No Training Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-800 dark:text-orange-200 mb-4">
            Generate a personalized training plan to start your journey.
          </p>
          <Button 
            onClick={onGenerateTrainingPlan}
            disabled={generatingPlan}
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
          >
            {generatingPlan ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          This Week's Training (Week {currentWeek})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentWeekWorkouts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No workouts scheduled for this week.</p>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              View Full Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentWeekWorkouts.slice(0, 3).map((workout) => (
              <div key={workout.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{workout.type}</span>
                    {workout.status === 'Completed' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                        Completed
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {workout.date ? new Date(workout.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    }) : 'TBD'}
                  </span>
                </div>
                
                <p className="text-sm text-card-foreground mb-2">
                  {getWorkoutDisplayDescription(workout)}
                </p>
                
                {renderWorkoutStructurePreview(workout)}
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                  {workout.duration && (
                    <span>{workout.duration} min</span>
                  )}
                  {workout.distance_target && (
                    <span>{convertDistance(workout.distance_target)}</span>
                  )}
                  {workout.pace_target && (
                    <span>{workout.pace_target} pace</span>
                  )}
                </div>
              </div>
            ))}
            
            {currentWeekWorkouts.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  View All ({currentWeekWorkouts.length - 3} more)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingStatusCard;
