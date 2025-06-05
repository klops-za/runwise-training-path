
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Calendar, Trophy, BarChart3, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('runners')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && profile) {
            // Redirect existing users directly to dashboard
            navigate('/dashboard');
            return;
          } else {
            // User doesn't have a profile, redirect to onboarding
            navigate('/onboarding');
            return;
          }
        } catch (error) {
          console.error('Error checking user profile:', error);
          // If there's an error, assume they need onboarding
          navigate('/onboarding');
          return;
        }
      }
      setProfileLoading(false);
    };

    if (!loading) {
      checkUserProfile();
    }
  }, [user, loading, navigate]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This component will only render for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full mr-4"></div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              RunWise
            </h1>
          </div>
          <p className="text-2xl text-foreground mb-4">Your Intelligent Running Companion</p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Train smarter for your next 5K, 10K, Half Marathon, or Marathon with personalized plans that adapt to your progress.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={() => navigate('/get-started')}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
              size="lg"
            >
              <Gift className="mr-2 h-5 w-5" />
              Get Free Plan
            </Button>
            <Button 
              onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              size="lg"
            >
              Start Full Training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-blue-900 dark:text-blue-100">Personalized Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">Tailored training plans based on your fitness level, goals, and schedule.</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-900 dark:text-orange-100">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">Flexible scheduling that adapts to your life and training preferences.</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-blue-900 dark:text-blue-100">Race Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">Proven training methods to get you race-ready for any distance.</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-900 dark:text-orange-100">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">Monitor your progress and adjust your training as you improve.</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto" id="auth-form">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
