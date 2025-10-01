import { supabase } from '@/integrations/supabase/client';

/**
 * Analyzes article content and suggests related articles based on keyword matching
 */
export const suggestRelatedArticles = async (
  currentArticleId: string,
  content: string,
  maxSuggestions: number = 5
): Promise<string[]> => {
  try {
    // Fetch all published articles except the current one
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, related_articles_json, slug')
      .eq('published', true)
      .neq('id', currentArticleId);

    if (error || !articles) return [];

    // Extract keywords from current content
    const currentKeywords = extractKeywords(content);
    
    // Score each article based on keyword overlap
    const scoredArticles = articles.map(article => {
      let score = 0;
      const articleKeywords = extractKeywords(
        `${article.title} ${article.content} ${article.excerpt || ''}`
      );
      
      // Check keyword overlap
      currentKeywords.forEach(keyword => {
        if (articleKeywords.includes(keyword)) {
          score += 1;
        }
      });
      
      // Bonus points for metadata keywords
      if (article.related_articles_json) {
        const metadata = article.related_articles_json as any;
        if (metadata.keywords && Array.isArray(metadata.keywords)) {
          metadata.keywords.forEach((metaKeyword: string) => {
            if (currentKeywords.includes(metaKeyword.toLowerCase())) {
              score += 2; // Higher weight for metadata keywords
            }
          });
        }
      }
      
      return { id: article.id, score };
    });

    // Sort by score and return top suggestions
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .slice(0, maxSuggestions)
      .map(item => item.id);
  } catch (error) {
    console.error('Error suggesting related articles:', error);
    return [];
  }
};

/**
 * Extract meaningful keywords from text content
 */
const extractKeywords = (text: string): string[] => {
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
    'its', 'you', 'your', 'we', 'our', 'they', 'their', 'what', 'which',
    'who', 'when', 'where', 'why', 'how'
  ]);
  
  // Clean and tokenize
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(' ');
  
  // Filter and extract meaningful keywords
  const keywords = words.filter(word => {
    return (
      word.length > 3 && // Minimum length
      !stopWords.has(word) && // Not a stop word
      !/^\d+$/.test(word) // Not a pure number
    );
  });
  
  // Get unique keywords
  return Array.from(new Set(keywords));
};

/**
 * Identify opportunities to add internal links in article content
 */
export const identifyLinkOpportunities = (
  content: string,
  availableArticles: Array<{ slug: string; title: string; keywords?: string[] }>
): Array<{ phrase: string; targetSlug: string; targetTitle: string }> => {
  const opportunities: Array<{ phrase: string; targetSlug: string; targetTitle: string }> = [];
  
  availableArticles.forEach(article => {
    // Check if article title appears in content (case insensitive)
    const titleRegex = new RegExp(article.title, 'gi');
    if (titleRegex.test(content)) {
      opportunities.push({
        phrase: article.title,
        targetSlug: article.slug,
        targetTitle: article.title
      });
    }
    
    // Check for keyword matches
    if (article.keywords) {
      article.keywords.forEach(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (keywordRegex.test(content)) {
          opportunities.push({
            phrase: keyword,
            targetSlug: article.slug,
            targetTitle: article.title
          });
        }
      });
    }
  });
  
  // Remove duplicates based on phrase
  const uniqueOpportunities = opportunities.reduce((acc, curr) => {
    if (!acc.find(item => item.phrase.toLowerCase() === curr.phrase.toLowerCase())) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof opportunities);
  
  return uniqueOpportunities;
};
