
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import { formatPace } from '@/utils/paceCalculations';

interface TrainingPacesCardProps {
  intervalPace: number | null;
  tempoPace: number | null;
  easyPace: number | null;
  paceUnit: string;
  fitnessScore: number;
}

const TrainingPacesCard = ({ intervalPace, tempoPace, easyPace, paceUnit, fitnessScore }: TrainingPacesCardProps) => {
  return (
    <Card className="border-green-100 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center text-green-900 dark:text-green-100">
          <Timer className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
          Your Training Paces
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Interval Pace</div>
            <div className="text-lg font-semibold text-foreground">
              {formatPace(intervalPace, paceUnit)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Tempo Pace</div>
            <div className="text-lg font-semibold text-foreground">
              {formatPace(tempoPace, paceUnit)}
            </div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Easy Pace</div>
            <div className="text-lg font-semibold text-foreground">
              {formatPace(easyPace, paceUnit)}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Calculated based on your fitness score of {fitnessScore}
        </p>
      </CardContent>
    </Card>
  );
};

export default TrainingPacesCard;
