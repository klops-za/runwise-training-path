
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type RunnerData = Database['public']['Tables']['runners']['Row'];

interface PlanStatusCardProps {
  trainingPlan: TrainingPlan;
  currentWeek: number;
  totalWeeks: number;
  runnerData: RunnerData;
}

const PlanStatusCard = ({ trainingPlan, currentWeek, totalWeeks, runnerData }: PlanStatusCardProps) => {
  return (
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
  );
};

export default PlanStatusCard;
