
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';

interface ArticleErrorStateProps {
  error: Error | null;
  onBack: () => void;
}

const ArticleErrorState = ({ error, onBack }: ArticleErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ? 'There was an error loading the article.' : 'The article you requested could not be found.'}
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleErrorState;
