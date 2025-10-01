import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EnrichedArticle } from '@/types/article';

interface RelatedArticlesProps {
  articleId: string;
}

const RelatedArticles = ({ articleId }: RelatedArticlesProps) => {
  const navigate = useNavigate();

  const { data: relatedArticles, isLoading } = useQuery({
    queryKey: ['related-articles', articleId],
    queryFn: async () => {
      // Fetch related articles from the related_articles table
      const { data: relationships, error: relError } = await supabase
        .from('related_articles')
        .select('related_article_id, relationship_type, display_order')
        .eq('article_id', articleId)
        .order('display_order', { ascending: true });

      if (relError) throw relError;
      if (!relationships || relationships.length === 0) return [];

      // Fetch the actual article details
      const relatedIds = relationships.map(r => r.related_article_id);
      const { data: articles, error: artError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          difficulty,
          read_time,
          published,
          categories (
            id,
            name,
            icon,
            color_scheme
          )
        `)
        .in('id', relatedIds)
        .eq('published', true);

      if (artError) throw artError;

      return articles || [];
    },
    enabled: !!articleId,
  });

  if (isLoading || !relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Related Articles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {relatedArticles.map((article: any) => (
            <div
              key={article.id}
              onClick={() => navigate(`/knowledge/${article.slug}`)}
              className="group cursor-pointer rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {article.categories && (
                    <Badge variant="outline" className="mb-2">
                      {article.categories.name}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    {article.difficulty && (
                      <span className="capitalize">{article.difficulty}</span>
                    )}
                    {article.read_time && (
                      <>
                        <span>•</span>
                        <span>{article.read_time}</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedArticles;
