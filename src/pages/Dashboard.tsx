
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp, Settings, RefreshCw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import type { Database } from '@/integrations/supabase/types';

type RunnerData = Database['public']['Tables']['runners']['Row'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [runnerData, setRunnerData] = useState<RunnerData | null>(null);

  useEffect(() => {
    const fetchRunnerData = async () => {
      if (!user) return;

      try {
        const { data: runner, error } = await supabase
          .from('runners')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching runner data:', error);
          toast({
            title: "Error",
            description: "Failed to load your profile data.",
            variant: "destructive",
          });
          return;
        }

        setRunnerData(runner);
      } catch (error) {
        console.error('Unexpected error fetching runner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRunnerData();
  }, [user, toast]);

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

  if (!runnerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RunWise!</h1>
            <p className="text-gray-600 mb-6">Please complete your profile to get started with your training plan.</p>
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

  // Calculate training progress (mock calculation for now)
  const weeksElapsed = runnerData.training_start_date 
    ? Math.floor((new Date().getTime() - new Date(runnerData.training_start_date).getTime()) / (1000 * 3600 * 24 * 7))
    : 0;
  const totalWeeks = 16; // Standard training plan length
  const currentWeek = Math.min(weeksElapsed + 1, totalWeeks);
  const progressPercentage = (currentWeek / totalWeeks) * 100;

  // Mock recent workouts (will be replaced with real data from training plans later)
  const recentWorkouts = [
    { date: "2024-01-15", type: "Easy Run", distance: "5 miles", status: "completed" },
    { date: "2024-01-13", type: "Tempo Run", distance: "4 miles", status: "completed" },
    { date: "2024-01-11", type: "Long Run", distance: "8 miles", status: "completed" }
  ];

  const displayName = runnerData.first_name 
    ? `${runnerData.first_name}${runnerData.last_name ? ' ' + runnerData.last_name : ''}`
    : 'Runner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-600">
            {runnerData.race_goal && daysUntilRace ? (
              <>You're training for a {runnerData.race_goal} in {daysUntilRace} days</>
            ) : runnerData.race_goal ? (
              <>You're training for a {runnerData.race_goal}</>
            ) : (
              <>Ready to start your training journey?</>
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Race Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {runnerData.race_goal || 'Not Set'}
              </div>
              <p className="text-sm text-gray-500">
                {daysUntilRace ? `${daysUntilRace} days to go` : 'Set your race date'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                Week {currentWeek}/{totalWeeks}
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                Weekly Mileage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {runnerData.weekly_mileage ? `${runnerData.weekly_mileage} ${runnerData.preferred_unit || 'mi'}` : 'Not Set'}
              </div>
              <p className="text-sm text-gray-500">Current target</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-600" />
                VDOT Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {runnerData.vdot || 'Not Set'}
              </div>
              <p className="text-sm text-gray-500">Current fitness</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Week Overview */}
          <div className="lg:col-span-2">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>This Week's Training</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/schedule')}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    View Full Schedule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWorkouts.map((workout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{workout.type}</div>
                        <div className="text-sm text-gray-600">{workout.distance} • {workout.date}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        workout.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {workout.status === 'completed' ? '✓ Completed' : 'Scheduled'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-orange-100">
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
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalibrate Plan
                </Button>
                
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

            {/* Recent Achievement */}
            {runnerData.weekly_mileage && (
              <Card className="border-green-100 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Profile Complete!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-green-700">
                    <p className="font-medium">Ready to Train!</p>
                    <p className="text-sm">
                      Your profile is set up for {runnerData.race_goal || 'running'} training. 
                      {runnerData.weekly_mileage && ` Current target: ${runnerData.weekly_mileage} ${runnerData.preferred_unit || 'mi'}/week.`}
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
