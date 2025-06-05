import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Circle, Clock, MapPin, Info, RefreshCw, Plus, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import {
  isValidWorkoutStructure,
  type WorkoutStructureJson,
  generateWorkoutDescription,
  calculateWorkoutDistance,
  calculateWorkoutDuration
} from '@/utils/workoutStructures';

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

  // Helper function to calculate week within phase for progression
  const getWeekInPhase = (workout: Workout, trainingPlan: TrainingPlan, allWorkouts: Workout[]) => {
    if (!trainingPlan?.plan_data || !workout.phase) return { weekInPhase: 1, totalPhaseWeeks: 1 };
    
    const planData = trainingPlan.plan_data as any;
    const baseWeeks = planData.base_weeks || 4;
    const buildWeeks = planData.build_weeks || 6;
    const peakWeeks = planData.peak_weeks || 4;
    const taperWeeks = planData.taper_weeks || 1;
    
    // Get all workouts for this phase to determine the week within phase
    const phaseWorkouts = allWorkouts
      .filter(w => w.phase === workout.phase)
      .sort((a, b) => (a.week_number || 0) - (b.week_number || 0));
    
    // Find the position of this workout within its phase
    const workoutIndex = phaseWorkouts.findIndex(w => w.id === workout.id);
    const weekInPhase = Math.floor(workoutIndex / 7) + 1; // Assuming 7 workouts per week
    
    // Get total weeks for this phase
    let totalPhaseWeeks = 1;
    switch (workout.phase) {
      case 'Base':
        totalPhaseWeeks = baseWeeks;
        break;
      case 'Build':
        totalPhaseWeeks = buildWeeks;
        break;
      case 'Peak':
        totalPhaseWeeks = peakWeeks;
        break;
      case 'Taper':
        totalPhaseWeeks = taperWeeks;
        break;
    }
    
    return { 
      weekInPhase: Math.max(1, Math.min(weekInPhase, totalPhaseWeeks)), 
      totalPhaseWeeks 
    };
  };

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
      
      // Get week progression information for this workout and calculate progressive distance
      const { weekInPhase, totalPhaseWeeks } = trainingPlan ? getWeekInPhase(workout, trainingPlan, currentWeekWorkouts) : { weekInPhase: 1, totalPhaseWeeks: 1 };
      
      const calculatedDistance = calculateWorkoutDistance(
        structure, 
        workout.distance_target,
        weekInPhase,
        totalPhaseWeeks
      );
      
      // Use the new unified description generator with race type context and calculated distance
      const generatedDescription = generateWorkoutDescription(
        workout.type || 'Easy', 
        structure, 
        convertDistance,
        calculatedDistance
      );
      
      return generatedDescription || workout.description || 'No description available';
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description || 'No description available';
    }
  };

  const getWorkoutDisplayDistance = (workout: Workout): string | null => {
    if (!workout.details_json || !isValidWorkoutStructure(workout.details_json)) {
      // Fall back to stored distance_target if no valid structure
      return workout.distance_target ? convertDistance(workout.distance_target) : null;
    }
    
    try {
      const structure = workout.details_json as WorkoutStructureJson;
      
      // Get week progression information for this workout
      const { weekInPhase, totalPhaseWeeks } = trainingPlan ? getWeekInPhase(workout, trainingPlan, currentWeekWorkouts) : { weekInPhase: 1, totalPhaseWeeks: 1 };
      
      const calculatedDistance = calculateWorkoutDistance(
        structure, 
        workout.distance_target,
        weekInPhase,
        totalPhaseWeeks
      );
      return convertDistance(calculatedDistance);
    } catch (error) {
      console.error('Error calculating workout distance:', error);
      return workout.distance_target ? convertDistance(workout.distance_target) : null;
    }
  };

  const getWorkoutDisplayDuration = (workout: Workout): number | null => {
    if (!workout.details_json || !isValidWorkoutStructure(workout.details_json)) {
      // Fall back to stored duration if no valid structure
      return workout.duration;
    }
    
    try {
      const structure = workout.details_json as WorkoutStructureJson;
      return calculateWorkoutDuration(structure, workout.duration);
    } catch (error) {
      console.error('Error calculating workout duration:', error);
      return workout.duration;
    }
  };

  const getDetailedWorkoutDescription = (workout: Workout): string => {
    const workoutType = workout.type || 'Easy';
    
    // Base descriptions for different workout types
    const workoutDescriptions: Record<string, { purpose: string; structure: string; benefits: string }> = {
      'Easy': {
        purpose: 'Easy runs form the foundation of your training, building aerobic fitness while allowing your body to recover between harder sessions.',
        structure: 'Run at a comfortable, conversational pace where you could maintain a conversation throughout. Your heart rate should stay in Zone 1-2.',
        benefits: 'Develops aerobic capacity, improves fat metabolism, strengthens tendons and ligaments, and promotes recovery between intense sessions.'
      },
      'Recovery': {
        purpose: 'Recovery runs help flush metabolic waste from your muscles while maintaining fitness with minimal stress on your body.',
        structure: 'Very easy pace, slower than your easy run pace. Focus on gentle movement and relaxed breathing. Can include walk breaks if needed.',
        benefits: 'Enhances blood flow for recovery, maintains aerobic base, reduces muscle stiffness, and prepares your body for the next hard session.'
      },
      'Tempo': {
        purpose: 'Tempo runs improve your lactate threshold - the pace you can sustain for about an hour without accumulating significant lactate.',
        structure: 'Sustained effort at "comfortably hard" pace - about your 10K to half marathon race pace. Should feel controlled but challenging.',
        benefits: 'Increases lactate clearance, improves running economy, builds mental toughness, and enhances your ability to maintain faster paces.'
      },
      'Interval': {
        purpose: 'Interval training targets your VO2 max and neuromuscular power, improving your body\'s ability to deliver and use oxygen efficiently.',
        structure: 'Short to medium bursts of high-intensity running followed by recovery periods. Work intervals typically at 3K-5K race pace or faster.',
        benefits: 'Maximizes oxygen uptake, improves running speed, enhances cardiac output, and builds tolerance to lactate accumulation.'
      },
      'Long': {
        purpose: 'Long runs build endurance, teach your body to burn fat efficiently, and prepare you mentally and physically for race distance.',
        structure: 'Extended duration at easy to moderate effort. May include progression or tempo segments depending on your training phase.',
        benefits: 'Develops mitochondrial density, improves glycogen storage, strengthens running muscles, and builds mental resilience for longer distances.'
      },
      'Hill': {
        purpose: 'Hill repeats develop leg strength, power, and running economy while reducing injury risk compared to flat speed work.',
        structure: 'Short to medium uphill efforts at hard effort (5K pace feel) followed by easy recovery jogs or walks back down.',
        benefits: 'Builds leg strength and power, improves running form, enhances neuromuscular coordination, and increases resistance to fatigue.'
      },
      'Cross-training': {
        purpose: 'Cross-training maintains cardiovascular fitness while giving your running muscles a break and reducing injury risk.',
        structure: 'Non-running aerobic activity such as cycling, swimming, elliptical, or rowing at moderate to hard effort.',
        benefits: 'Maintains fitness while reducing impact stress, works different muscle groups, prevents overuse injuries, and adds variety to training.'
      }
    };

    const description = workoutDescriptions[workoutType] || workoutDescriptions['Easy'];
    
    // Add structure-specific details if available
    let structureDetails = '';
    if (workout.details_json && isValidWorkoutStructure(workout.details_json)) {
      const structure = workout.details_json as WorkoutStructureJson;
      const mainSegment = structure.main[0];
      
      if (mainSegment?.reps && mainSegment?.distance) {
        const distanceInMeters = (mainSegment.distance * 1000).toFixed(0);
        const restTime = mainSegment.rest || 90;
        structureDetails = `\n\nToday's Structure: ${mainSegment.reps} repetitions of ${distanceInMeters}m with ${restTime} seconds recovery between each repeat.`;
      } else if (mainSegment?.segments && mainSegment.segments.length > 1) {
        structureDetails = `\n\nToday's Structure: This workout includes ${mainSegment.segments.length} different segments with varying paces and intensities.`;
      }
    }

    return `**Purpose:** ${description.purpose}\n\n**How to Execute:** ${description.structure}\n\n**Benefits:** ${description.benefits}${structureDetails}`;
  };

  const showWorkoutDetails = (workout: Workout) => {
    // This function is no longer needed since we're using the Dialog component directly
    return;
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
            {currentWeekWorkouts.map((workout) => {
              const displayDistance = getWorkoutDisplayDistance(workout);
              const displayDuration = getWorkoutDisplayDuration(workout);
              const detailedDescription = getDetailedWorkoutDescription(workout);
              
              return (
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

                        <div className="text-card-foreground mb-3">{getWorkoutDisplayDescription(workout)}</div>

                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                          {displayDuration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {displayDuration} min
                            </div>
                          )}
                          {displayDistance && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {displayDistance}
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-border hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">
                                {workout.type} Training Session
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="whitespace-pre-line text-sm leading-relaxed">
                                {detailedDescription.replace(/\*\*/g, '')}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingStatusCard;
