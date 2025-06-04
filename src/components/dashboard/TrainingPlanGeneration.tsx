
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface TrainingPlanGenerationProps {
  generatingPlan: boolean;
  onGenerateTrainingPlan: () => void;
}

const TrainingPlanGeneration = ({ generatingPlan, onGenerateTrainingPlan }: TrainingPlanGenerationProps) => {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Generate Your Training Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Ready to start training? Generate a personalized 16-week training plan based on your profile.
        </p>
        <Button 
          onClick={onGenerateTrainingPlan}
          disabled={generatingPlan}
          className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
        >
          {generatingPlan ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Training Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainingPlanGeneration;
