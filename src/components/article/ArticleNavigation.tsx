
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ArticleNavigationProps {
  onBack: () => void;
}

const ArticleNavigation = ({ onBack }: ArticleNavigationProps) => {
  return (
    <>
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Knowledge Hub
      </Button>

      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Continue Reading</h3>
        <div className="text-center">
          <Button onClick={onBack} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse All Articles
          </Button>
        </div>
      </div>
    </>
  );
};

export default ArticleNavigation;
