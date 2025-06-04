
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Clock, MapPin, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];

interface TrainingStatusCardProps {
  trainingPlan: TrainingPlan | null;
  currentWeekWorkouts: Workout[];
  currentWeek: number;
  generatingPlan: boolean;
  onGenerateTrainingPlan: () => void;
  convertDistance: (distance: number) => string;
}

const TrainingStatusCard = ({ 
  trainingPlan, 
  currentWeekWorkouts, 
  currentWeek, 
  generatingPlan, 
  onGenerateTrainingPlan,
  convertDistance 
}: TrainingStatusCardProps) => {
  const navigate = useNavigate();

  // Check if training has started based on start date
  const today = new Date();
  const trainingStartDate = trainingPlan?.start_date ? new Date(trainingPlan.start_date) : null;
  const hasTrainingStarted = trainingStartDate ? today >= trainingStartDate : false;
  const daysUntilStart = trainingStartDate && !hasTrainingStarted 
    ? Math.ceil((trainingStartDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    : 0;

  // Get last completed session and next two upcoming sessions
  const today_date = new Date().toISOString().split('T')[0];
  const allWorkouts = [...currentWeekWorkouts].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const lastCompletedSession = allWorkouts
    .filter(workout => workout.status === 'Completed' || (workout.date && workout.date < today_date))
    .pop();

  const upcomingSessions = allWorkouts
    .filter(workout => workout.date && workout.date >= today_date && workout.status !== 'Completed')
    .slice(0, 2);

  const formatWorkoutDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const WorkoutDisplay = ({ workout, isCompleted = false }: { workout: Workout, isCompleted?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isCompleted 
        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
    }`}>
      <div className="flex items-center space-x-3">
        {isCompleted && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
        {!isCompleted && <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        <div>
          <div className={`font-medium text-sm ${
            isCompleted 
              ? 'text-green-900 dark:text-green-100'
              : 'text-blue-900 dark:text-blue-100'
          }`}>
            {workout.type}
          </div>
          <div className={`text-xs flex items-center space-x-3 ${
            isCompleted 
              ? 'text-green-700 dark:text-green-300'
              : 'text-blue-700 dark:text-blue-300'
          }`}>
            {workout.date && (
              <span>{formatWorkoutDate(workout.date)}</span>
            )}
            {workout.duration && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {workout.duration}min
              </span>
            )}
            {workout.distance_target && (
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {convertDistance(workout.distance_target)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`text-xs px-2 py-1 rounded-full ${
        isCompleted 
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      }`}>
        {isCompleted ? 'Completed' : workout.status}
      </div>
    </div>
  );

  return (
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
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              hasTrainingStarted 
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            }`}>
              <div>
                <div className={`font-medium ${
                  hasTrainingStarted 
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  {hasTrainingStarted ? 'Training Plan Active' : 'Training Plan Scheduled'}
                </div>
                <div className={`text-sm flex items-center ${
                  hasTrainingStarted 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {hasTrainingStarted 
                    ? `Started: ${trainingStartDate.toLocaleDateString()}`
                    : `Starts: ${trainingStartDate.toLocaleDateString()} (${daysUntilStart} days)`
                  }
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                hasTrainingStarted 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                {hasTrainingStarted ? '✓ Active' : '⏳ Scheduled'}
              </div>
            </div>
            
            {hasTrainingStarted && (
              <div className="space-y-3">
                {lastCompletedSession && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Completed</h4>
                    <WorkoutDisplay workout={lastCompletedSession} isCompleted={true} />
                  </div>
                )}

                {upcomingSessions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      {upcomingSessions.length === 1 ? 'Next Session' : 'Next Sessions'}
                    </h4>
                    <div className="space-y-2">
                      {upcomingSessions.map((workout) => (
                        <WorkoutDisplay key={workout.id} workout={workout} />
                      ))}
                    </div>
                  </div>
                )}

                {currentWeekWorkouts.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
                      View All {currentWeekWorkouts.length} Sessions This Week
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!hasTrainingStarted && (
              <div className="text-sm text-muted-foreground">
                Your personalized {trainingPlan.race_type || 'running'} training plan is ready and will begin on {trainingStartDate?.toLocaleDateString()}. 
                Your weekly schedule will be available once training starts.
              </div>
            )}

            {hasTrainingStarted && !lastCompletedSession && upcomingSessions.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Your personalized {trainingPlan.race_type || 'running'} training plan is active! 
                View your weekly schedule to see your workouts.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No training plan generated yet.</p>
            <Button 
              onClick={onGenerateTrainingPlan}
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
  );
};

export default TrainingStatusCard;
