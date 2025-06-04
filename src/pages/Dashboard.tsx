import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp, Settings, RefreshCw, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import type { Database } from '@/integrations/supabase/types';

type RunnerData = Database['public']['Tables']['runners']['Row'];
type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [runnerData, setRunnerData] = useState<RunnerData | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);

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

    setGeneratingPlan(true);
    try {
      console.log('Generating training plan for user:', user.id);
      
      const { data, error } = await supabase.rpc('generate_training_plan', {
        runner_uuid: user.id
      });

      if (error) {
        console.error('Error generating training plan:', error);
        toast({
          title: "Error",
          description: "Failed to generate training plan. Please try again.",
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {runnerData.race_goal && daysUntilRace ? (
              <>You're training for a {runnerData.race_goal} in {daysUntilRace} days</>
            ) : runnerData.race_goal ? (
              <>You're training for a {runnerData.race_goal}</>
            ) : (
              <>Ready to start your training journey?</>
            )}
          </p>
        </div>

        {/* Training Plan Generation Section */}
        {!trainingPlan && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Generate Your Training Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Ready to start training? Generate a personalized 16-week training plan based on your profile.
              </p>
              <Button 
                onClick={generateTrainingPlan}
                disabled={generatingPlan}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
              >
                {generatingPlan ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Training Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Race Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {runnerData.race_goal || 'Not Set'}
              </div>
              <p className="text-sm text-muted-foreground">
                {daysUntilRace ? `${daysUntilRace} days to go` : 'Set your race date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                Week {currentWeek}/{totalWeeks}
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                Weekly Mileage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {runnerData.weekly_mileage ? `${runnerData.weekly_mileage} ${runnerData.preferred_unit || 'mi'}` : 'Not Set'}
              </div>
              <p className="text-sm text-muted-foreground">Current target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-600" />
                Fitness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {runnerData.fitness_score || 'Not Set'}
              </div>
              <p className="text-sm text-muted-foreground">Current fitness</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Training Plan Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Training Status</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/schedule')}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    View Schedule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainingPlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">Training Plan Active</div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          Started: {new Date(trainingPlan.start_date || '').toLocaleDateString()}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        ✓ Generated
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your personalized {trainingPlan.race_type || 'running'} training plan is ready! 
                      View your weekly schedule to see today's workout.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No training plan generated yet.</p>
                    <Button 
                      onClick={generateTrainingPlan}
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
                          Generate Training Plan
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
                  onClick={() => navigate('/schedule')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Training Schedule
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                
                {trainingPlan && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={generateTrainingPlan}
                    disabled={generatingPlan}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Plan
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/knowledge')}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Knowledge Hub
                </Button>
              </CardContent>
            </Card>

            {/* Plan Status */}
            {trainingPlan && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200">Training Plan Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-green-700 dark:text-green-300">
                    <p className="font-medium">Week {currentWeek} of {totalWeeks}</p>
                    <p className="text-sm">
                      Your {trainingPlan.race_type || 'running'} training plan is personalized 
                      for your {runnerData.experience_level?.toLowerCase() || 'current'} level.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
