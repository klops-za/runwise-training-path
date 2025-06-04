
import { User } from 'lucide-react';

interface WelcomeSectionProps {
  displayName: string;
  raceGoal?: string | null;
  daysUntilRace?: number | null;
}

const WelcomeSection = ({ displayName, raceGoal, daysUntilRace }: WelcomeSectionProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Welcome back, {displayName}! 👋
      </h1>
      <p className="text-muted-foreground">
        {raceGoal && daysUntilRace ? (
          <>You're training for a {raceGoal} in {daysUntilRace} days</>
        ) : raceGoal ? (
          <>You're training for a {raceGoal}</>
        ) : (
          <>Ready to start your training journey?</>
        )}
      </p>
    </div>
  );
};

export default WelcomeSection;
