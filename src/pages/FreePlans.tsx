
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Target, Trophy } from 'lucide-react';

const FreePlans = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || 'Couch-to-5K';
  const [selectedPlan, setSelectedPlan] = useState<'Couch-to-5K' | '5K Beginner'>('Couch-to-5K');

  useEffect(() => {
    if (plan === '5K Beginner') {
      setSelectedPlan('5K Beginner');
    }
  }, [plan]);

  const couchTo5KPlan = [
    { week: 1, description: "Alternate 60 seconds of jogging and 90 seconds of walking for 20 minutes" },
    { week: 2, description: "Alternate 90 seconds of jogging and 2 minutes of walking for 20 minutes" },
    { week: 3, description: "Alternate 90 seconds of jogging and 90 seconds of walking, then 3 minutes jogging" },
    { week: 4, description: "Jog 3 minutes, walk 90 seconds, jog 5 minutes, walk 2.5 minutes, jog 3 minutes" },
    { week: 5, description: "Jog 5 minutes, walk 3 minutes, jog 5 minutes, walk 3 minutes, jog 5 minutes" },
    { week: 6, description: "Jog 8 minutes, walk 5 minutes, jog 8 minutes" },
    { week: 7, description: "Jog 25 minutes straight" },
    { week: 8, description: "Jog 30 minutes straight - You did it! 5K ready!" }
  ];

  const fiveKBeginnerPlan = [
    { week: 1, description: "3 easy runs: 20-25 minutes each at conversational pace" },
    { week: 2, description: "3 runs: 2 easy (25-30 min) + 1 tempo (20 min with 10 min faster)" },
    { week: 3, description: "4 runs: 3 easy (25-30 min) + 1 interval (5x2min fast, 90s recovery)" },
    { week: 4, description: "4 runs: 3 easy (30-35 min) + 1 tempo (25 min with 12 min faster)" },
    { week: 5, description: "4 runs: 3 easy (30-35 min) + 1 interval (6x2min fast, 90s recovery)" },
    { week: 6, description: "Race week: 2 easy short runs + 5K race day!" }
  ];

  const currentPlan = selectedPlan === 'Couch-to-5K' ? couchTo5KPlan : fiveKBeginnerPlan;
  const planDetails = selectedPlan === 'Couch-to-5K' 
    ? {
        title: 'Couch-to-5K Training Plan',
        subtitle: 'Go from zero to 5K in 8 weeks',
        duration: '8 weeks',
        frequency: '3 runs per week',
        description: 'Perfect for complete beginners who want to build up to running a full 5K without stopping.'
      }
    : {
        title: '5K Beginner Training Plan', 
        subtitle: 'Improve your 5K performance',
        duration: '6 weeks',
        frequency: '3-4 runs per week',
        description: 'Ideal for those who can already run but want a structured approach to improving their 5K time.'
      };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Free Plan
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            {planDetails.subtitle}
          </p>
          
          {/* Plan Overview Card */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                {planDetails.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">{planDetails.duration}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div>
                  <Target className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">{planDetails.frequency}</p>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                </div>
                <div>
                  <Trophy className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                  <p className="font-semibold">5K Goal</p>
                  <p className="text-sm text-muted-foreground">Target</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{planDetails.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Week by Week Plan */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Week-by-Week Training Plan</h2>
          <div className="grid gap-4">
            {currentPlan.map((weekPlan) => (
              <Card key={weekPlan.week} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-1">
                      Week {weekPlan.week}
                    </Badge>
                    <p className="text-foreground flex-1">{weekPlan.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Important Tips for Success</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Rest days are crucial - don't run on consecutive days initially</li>
                <li>• Listen to your body and don't push through pain</li>
                <li>• Stay hydrated and warm up before each session</li>
                <li>• Focus on completing the time/distance rather than speed</li>
                <li>• Consistency is more important than perfection</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950">
            <CardHeader>
              <CardTitle className="text-2xl">Ready for Personalized Training?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Get personalized pacing, adaptive training plans, progress tracking, and expert guidance with RunWise Pro.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-6 text-sm">
                <div>
                  <strong>✓ Personalized Pacing</strong>
                  <p className="text-muted-foreground">Based on your fitness level</p>
                </div>
                <div>
                  <strong>✓ Adaptive Plans</strong>
                  <p className="text-muted-foreground">Adjusts to your progress</p>
                </div>
                <div>
                  <strong>✓ Expert Guidance</strong>
                  <p className="text-muted-foreground">Professional coaching tips</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                size="lg"
              >
                Upgrade to Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreePlans;
