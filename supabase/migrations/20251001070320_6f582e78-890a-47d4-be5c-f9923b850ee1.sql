-- Create comprehensive relationships between all articles based on common topics

-- VO2 Max <-> Periodization (both about training optimization)
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

-- Add SEO keywords as JSONB metadata to articles for better linking
UPDATE public.articles 
SET related_articles_json = jsonb_build_object(
  'keywords', jsonb_build_array('VO2 max', 'aerobic fitness', 'interval training', 'tempo runs', 'cardiovascular fitness', 'endurance', 'oxygen uptake'),
  'topics', jsonb_build_array('training', 'fitness', 'performance'),
  'auto_link_phrases', jsonb_build_object(
    'periodization training', '/knowledge/periodization-training-how-elite-runners-plan-their-seasons',
    'training phases', '/knowledge/periodization-training-how-elite-runners-plan-their-seasons'
  )
)
WHERE slug = 'vo2-max-what-it-means-and-how-to-improve-it';

UPDATE public.articles 
SET related_articles_json = jsonb_build_object(
  'keywords', jsonb_build_array('periodization', 'training phases', 'base phase', 'build phase', 'peak phase', 'taper', 'training plan', 'race preparation'),
  'topics', jsonb_build_array('training', 'planning', 'performance'),
  'auto_link_phrases', jsonb_build_object(
    'VO2 max', '/knowledge/vo2-max-what-it-means-and-how-to-improve-it',
    'interval training', '/knowledge/vo2-max-what-it-means-and-how-to-improve-it',
    'tempo runs', '/knowledge/vo2-max-what-it-means-and-how-to-improve-it'
  )
)
WHERE slug = 'periodization-training-how-elite-runners-plan-their-seasons';

-- Update VO2 Max article content with internal links
UPDATE public.articles
SET content = replace(
  content,
  'Short, intense efforts followed by recovery push your cardiovascular system to its limit.',
  'Short, intense efforts followed by recovery push your cardiovascular system to its limit. This type of training is a key component of [periodization training](/knowledge/periodization-training-how-elite-runners-plan-their-seasons).'
)
WHERE slug = 'vo2-max-what-it-means-and-how-to-improve-it';

-- Update Periodization article content with internal links
UPDATE public.articles
SET content = replace(
  content,
  '- **Why it matters:** Improves strength, running economy, and VO₂ max',
  '- **Why it matters:** Improves strength, running economy, and [VO₂ max](/knowledge/vo2-max-what-it-means-and-how-to-improve-it)'
)
WHERE slug = 'periodization-training-how-elite-runners-plan-their-seasons';

UPDATE public.articles
SET content = replace(
  content,
  'Many elite marathoners spend 70–80% of their training in low-intensity zones during the base phase',
  'Many elite marathoners spend 70–80% of their training in low-intensity zones during the base phase—focusing on building aerobic capacity and [VO₂ max](/knowledge/vo2-max-what-it-means-and-how-to-improve-it)'
)
WHERE slug = 'periodization-training-how-elite-runners-plan-their-seasons';