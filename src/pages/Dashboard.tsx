
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { calculatePaces } from '@/utils/paceCalculations';
import StatsGrid from '@/components/dashboard/StatsGrid';
import TrainingPacesCard from '@/components/dashboard/TrainingPacesCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import WorkoutDetailsCard from '@/components/dashboard/WorkoutDetailsCard';
import TrainingStatusCard from '@/components/dashboard/TrainingStatusCard';
import PlanStatusCard from '@/components/dashboard/PlanStatusCard';
import TrainingPlanGeneration from '@/components/dashboard/TrainingPlanGeneration';
import { differenceInDays } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type RunnerData = Database['public']['Tables']['runners']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runnerData, setRunnerData] = useState<RunnerData | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate derived values
  const currentWeek = trainingPlan?.current_week || 1;
  const totalWeeks = trainingPlan?.plan_data?.total_weeks || 12;
  const progressPercentage = Math.round((currentWeek / totalWeeks) * 100);
  
  const daysUntilRace = runnerData?.race_date 
    ? differenceInDays(new Date(runnerData.race_date), new Date()) 
    : null;

  // Calculate training paces based on fitness score
  const paces = runnerData?.fitness_score 
    ? calculatePaces(runnerData.fitness_score) 
    : { intervalPace: null, tempoPace: null, easyPace: null };

  // Helper function to convert distances based on user's preferred unit
  const convertDistance = (distanceInKm: number): string => {
    if (!runnerData || !distanceInKm) return '';
    
    if (runnerData.preferred_unit === 'mi') {
      const miles = distanceInKm * 0.621371;
      return `${miles.toFixed(2)} mi`;
    }
    return `${distanceInKm.toFixed(2)} km`;
  };

  // Refresh the data when needed
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle plan generation
  const handlePlanGenerated = () => {
    handleRefresh();
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch runner data
        const { data: runnerData, error: runnerError } = await supabase
          .from('runners')
          .select('*')
          .eq('id', user.id)
          .single();

        if (runnerError) {
          console.error('Error fetching runner data:', runnerError);
          throw new Error('Failed to fetch runner data');
        }

        setRunnerData(runnerData);

        // Fetch active training plan
        const { data: planData, error: planError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('runner_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (planError) {
          console.error('Error fetching training plan:', planError);
          throw new Error('Failed to fetch training plan');
        }

        const activePlan = planData?.[0] || null;
        setTrainingPlan(activePlan);

        // Fetch workouts for the active plan and current week
        if (activePlan) {
          const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .select('*')
            .eq('plan_id', activePlan.id)
            .eq('week_number', activePlan.current_week)
            .order('date', { ascending: true });

          if (workoutError) {
            console.error('Error fetching workouts:', workoutError);
            throw new Error('Failed to fetch workouts');
          }

          setWorkouts(workoutData || []);
        }

      } catch (error: any) {
        console.error('Dashboard data loading error:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, navigate, refreshKey]);

  // Show loading state while authentication is checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Loading state while data is being fetched, but with navigation
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show the onboarding redirect if no runner data
  if (!runnerData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
          <p className="mb-8 text-lg">
            We need a bit more information to personalize your running experience.
          </p>
          <button 
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md"
          >
            Continue to Profile Setup
          </button>
        </div>
      </div>
    );
  }

  // Determine display name (first name or email)
  const displayName = runnerData.first_name || user?.email?.split('@')[0] || 'Runner';

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 py-8">
        
        {/* Welcome Section */}
        <WelcomeSection 
          displayName={displayName}
          raceGoal={runnerData.race_goal}
          daysUntilRace={daysUntilRace}
        />

        {/* Stats Grid */}
        <StatsGrid
          runnerData={runnerData}
          trainingPlan={trainingPlan}
          daysUntilRace={daysUntilRace}
          currentWeek={currentWeek}
          totalWeeks={totalWeeks}
          progressPercentage={progressPercentage}
        />

        {/* Main Dashboard Content */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Training Plan Status or Generation */}
            {trainingPlan ? (
              <PlanStatusCard
                trainingPlan={trainingPlan}
                currentWeek={currentWeek}
                totalWeeks={totalWeeks}
                runnerData={runnerData}
              />
            ) : (
              <TrainingPlanGeneration
                runner={runnerData}
                onPlanGenerated={handlePlanGenerated}
              />
            )}

            {/* Quick Actions */}
            <QuickActionsCard
              trainingPlan={trainingPlan}
              generatingPlan={generatingPlan}
              onGenerateTrainingPlan={() => {}}
            />
          </div>

          {/* Middle and Right Columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Training Paces Card */}
            {runnerData.fitness_score && (
              <TrainingPacesCard
                intervalPace={paces.intervalPace}
                tempoPace={paces.tempoPace}
                easyPace={paces.easyPace}
                paceUnit={runnerData.preferred_unit || 'km'}
                fitnessScore={runnerData.fitness_score}
              />
            )}

            {/* Training Status */}
            <TrainingStatusCard
              hasActivePlan={!!trainingPlan}
              workouts={workouts}
              convertDistance={convertDistance}
            />

            {/* Today's Workout */}
            {workouts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Workouts This Week</h2>
                <div className="space-y-4">
                  {workouts.slice(0, 3).map((workout) => (
                    <WorkoutDetailsCard
                      key={workout.id}
                      workout={workout}
                      convertDistance={convertDistance}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
