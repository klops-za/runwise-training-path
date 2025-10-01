-- Create related_articles table for manual article relationships
CREATE TABLE IF NOT EXISTS public.related_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  related_article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'related', -- 'related', 'prerequisite', 'next-in-series', etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, related_article_id)
);

-- Add related_articles_json field to articles for flexible metadata
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS related_articles_json JSONB DEFAULT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_related_articles_article_id ON public.related_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_related_articles_related_id ON public.related_articles(related_article_id);

-- Enable RLS
ALTER TABLE public.related_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for related_articles
CREATE POLICY "Anyone can view related articles"
ON public.related_articles
FOR SELECT
USING (true);

-- Only authenticated users can manage relationships (for future admin interface)
CREATE POLICY "Authenticated users can insert related articles"
ON public.related_articles
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update related articles"
ON public.related_articles
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete related articles"
ON public.related_articles
FOR DELETE
TO authenticated
USING (true);

-- Add some initial relationships between existing articles
INSERT INTO public.related_articles (article_id, related_article_id, relationship_type, display_order)
SELECT 
  a1.id,
  a2.id,
  'related',
  1
FROM public.articles a1
CROSS JOIN public.articles a2
WHERE a1.slug = 'vo2-max-what-it-means-and-how-to-improve-it'
  AND a2.slug = 'periodization-training-how-elite-runners-plan-their-seasons'
ON CONFLICT (article_id, related_article_id) DO NOTHING;

-- Add reverse relationship
INSERT INTO public.related_articles (article_id, related_article_id, relationship_type, display_order)
SELECT 
  a2.id,
  a1.id,
  'related',
  1
FROM public.articles a1
CROSS JOIN public.articles a2
WHERE a1.slug = 'vo2-max-what-it-means-and-how-to-improve-it'
  AND a2.slug = 'periodization-training-how-elite-runners-plan-their-seasons'
ON CONFLICT (article_id, related_article_id) DO NOTHING;