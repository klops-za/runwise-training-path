import type { EnrichedArticle } from '@/types/article';

/**
 * Generate JSON-LD structured data for article SEO
 */
export const generateArticleStructuredData = (article: EnrichedArticle, relatedArticles?: any[]) => {
  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/knowledge/${article.slug}`;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    url: articleUrl,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: article.authors ? {
      '@type': 'Person',
      name: article.authors.name,
      ...(article.authors.email && { email: article.authors.email })
    } : {
      '@type': 'Organization',
      name: 'RunWise'
    },
    publisher: {
      '@type': 'Organization',
      name: 'RunWise',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    ...(article.categories && {
      articleSection: article.categories.name
    }),
    ...(article.read_time && {
      timeRequired: article.read_time
    }),
    keywords: extractKeywords(article),
    ...(relatedArticles && relatedArticles.length > 0 && {
      relatedLink: relatedArticles.map(ra => `${baseUrl}/knowledge/${ra.slug}`)
    })
  };

  return structuredData;
};

/**
 * Generate BreadcrumbList structured data for navigation
 */
export const generateBreadcrumbStructuredData = (article: EnrichedArticle) => {
  const baseUrl = window.location.origin;
  
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Knowledge Hub',
        item: `${baseUrl}/knowledge`
      },
      ...(article.categories ? [{
        '@type': 'ListItem',
        position: 3,
        name: article.categories.name,
        item: `${baseUrl}/knowledge?category=${article.categories.name}`
      }] : []),
      {
        '@type': 'ListItem',
        position: article.categories ? 4 : 3,
        name: article.title,
        item: `${baseUrl}/knowledge/${article.slug}`
      }
    ]
  };

  return breadcrumbs;
};

/**
 * Extract keywords from article for SEO
 */
const extractKeywords = (article: EnrichedArticle): string => {
  const keywords: string[] = [];
  
  // Add category
  if (article.categories) {
    keywords.push(article.categories.name);
  }
  
  // Add difficulty level
  if (article.difficulty) {
    keywords.push(article.difficulty);
  }
  
  // Add tags
  if (article.article_tags && article.article_tags.length > 0) {
    article.article_tags.forEach(tag => {
      if (tag.tags) {
        keywords.push(tag.tags.name);
      }
    });
  }
  
  // Add custom keywords from metadata
  if (article.related_articles_json && typeof article.related_articles_json === 'object') {
    const metadata = article.related_articles_json as any;
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      keywords.push(...metadata.keywords);
    }
  }
  
  return keywords.join(', ');
};

/**
 * Generate meta tags for article
 */
export const generateArticleMetaTags = (article: EnrichedArticle) => {
  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/knowledge/${article.slug}`;
  
  return {
    title: `${article.title} | RunWise Knowledge Hub`,
    description: article.excerpt || article.title.substring(0, 160),
    canonical: articleUrl,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      url: articleUrl,
      type: 'article',
      article: {
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        ...(article.authors && { author: article.authors.name }),
        ...(article.categories && { section: article.categories.name }),
        ...(article.article_tags && {
          tags: article.article_tags.map(t => t.tags?.name).filter(Boolean)
        })
      }
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title
    }
  };
};
