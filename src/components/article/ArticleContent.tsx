
import { Card, CardContent } from '@/components/ui/card';
import { parseMarkdown } from '@/utils/markdown';

interface ArticleContentProps {
  content: string;
}

const ArticleContent = ({ content }: ArticleContentProps) => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div 
            className="leading-relaxed text-foreground [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-foreground [&>p]:mb-4 [&>p]:text-foreground [&>strong]:font-semibold [&>em]:italic"
            dangerouslySetInnerHTML={{ 
              __html: parseMarkdown(content)
            }} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleContent;
