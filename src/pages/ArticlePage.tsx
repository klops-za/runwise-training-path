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

    // Custom renderer for better styling
    const renderer = new marked.Renderer();
    
    // Enhanced heading renderer
    renderer.heading = (text, level) => {
      const sizes = {
        1: 'text-3xl font-bold mb-8 mt-12 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-4',
        2: 'text-2xl font-bold mb-6 mt-10 text-gray-900 dark:text-gray-100',
        3: 'text-xl font-semibold mb-4 mt-8 text-gray-800 dark:text-gray-200',
        4: 'text-lg font-semibold mb-3 mt-6 text-gray-800 dark:text-gray-200',
        5: 'text-base font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200',
        6: 'text-sm font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200'
      };
      return `<h${level} class="${sizes[level] || sizes[6]}">${text}</h${level}>`;
    };

    // Enhanced paragraph renderer
    renderer.paragraph = (text) => {
      return `<p class="mb-6 leading-relaxed text-gray-700 dark:text-gray-300 text-lg">${text}</p>`;
    };

    // Enhanced list renderer
    renderer.list = (body, ordered) => {
      const tag = ordered ? 'ol' : 'ul';
      const classes = ordered 
        ? 'list-decimal list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300' 
        : 'list-disc list-inside mb-6 space-y-2 text-gray-700 dark:text-gray-300';
      return `<${tag} class="${classes}">${body}</${tag}>`;
    };

    // Enhanced list item renderer
    renderer.listitem = (text) => {
      return `<li class="text-lg leading-relaxed">${text}</li>`;
    };

    // Enhanced strong/bold renderer
    renderer.strong = (text) => {
      return `<strong class="font-semibold text-gray-900 dark:text-gray-100">${text}</strong>`;
    };

    // Enhanced emphasis/italic renderer
    renderer.em = (text) => {
      return `<em class="italic text-gray-800 dark:text-gray-200">${text}</em>`;
    };

    // Enhanced code renderer
    renderer.code = (code, language) => {
      return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 overflow-x-auto"><code class="text-sm text-gray-800 dark:text-gray-200">${code}</code></pre>`;
    };

    // Enhanced inline code renderer
    renderer.codespan = (code) => {
      return `<code class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">${code}</code>`;
    };

    // Enhanced blockquote renderer
    renderer.blockquote = (quote) => {
      return `<blockquote class="border-l-4 border-blue-500 pl-6 italic mb-6 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-4 rounded-r-lg">${quote}</blockquote>`;
    };

    // Enhanced link renderer
    renderer.link = (href, title, text) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr} class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors">${text}</a>`;
    };

    marked.setOptions({ renderer });
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
          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              <div className="p-8 md:p-12 lg:p-16">
                <article className="max-w-none">
                  <div 
                    className="article-content"
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(article.content)
                    }} 
                  />
                </article>
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

      <style jsx>{`
        .article-content h1:first-child {
          margin-top: 0;
        }
        .article-content p:first-child {
          margin-top: 0;
        }
        .article-content > *:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default ArticlePage;
