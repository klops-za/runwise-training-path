
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Clock, MapPin, Calendar } from 'lucide-react';
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
            
            {/* This Week's Sessions - only show if training has started */}
            {hasTrainingStarted && currentWeekWorkouts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">This Week's Sessions (Week {currentWeek})</h4>
                <div className="space-y-2">
                  {currentWeekWorkouts.slice(0, 3).map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">{workout.type}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-3">
                          {workout.date && (
                            <span>{new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
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
                      <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {workout.status}
                      </div>
                    </div>
                  ))}
                  {currentWeekWorkouts.length > 3 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
                        View All {currentWeekWorkouts.length} Sessions
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show upcoming training message if not started yet */}
            {!hasTrainingStarted && (
              <div className="text-sm text-muted-foreground">
                Your personalized {trainingPlan.race_type || 'running'} training plan is ready and will begin on {trainingStartDate?.toLocaleDateString()}. 
                Your weekly schedule will be available once training starts.
              </div>
            )}

            {/* Show active training message if started */}
            {hasTrainingStarted && (
              <div className="text-sm text-muted-foreground">
                Your personalized {trainingPlan.race_type || 'running'} training plan is active! 
                View your weekly schedule to see today's workout.
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
