
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, Apple, Shield, Brain, ArrowRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';

const KnowledgeHub = () => {
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: featuredArticles = [] } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (name),
          authors (name)
        `)
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: allArticles = [] } = useQuery({
    queryKey: ['all-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (name)
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getIconForCategory = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'training': return Target;
      case 'health': return Heart;
      case 'nutrition': return Apple;
      case 'mindset': return Brain;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Knowledge Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert insights and proven strategies to help you train smarter, run faster, and stay injury-free
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => navigate(`/knowledge/${article.slug}`)}
                >
                  <CardHeader>
                    <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900 dark:to-orange-900 rounded-lg mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="text-xs">
                        {article.categories?.name}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(article.difficulty || 'all-levels')}`}>
                        {article.difficulty || 'All Levels'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {article.categories?.name}
                      </span>
                      <span className="text-muted-foreground">{article.read_time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const IconComponent = getIconForCategory(category.name);
              const categoryArticles = allArticles.filter(
                article => article.categories?.name === category.name
              );
              
              return (
                <Card key={category.id} className="border-border hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color_scheme} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <p className="text-muted-foreground text-sm">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {categoryArticles.slice(0, 4).map((article) => (
                        <div 
                          key={article.id} 
                          className="flex items-center text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          onClick={() => navigate(`/knowledge/${article.slug}`)}
                        >
                          <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                          {article.title}
                        </div>
                      ))}
                      {categoryArticles.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">
                          Articles coming soon...
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => navigate(`/knowledge?category=${category.name.toLowerCase()}`)}
                    >
                      Explore {category.name} ({categoryArticles.length})
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-orange-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">💡 Quick Tip of the Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-blue-50">
              <strong>Listen to your body:</strong> If you're feeling unusually fatigued or experiencing pain, 
              it's better to take an extra rest day than to risk injury. Your training plan should adapt to you, 
              not the other way around.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeHub;
