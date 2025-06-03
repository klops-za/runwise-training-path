
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Calendar, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [hasProfile] = useState(false); // This will be connected to actual user data later

  if (hasProfile) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                RunWise
              </h1>
            </div>
            <Button 
              onClick={() => navigate('/onboarding')}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Intelligent
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent block">
              Running Companion
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Train smarter for your next 5K, 10K, Half Marathon, or Marathon with personalized plans that adapt to your progress.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-200 border-blue-100">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">Smart Training Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Personalized plans based on your VDOT and fitness level that adapt as you progress.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-200 border-orange-100">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-gray-900">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Training schedules that fit your lifestyle with easy workout tracking and adjustments.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-200 border-blue-100">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900">Knowledge Hub</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Expert tips on nutrition, recovery, injury prevention, and mental preparation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-200 border-orange-100">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-gray-900">Personal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your improvements and recalibrate your plan based on real performance data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Run Smarter?</h3>
          <p className="text-xl mb-6 text-blue-50">
            Join thousands of runners who've achieved their goals with RunWise
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
          >
            Create Your Profile
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
