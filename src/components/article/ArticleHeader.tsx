
import { Badge } from '@/components/ui/badge';
import { getDifficultyColor } from '@/utils/articleHelpers';
import type { EnrichedArticle } from '@/types/article';

interface ArticleHeaderProps {
  article: EnrichedArticle;
}

const ArticleHeader = ({ article }: ArticleHeaderProps) => {
  const category = article.categories;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {category && (
          <Badge className={`bg-gradient-to-r ${category.color_scheme} text-gray-900 dark:text-gray-100 border-0`}>
            {category.name}
          </Badge>
        )}
        {article.difficulty && (
          <Badge className={getDifficultyColor(article.difficulty)}>
            {article.difficulty}
          </Badge>
        )}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
          {article.excerpt}
        </p>
      )}
    </div>
  );
};

export default ArticleHeader;
