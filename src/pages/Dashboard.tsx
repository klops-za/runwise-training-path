
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import TrainingPlanGeneration from '@/components/dashboard/TrainingPlanGeneration';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TrainingPacesCard from '@/components/dashboard/TrainingPacesCard';
import TrainingStatusCard from '@/components/dashboard/TrainingStatusCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import PlanStatusCard from '@/components/dashboard/PlanStatusCard';
import { calculateTrainingPaces } from '@/utils/paceCalculations';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type RunnerData = Database['public']['Tables']['runners']['Row'];
type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [runnerData, setRunnerData] = useState<RunnerData | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [currentWeekWorkouts, setCurrentWeekWorkouts] = useState<Workout[]>([]);

  // Calculate training paces based on fitness score
  const trainingPaces = runnerData?.fitness_score 
    ? calculateTrainingPaces(runnerData.fitness_score)
    : { intervalPace: null, tempoPace: null, easyPace: null };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch runner data
        const { data: runner, error: runnerError } = await supabase
          .from('runners')
          .select('*')
          .eq('id', user.id)
          .single();

        if (runnerError) {
          console.error('Error fetching runner data:', runnerError);
          toast({
            title: "Error",
            description: "Failed to load your profile data.",
            variant: "destructive",
          });
          return;
        }

        setRunnerData(runner);

        // Fetch existing training plan
        const { data: plan, error: planError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('runner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          console.error('Error fetching training plan:', planError);
        } else {
          setTrainingPlan(plan);
          
          // If we have a training plan, fetch current week workouts
          if (plan) {
            const weeksElapsed = plan.start_date 
              ? Math.floor((new Date().getTime() - new Date(plan.start_date).getTime()) / (1000 * 3600 * 24 * 7))
              : 0;
            const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), 16);
            
            const { data: workouts, error: workoutsError } = await supabase
              .from('workouts')
              .select('*')
              .eq('plan_id', plan.id)
              .eq('week_number', currentWeek)
              .order('date', { ascending: true });

            if (workoutsError) {
              console.error('Error fetching workouts:', workoutsError);
            } else {
              setCurrentWeekWorkouts(workouts || []);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const generateTrainingPlan = async () => {
    if (!user || !runnerData) return;

    // Validate required data
    if (!runnerData.race_goal || !runnerData.experience_level || !runnerData.fitness_score || 
        !runnerData.training_days || !runnerData.race_date || !runnerData.training_start_date) {
      toast({
        title: "Missing Information",
        description: "Please complete your profile with race goal, experience level, fitness score, training days, race date, and training start date.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    setGeneratingPlan(true);
    try {
      console.log('Generating training plan for user:', user.id);
      
      const { data, error } = await supabase.rpc('generate_training_plan', {
        runner_uuid: user.id,
        race_type_param: runnerData.race_goal,
        experience_level_param: runnerData.experience_level,
        fitness_score_param: runnerData.fitness_score,
        training_days_param: runnerData.training_days,
        race_date_param: runnerData.race_date,
        training_start_date_param: runnerData.training_start_date
      });

      if (error) {
        console.error('Error generating training plan:', error);
        toast({
          title: "Error",
          description: `Failed to generate training plan: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Training plan generated successfully:', data);
      
      // Fetch the newly created training plan
      const { data: newPlan, error: fetchError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching new training plan:', fetchError);
      } else {
        setTrainingPlan(newPlan);
        
        // Fetch current week workouts for the new plan
        const weeksElapsed = newPlan.start_date 
          ? Math.floor((new Date().getTime() - new Date(newPlan.start_date).getTime()) / (1000 * 3600 * 24 * 7))
          : 0;
        const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), 16);
        
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('*')
          .eq('plan_id', newPlan.id)
          .eq('week_number', currentWeek)
          .order('date', { ascending: true });

        if (workoutsError) {
          console.error('Error fetching workouts:', workoutsError);
        } else {
          setCurrentWeekWorkouts(workouts || []);
        }
      }

      toast({
        title: "Success",
        description: "Your personalized training plan has been generated!",
      });
    } catch (error) {
      console.error('Unexpected error generating training plan:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const convertDistance = (distanceInMiles: number) => {
    if (!runnerData?.preferred_unit || runnerData.preferred_unit === 'mi') {
      return `${distanceInMiles.toFixed(1)} miles`;
    } else {
      const distanceInKm = distanceInMiles * 1.60934;
      return `${distanceInKm.toFixed(1)} km`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!runnerData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Welcome to RunWise!</h1>
            <p className="text-muted-foreground mb-6">Please complete your profile to get started with your training plan.</p>
            <Button 
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              Complete Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate days until race
  const daysUntilRace = runnerData.race_date 
    ? Math.ceil((new Date(runnerData.race_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  // Calculate training progress
  const weeksElapsed = trainingPlan?.start_date 
    ? Math.floor((new Date().getTime() - new Date(trainingPlan.start_date).getTime()) / (1000 * 3600 * 24 * 7))
    : 0;
  const totalWeeks = 16; // Standard training plan length
  const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), totalWeeks);
  const progressPercentage = (currentWeek / totalWeeks) * 100;

  const displayName = runnerData.first_name 
    ? `${runnerData.first_name}${runnerData.last_name ? ' ' + runnerData.last_name : ''}`
    : 'Runner';

  const paceUnit = runnerData.preferred_unit === 'mi' ? 'mile' : 'km';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <WelcomeSection 
          displayName={displayName}
          raceGoal={runnerData.race_goal}
          daysUntilRace={daysUntilRace}
        />

        {!trainingPlan && (
          <TrainingPlanGeneration 
            generatingPlan={generatingPlan}
            onGenerateTrainingPlan={generateTrainingPlan}
          />
        )}

        <StatsGrid 
          runnerData={runnerData}
          daysUntilRace={daysUntilRace}
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          progressPercentage={progressPercentage}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {runnerData.fitness_score && (
              <TrainingPacesCard 
                intervalPace={trainingPaces.intervalPace}
                tempoPace={trainingPaces.tempoPace}
                easyPace={trainingPaces.easyPace}
                paceUnit={paceUnit}
                fitnessScore={runnerData.fitness_score}
              />
            )}

            <TrainingStatusCard 
              trainingPlan={trainingPlan}
              currentWeekWorkouts={currentWeekWorkouts}
              currentWeek={currentWeek}
              generatingPlan={generatingPlan}
              onGenerateTrainingPlan={generateTrainingPlan}
              convertDistance={convertDistance}
            />
          </div>

          <div className="space-y-6">
            <QuickActionsCard 
              trainingPlan={trainingPlan}
              generatingPlan={generatingPlan}
              onGenerateTrainingPlan={generateTrainingPlan}
            />

            {trainingPlan && runnerData && (
              <PlanStatusCard 
                trainingPlan={trainingPlan}
                currentWeek={currentWeek}
                totalWeeks={totalWeeks}
                runnerData={runnerData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
