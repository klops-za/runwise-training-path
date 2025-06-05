import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, CheckCircle, Circle, Info } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { 
  isValidWorkoutStructure, 
  type WorkoutStructureJson, 
  generateWorkoutDescription,
  calculateWorkoutDuration
} from '@/utils/workoutStructures';

type Workout = Database['public']['Tables']['workouts']['Row'];
type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type Runner = Database['public']['Tables']['runners']['Row'];

const TrainingSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [runner, setRunner] = useState<Runner | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalWeeks, setTotalWeeks] = useState(16); // Default to 16, will be updated

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!user) return;

      try {
        // Fetch the runner's profile to get unit preference
        const { data: runnerData, error: runnerError } = await supabase
          .from('runners')
          .select('*')
          .eq('id', user.id)
          .single();

        if (runnerError) {
          console.error('Error fetching runner profile:', runnerError);
        } else {
          setRunner(runnerData);
        }

        // Fetch the user's training plan
        const { data: plan, error: planError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('runner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          console.error('Error fetching training plan:', planError);
          toast({
            title: "Error",
            description: "Failed to load your training plan.",
            variant: "destructive",
          });
          return;
        }

        if (!plan) {
          setLoading(false);
          return;
        }

        setTrainingPlan(plan);

        // Calculate total weeks from plan data
        if (plan.plan_data) {
          const planData = plan.plan_data as any;
          const baseWeeks = planData.base_weeks || 4;
          const buildWeeks = planData.build_weeks || 6;
          const peakWeeks = planData.peak_weeks || 4;
          const taperWeeks = planData.taper_weeks || 1;
          const calculatedTotalWeeks = baseWeeks + buildWeeks + peakWeeks + taperWeeks;
          setTotalWeeks(calculatedTotalWeeks);
          console.log('Calculated total weeks:', calculatedTotalWeeks);
        }

        // Calculate current week based on training start date
        if (plan.start_date) {
          const startDate = new Date(plan.start_date);
          const currentDate = new Date();
          const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const currentWeek = Math.max(1, Math.min(totalWeeks, weeksDiff + 1));
          setSelectedWeek(currentWeek);
        }

        // Fetch workouts for the training plan
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('plan_id', plan.id)
          .order('date', { ascending: true });

        if (workoutError) {
          console.error('Error fetching workouts:', workoutError);
          toast({
            title: "Error",
            description: "Failed to load workouts.",
            variant: "destructive",
          });
          return;
        }

        setWorkouts(workoutData || []);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [user, toast]);

  const convertDistance = (distanceInKm: number) => {
    if (!runner?.preferred_unit || runner.preferred_unit === 'km') {
      return `${distanceInKm.toFixed(1)} km`;
    } else {
      const distanceInMiles = distanceInKm * 0.621371;
      return `${distanceInMiles.toFixed(1)} miles`;
    }
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
      
      // Fix the type casting by going through unknown first
      const structure = detailsData as unknown as WorkoutStructureJson;
      
      // Use the database distance_target directly (already in km)
      const distanceKm = workout.distance_target;
      
      // Use the enhanced generateWorkoutDescription function with distance in km
      const generatedDescription = generateWorkoutDescription(
        workout.type as any,
        structure,
        convertDistance,
        distanceKm
      );
      
      return generatedDescription;
    } catch (error) {
      console.error('Error parsing workout structure:', error);
      return workout.description || 'No description available';
    }
  };

  const getWorkoutDisplayDistance = (workout: Workout): string | null => {
    // For intervals and hill workouts, show distance in meters instead of km/miles
    if ((workout.type?.toLowerCase() === 'interval' || workout.type?.toLowerCase() === 'hill') && workout.distance_target) {
      const distanceInMeters = Math.round(workout.distance_target * 1000);
      return `${distanceInMeters}m`;
    }
    
    // Use distance_target from database as primary and only source (already in km)
    if (workout.distance_target) {
      return convertDistance(workout.distance_target);
    }
    
    return null;
  };

  const getWorkoutDisplayDuration = (workout: Workout): number | null => {
    if (!workout.details_json || !isValidWorkoutStructure(workout.details_json)) {
      // Fall back to stored duration if no valid structure
      return workout.duration;
    }
    
    try {
      const structure = workout.details_json as unknown as WorkoutStructureJson;
      return calculateWorkoutDuration(structure, workout.duration);
    } catch (error) {
      console.error('Error calculating workout duration:', error);
      return workout.duration;
    }
  };

  const toggleWorkoutStatus = async (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
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

      // Update local state
      setWorkouts(prev => prev.map(w => 
        w.id === workoutId ? { ...w, status: newStatus } : w
      ));

      toast({
        title: "Success",
        description: `Workout marked as ${newStatus.toLowerCase()}.`,
      });
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
      const structure = workout.details_json as unknown as WorkoutStructureJson;
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

  // Filter workouts for selected week
  const weekWorkouts = workouts.filter(workout => workout.week_number === selectedWeek);

  // Calculate week summary with values from database
  const completedWorkouts = weekWorkouts.filter(w => w.status === 'Completed').length;
  const totalWorkouts = weekWorkouts.length;
  
  // Calculate total distance using database distance_target values
  const totalDistanceKm = weekWorkouts.reduce((sum, workout) => {
    // Use distance_target from database (already in km)
    if (workout.distance_target) {
      return sum + workout.distance_target;
    }
    return sum;
  }, 0);
  
  const totalDistance = runner?.preferred_unit === 'mi' ? 
    (totalDistanceKm * 0.621371).toFixed(1) : 
    totalDistanceKm.toFixed(1);
  const distanceUnit = runner?.preferred_unit === 'mi' ? 'miles' : 'km';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trainingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No Training Plan Found</h1>
            <p className="text-muted-foreground mb-6">Generate a training plan from your dashboard to view your schedule.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Training Schedule</h1>
          <p className="text-muted-foreground">Week {selectedWeek} of {totalWeeks} - {trainingPlan?.race_type || 'Running'} Training</p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek === 1}
              className="border-border"
            >
              Previous Week
            </Button>
            <span className="px-4 py-2 bg-card rounded-lg border border-border font-medium text-foreground">
              Week {selectedWeek}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.min(totalWeeks, selectedWeek + 1))}
              disabled={selectedWeek === totalWeeks}
              className="border-border"
            >
              Next Week
            </Button>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid gap-4">
          {weekWorkouts.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No workouts scheduled for this week.</p>
              </CardContent>
            </Card>
          ) : (
            weekWorkouts.map((workout) => {
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
            })
          )}
        </div>

        {/* Week Summary */}
        <Card className="mt-8 border-blue-100 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-foreground">Week {selectedWeek} Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalDistance}</div>
                <div className="text-sm text-muted-foreground">Total {distanceUnit}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalWorkouts}</div>
                <div className="text-sm text-muted-foreground">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedWorkouts}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">{totalWorkouts - completedWorkouts}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingSchedule;
