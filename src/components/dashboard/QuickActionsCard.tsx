
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, RefreshCw, Target, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];

interface QuickActionsCardProps {
  trainingPlan: TrainingPlan | null;
  generatingPlan: boolean;
  onGenerateTrainingPlan: () => void;
}

const QuickActionsCard = ({ trainingPlan, generatingPlan, onGenerateTrainingPlan }: QuickActionsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
          onClick={() => navigate('/schedule')}
        >
          <Calendar className="mr-2 h-4 w-4" />
          View Training Schedule
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate('/plans')}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Manage Training Plans
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        
        {trainingPlan && (
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onGenerateTrainingPlan}
            disabled={generatingPlan}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Plan
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate('/knowledge')}
        >
          <Target className="mr-2 h-4 w-4" />
          Knowledge Hub
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
