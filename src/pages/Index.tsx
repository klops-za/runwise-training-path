
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Calendar, Trophy, BarChart3 } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Welcome back to RunWise
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Ready to continue your training journey?
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full mr-4"></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              RunWise
            </h1>
          </div>
          <p className="text-2xl text-gray-700 mb-4">Your Intelligent Running Companion</p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Train smarter for your next 5K, 10K, Half Marathon, or Marathon with personalized plans that adapt to your progress.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-blue-900">Personalized Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Tailored training plans based on your fitness level, goals, and schedule.</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-900">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Flexible scheduling that adapts to your life and training preferences.</p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-blue-900">Race Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Proven training methods to get you race-ready for any distance.</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-900">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Monitor your progress and adjust your training as you improve.</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
