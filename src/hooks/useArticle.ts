
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EnrichedArticle, Category, Author, ArticleTagWithTag } from '@/types/article';

export const useArticle = (slug: string | undefined) => {
  return useQuery({
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

      // Get author separately if it exists (excluding email for security)
      let author: Author | null = null;
      if (articleData.author_id) {
        const { data: authorData } = await supabase
          .from('authors')
          .select('id, name, bio, avatar_url, created_at, updated_at')
          .eq('id', articleData.author_id)
          .single();
        author = authorData as Author;
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
};
