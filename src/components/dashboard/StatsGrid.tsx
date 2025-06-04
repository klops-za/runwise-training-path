
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type RunnerData = Database['public']['Tables']['runners']['Row'];

interface StatsGridProps {
  runnerData: RunnerData;
  daysUntilRace: number | null;
  currentWeek: number;
  totalWeeks: number;
  progressPercentage: number;
}

const StatsGrid = ({ runnerData, daysUntilRace, currentWeek, totalWeeks, progressPercentage }: StatsGridProps) => {
  return (
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
  );
};

export default StatsGrid;
