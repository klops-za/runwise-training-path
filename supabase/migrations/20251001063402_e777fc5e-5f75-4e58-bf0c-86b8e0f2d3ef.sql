-- Clear out all existing articles and related data
-- Delete in order to respect foreign key constraints

-- Delete article tags
DELETE FROM public.article_tags;

-- Delete bookmarks
DELETE FROM public.bookmarks;

-- Delete reading progress
DELETE FROM public.reading_progress;

-- Delete all articles
DELETE FROM public.articles;