import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Tag, Bookmark, BookmarkCheck } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { marked } from 'marked';

// Define types for enriched data
type Category = Tables<'categories'>;
type Author = Tables<'authors'>;
type Article = Tables<'articles'>;
type ArticleTag = Tables<'article_tags'>;
type Tag = Tables<'tags'>;

interface ArticleTagWithTag extends ArticleTag {
  tags: Tag | null;
}

interface EnrichedArticle extends Article {
  categories: Category | null;
  authors: Author | null;
  article_tags: ArticleTagWithTag[];
}

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async (): Promise<EnrichedArticle | null> => {
      if (!slug) throw new Error('No slug provided');
      
      // Get the article first
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (articleError) throw articleError;
      if (!articleData) return null;

      // Get category separately if it exists
      let category: Category | null = null;
      if (articleData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', articleData.category_id)
          .single();
        category = categoryData;
      }

      // Get author separately if it exists
      let author: Author | null = null;
      if (articleData.author_id) {
        const { data: authorData } = await supabase
          .from('authors')
          .select('*')
          .eq('id', articleData.author_id)
          .single();
        author = authorData;
      }

      // Get tags separately
      const { data: tagData } = await supabase
        .from('article_tags')
        .select(`
          article_id,
          tag_id,
          tags (
            id,
            name,
            created_at
          )
        `)
        .eq('article_id', articleData.id);

      const articleTags: ArticleTagWithTag[] = (tagData || []).map(tag => ({
        article_id: tag.article_id,
        tag_id: tag.tag_id,
        tags: tag.tags
      }));

      return {
        ...articleData,
        categories: category,
        authors: author,
        article_tags: articleTags
      };
    },
    enabled: !!slug
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseMarkdown = (content: string) => {
    // Configure marked for better styling
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked(content);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error ? 'There was an error loading the article.' : 'The article you requested could not be found.'}
            </p>
            <Button onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const category = article.categories;
  const author = article.authors;
  const tags = article.article_tags || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/knowledge')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Button>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {category && (
                  <Badge className={`bg-gradient-to-r ${category.color_scheme} text-gray-800 border-0`}>
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
          </div>

          {/* Meta Information */}
          <Card className="mb-8">
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

          {/* Article Content */}
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg prose-slate max-w-none dark:prose-invert 
                            prose-headings:font-bold prose-headings:text-foreground prose-headings:mb-6 prose-headings:mt-8
                            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl 
                            prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6
                            prose-strong:text-foreground prose-strong:font-semibold
                            prose-em:text-foreground 
                            prose-li:text-foreground prose-li:mb-2
                            prose-ul:mb-6 prose-ol:mb-6
                            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                            first:prose-p:mt-0">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: parseMarkdown(article.content)
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Related Articles Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Continue Reading</h3>
            <div className="text-center">
              <Button onClick={() => navigate('/knowledge')} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse All Articles
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
