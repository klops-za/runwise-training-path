
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDate } from '@/utils/articleHelpers';
import type { EnrichedArticle } from '@/types/article';

interface ArticleMetaProps {
  article: EnrichedArticle;
}

const ArticleMeta = ({ article }: ArticleMetaProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const author = article.authors;
  const tags = article.article_tags || [];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>By {author.name}</span>
            </div>
          )}
          
          {article.read_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{article.read_time}</span>
            </div>
          )}

          {article.published_at && (
            <div className="flex items-center gap-2">
              <span>Published {formatDate(article.published_at)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="h-8 px-2"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {tags.map((tagRelation, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tagRelation.tags?.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleMeta;
