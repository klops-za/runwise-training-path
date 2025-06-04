
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, CheckCircle, Circle, Play } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Workout = Database['public']['Tables']['workouts']['Row'];
type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];

const TrainingSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!user) return;

      try {
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

        // Calculate current week based on training start date
        if (plan.start_date) {
          const startDate = new Date(plan.start_date);
          const currentDate = new Date();
          const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const currentWeek = Math.max(1, Math.min(16, weeksDiff + 1));
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
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Completed' ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <Circle className="h-5 w-5 text-gray-400" />
    );
  };

  // Filter workouts for selected week
  const weekWorkouts = workouts.filter(workout => workout.week_number === selectedWeek);

  // Calculate week summary
  const completedWorkouts = weekWorkouts.filter(w => w.status === 'Completed').length;
  const totalWorkouts = weekWorkouts.length;
  const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.distance_target || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Training Plan Found</h1>
            <p className="text-gray-600 mb-6">Generate a training plan from your dashboard to view your schedule.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Schedule</h1>
          <p className="text-gray-600">Week {selectedWeek} of 16 - {trainingPlan.race_type || 'Running'} Training</p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek === 1}
            >
              Previous Week
            </Button>
            <span className="px-4 py-2 bg-white rounded-lg border font-medium">
              Week {selectedWeek}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.min(16, selectedWeek + 1))}
              disabled={selectedWeek === 16}
            >
              Next Week
            </Button>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid gap-4">
          {weekWorkouts.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No workouts scheduled for this week.</p>
              </CardContent>
            </Card>
          ) : (
            weekWorkouts.map((workout) => (
              <Card key={workout.id} className={`border transition-all duration-200 hover:shadow-md ${
                workout.status === 'Completed' ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
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
                          <h3 className="text-lg font-semibold text-gray-900">{workout.type || 'Workout'}</h3>
                          <p className="text-sm text-gray-600">
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

                      <p className="text-gray-700 mb-3">{workout.description || 'No description available'}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        {workout.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {workout.duration} min
                          </div>
                        )}
                        {workout.distance_target && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {workout.distance_target} miles
                          </div>
                        )}
                      </div>

                      {workout.notes && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
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
                      
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Week Summary */}
        <Card className="mt-8 border-blue-100">
          <CardHeader>
            <CardTitle>Week {selectedWeek} Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Total Miles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{totalWorkouts}</div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedWorkouts}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{totalWorkouts - completedWorkouts}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingSchedule;
