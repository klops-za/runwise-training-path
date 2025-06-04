
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useArticle } from '@/hooks/useArticle';
import ArticleLoadingState from '@/components/article/ArticleLoadingState';
import ArticleErrorState from '@/components/article/ArticleErrorState';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleMeta from '@/components/article/ArticleMeta';
import ArticleContent from '@/components/article/ArticleContent';
import ArticleNavigation from '@/components/article/ArticleNavigation';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useArticle(slug);

  const handleBack = () => navigate('/knowledge');

  if (isLoading) {
    return <ArticleLoadingState />;
  }

  if (error || !article) {
    return <ArticleErrorState error={error} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ArticleNavigation onBack={handleBack} />
          
          <div className="mb-8">
            <ArticleHeader article={article} />
          </div>

          <div className="mb-8">
            <ArticleMeta article={article} />
          </div>

          <ArticleContent content={article.content} />
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
