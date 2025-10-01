
import type { Tables } from '@/integrations/supabase/types';

// Define types for enriched data
export type Category = Tables<'categories'>;
export type Author = Omit<Tables<'authors'>, 'email'> & { email?: string };
export type Article = Tables<'articles'>;
export type ArticleTag = Tables<'article_tags'>;
export type Tag = Tables<'tags'>;

export interface ArticleTagWithTag extends ArticleTag {
  tags: Tag | null;
}

export interface EnrichedArticle extends Article {
  categories: Category | null;
  authors: Author | null;
  article_tags: ArticleTagWithTag[];
}
