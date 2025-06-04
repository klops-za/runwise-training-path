
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, User, ChevronRight, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Define types for enriched data
type Category = Tables<'categories'>;
type Author = Tables<'authors'>;
type Article = Tables<'articles'>;

interface EnrichedArticle extends Article {
  categories: Category | null;
  authors: Author | null;
}

const KnowledgeHub = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch articles with separate queries for related data
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', selectedCategory, searchTerm],
    queryFn: async (): Promise<EnrichedArticle[]> => {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
      }

      const { data: articlesData, error } = await query;
      if (error) throw error;

      // Get all categories and authors separately
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      const { data: authorsData } = await supabase
        .from('authors')
        .select('*');

      // Combine the data
      const enrichedArticles: EnrichedArticle[] = (articlesData || []).map((article) => {
        const category = categoriesData?.find((cat) => cat.id === article.category_id) || null;
        const author = authorsData?.find((auth) => auth.id === article.author_id) || null;
        
        return {
          ...article,
          categories: category,
          authors: author
        };
      });

      // Filter by category if selected
      if (selectedCategory !== 'all') {
        return enrichedArticles.filter((article) => 
          article.categories?.name === selectedCategory
        );
      }

      return enrichedArticles;
    }
  });

  // Fetch featured articles
  const { data: featuredArticles } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async (): Promise<EnrichedArticle[]> => {
      const { data: articlesData, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;

      // Get categories and authors for featured articles
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      const { data: authorsData } = await supabase
        .from('authors')
        .select('*');

      // Combine the data
      const enrichedArticles: EnrichedArticle[] = (articlesData || []).map((article) => {
        const category = categoriesData?.find((cat) => cat.id === article.category_id) || null;
        const author = authorsData?.find((auth) => auth.id === article.author_id) || null;
        
        return {
          ...article,
          categories: category,
          authors: author
        };
      });

      return enrichedArticles;
    }
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const ArticleCard = ({ article, featured = false }: { article: EnrichedArticle; featured?: boolean }) => (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${featured ? 'border-2 border-orange-200 dark:border-orange-800' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {featured && (
                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {article.categories && (
                <Badge className={`bg-gradient-to-r ${article.categories.color_scheme} text-gray-800 border-0`}>
                  {article.categories.name}
                </Badge>
              )}
              {article.difficulty && (
                <Badge className={getDifficultyColor(article.difficulty)}>
                  {article.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {article.excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {article.authors && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{article.authors.name}</span>
            </div>
          )}
          {article.read_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.read_time}</span>
            </div>
          )}
          {article.published_at && (
            <span>{formatDate(article.published_at)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Knowledge Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Evidence-based articles to help you train smarter, run faster, and stay injury-free
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles && featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <div key={article.id} onClick={() => navigate(`/knowledge/${article.slug}`)}>
                  <ArticleCard article={article} featured />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto mb-8" style={{ gridTemplateColumns: `repeat(${(categories?.length || 0) + 1}, 1fr)` }}>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} onClick={() => navigate(`/knowledge/${article.slug}`)}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No articles available in this category'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Train Smarter?</h3>
              <p className="text-muted-foreground mb-6">
                Get personalized training plans and track your progress with our comprehensive running platform.
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;
