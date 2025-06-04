
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp, Settings, RefreshCw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - this will come from Supabase later
  const runnerData = {
    name: "John Runner",
    race_goal: "Half Marathon",
    race_date: "2024-04-15",
    current_week: 8,
    total_weeks: 16,
    weekly_mileage: 25,
    vdot: 42,
    recent_workouts: [
      { date: "2024-01-15", type: "Easy Run", distance: "5 miles", status: "completed" },
      { date: "2024-01-13", type: "Tempo Run", distance: "4 miles", status: "completed" },
      { date: "2024-01-11", type: "Long Run", distance: "8 miles", status: "completed" }
    ]
  };

  const daysUntilRace = Math.ceil((new Date("2024-04-15").getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const progressPercentage = (runnerData.current_week / runnerData.total_weeks) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {runnerData.name}! 👋
          </h1>
          <p className="text-gray-600">
            You're training for a {runnerData.race_goal} in {daysUntilRace} days
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
              <div className="text-2xl font-bold text-gray-900">{runnerData.race_goal}</div>
              <p className="text-sm text-gray-500">{daysUntilRace} days to go</p>
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
                Week {runnerData.current_week}/{runnerData.total_weeks}
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
              <div className="text-2xl font-bold text-gray-900">{runnerData.weekly_mileage} mi</div>
              <p className="text-sm text-gray-500">This week</p>
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
              <div className="text-2xl font-bold text-gray-900">{runnerData.vdot}</div>
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
                  {runnerData.recent_workouts.map((workout, index) => (
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
            <Card className="border-green-100 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Recent Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-green-700">
                  <p className="font-medium">Longest Run Yet!</p>
                  <p className="text-sm">You completed your 8-mile long run this week - that's a new personal best for training!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
