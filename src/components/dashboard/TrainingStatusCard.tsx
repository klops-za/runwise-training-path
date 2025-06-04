
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Plus, RefreshCw, CheckCircle, Circle, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  onWorkoutUpdate?: () => void;
}

const TrainingStatusCard = ({ 
  trainingPlan, 
  currentWeekWorkouts, 
  currentWeek, 
  generatingPlan, 
  onGenerateTrainingPlan,
  convertDistance,
  onWorkoutUpdate
}: TrainingStatusCardProps) => {
  const { toast } = useToast();

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
          phases.push(`${mainSegment.reps}x${(mainSegment.distance * 1609).toFixed(0)}m @ ${mainSegment.pace || 'interval'} pace`);
        } else if (workout.type === 'Tempo' && mainSegment?.distance) {
          phases.push(`${convertDistance(mainSegment.distance)} @ ${mainSegment.pace || 'tempo'} pace`);
        } else if (workout.type === 'Hill' && mainSegment?.reps && mainSegment?.duration) {
          phases.push(`${mainSegment.reps}x${mainSegment.duration}s hill repeats`);
        } else if (mainSegment?.distance) {
          phases.push(`${convertDistance(mainSegment.distance)} @ ${mainSegment.pace || 'easy'} pace`);
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
      
      return structure.description || workout.description || 'No description available';
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description || 'No description available';
    }
  };

  const toggleWorkoutStatus = async (workoutId: string) => {
    const workout = currentWeekWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    const newStatus = workout.status === 'Completed' ? 'Pending' : 'Completed';

    try {
      const { error } = await supabase
        .from('workouts')
        .update({ status: newStatus })
        .eq('id', workoutId);

      if (error) {
        console.error('Error updating workout status:', error);
        toast({
          title: "Error",
          description: "Failed to update workout status.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Workout marked as ${newStatus.toLowerCase()}.`,
      });

      // Call the callback to refresh data
      if (onWorkoutUpdate) {
        onWorkoutUpdate();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Completed' ? (
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    ) : (
      <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    );
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
            {currentWeekWorkouts.map((workout) => (
              <Card key={workout.id} className={`border transition-all duration-200 hover:shadow-md ${
                workout.status === 'Completed' 
                  ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30' 
                  : 'border-border'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <button 
                          onClick={() => toggleWorkoutStatus(workout.id)}
                          className="flex-shrink-0"
                        >
                          {getStatusIcon(workout.status || 'Pending')}
                        </button>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{workout.type || 'Workout'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workout.date ? new Date(workout.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'Date TBD'}
                          </p>
                        </div>
                        
                        {workout.intensity && (
                          <Badge className={getIntensityColor(workout.intensity)}>
                            {workout.intensity}
                          </Badge>
                        )}
                      </div>

                      <div className="text-card-foreground mb-3 whitespace-pre-line">{getWorkoutDisplayDescription(workout)}</div>

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
                      </div>

                      {workout.notes && (
                        <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Notes:</strong> {workout.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {workout.status !== 'Completed' && (
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" className="border-border">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingStatusCard;
