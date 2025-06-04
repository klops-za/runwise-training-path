
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTrainingPlanWithTemplates } from '@/utils/trainingPlanGeneration';
import type { Database } from '@/integrations/supabase/types';

type Runner = Database['public']['Tables']['runners']['Row'];

interface TrainingPlanGenerationProps {
  runner: Runner;
  onPlanGenerated: () => void;
}

const TrainingPlanGeneration = ({ runner, onPlanGenerated }: TrainingPlanGenerationProps) => {
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const generatePlan = async () => {
    if (!runner.race_goal || !runner.experience_level || !runner.training_days) {
      toast({
        title: "Incomplete Profile",
        description: "Please complete your profile with race goal, experience level, and training days.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setGenerationStatus('idle');

    try {
      // Calculate training start date (today) and race date
      const trainingStartDate = new Date();
      const raceDate = runner.race_date ? new Date(runner.race_date) : new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000); // 16 weeks from now if no race date

      console.log('Generating training plan with templates...', {
        runnerId: runner.id,
        raceType: runner.race_goal,
        experienceLevel: runner.experience_level,
        fitnessScore: runner.fitness_score || 50,
        trainingDays: runner.training_days,
        raceDate,
        trainingStartDate
      });

      await generateTrainingPlanWithTemplates(
        runner.id,
        runner.race_goal,
        runner.experience_level,
        runner.fitness_score || 50,
        runner.training_days,
        raceDate,
        trainingStartDate
      );

      setGenerationStatus('success');
      toast({
        title: "Training Plan Generated!",
        description: "Your personalized training plan has been created using the latest workout templates.",
      });

      onPlanGenerated();
    } catch (error) {
      console.error('Error generating training plan:', error);
      setGenerationStatus('error');
      toast({
        title: "Generation Failed",
        description: "Failed to generate training plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = () => {
    switch (generationStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (generationStatus) {
      case 'success':
        return 'Plan generated successfully!';
      case 'error':
        return 'Generation failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100">Generate Training Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Create a personalized training plan based on your profile and the latest workout templates.
        </p>
        
        {generationStatus !== 'idle' && (
          <div className="flex items-center mb-4 text-sm">
            {getStatusIcon()}
            <span className="ml-2">{getStatusText()}</span>
          </div>
        )}

        <Button 
          onClick={generatePlan}
          disabled={generating}
          className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Plan...
            </>
          ) : (
            'Generate New Plan'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrainingPlanGeneration;
