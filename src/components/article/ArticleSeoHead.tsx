import { useEffect } from 'react';
import type { EnrichedArticle } from '@/types/article';
import { 
  generateArticleStructuredData, 
  generateBreadcrumbStructuredData,
  generateArticleMetaTags 
} from '@/utils/articleSeo';

interface ArticleSeoHeadProps {
  article: EnrichedArticle;
  relatedArticles?: any[];
}

const ArticleSeoHead = ({ article, relatedArticles }: ArticleSeoHeadProps) => {
  useEffect(() => {
    // Generate meta tags
    const metaTags = generateArticleMetaTags(article);
    
    // Update title
    document.title = metaTags.title;
    
    // Update meta description
    updateMetaTag('name', 'description', metaTags.description);
    
    // Update canonical URL
    updateLinkTag('canonical', metaTags.canonical);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', metaTags.openGraph.title);
    updateMetaTag('property', 'og:description', metaTags.openGraph.description);
    updateMetaTag('property', 'og:url', metaTags.openGraph.url);
    updateMetaTag('property', 'og:type', metaTags.openGraph.type);
    
    if (metaTags.openGraph.article) {
      updateMetaTag('property', 'article:published_time', metaTags.openGraph.article.publishedTime);
      updateMetaTag('property', 'article:modified_time', metaTags.openGraph.article.modifiedTime);
      if (metaTags.openGraph.article.author) {
        updateMetaTag('property', 'article:author', metaTags.openGraph.article.author);
      }
      if (metaTags.openGraph.article.section) {
        updateMetaTag('property', 'article:section', metaTags.openGraph.article.section);
      }
    }
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', metaTags.twitter.card);
    updateMetaTag('name', 'twitter:title', metaTags.twitter.title);
    updateMetaTag('name', 'twitter:description', metaTags.twitter.description);
    
    // Add JSON-LD structured data
    const articleStructuredData = generateArticleStructuredData(article, relatedArticles);
    const breadcrumbStructuredData = generateBreadcrumbStructuredData(article);
    
    addStructuredData('article-structured-data', articleStructuredData);
    addStructuredData('breadcrumb-structured-data', breadcrumbStructuredData);
    
    // Cleanup function
    return () => {
      document.title = 'RunWise';
    };
  }, [article, relatedArticles]);
  
  return null;
};

// Helper function to update meta tags
const updateMetaTag = (attribute: string, name: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

// Helper function to update link tags
const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`);
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
};

// Helper function to add JSON-LD structured data
const addStructuredData = (id: string, data: any) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
};

export default ArticleSeoHead;
