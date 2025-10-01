-- Insert the article about staying motivated
INSERT INTO public.articles (
  title,
  slug,
  excerpt,
  content,
  category_id,
  author_id,
  difficulty,
  read_time,
  published,
  featured,
  published_at
) VALUES (
  'How to Stay Motivated on Tough Days',
  'how-to-stay-motivated-on-tough-days',
  'Learn how to stay motivated on tough days with simple strategies. Find your why, set small goals, and keep running strong through challenges.',
  '# How to Stay Motivated on Tough Days

Every runner has them—the days when lacing up your shoes feels impossible. Maybe it''s bad weather, low energy, or just a lack of drive. The truth is, motivation isn''t always automatic. But the good news? You can learn how to spark it, even on tough days, and keep your training on track.

## Why Motivation Matters

Motivation is what gets you out the door when conditions aren''t perfect. More importantly, it builds consistency—the real key to long-term progress. Skipping runs occasionally isn''t the end of the world, but learning to push through low-motivation days keeps you moving toward your goals.

> "Discipline starts where motivation fades."

## 1. Set Small, Realistic Goals

On tough days, forget the big picture and focus on small wins:

- Commit to running just 10 minutes
- Aim to reach the next street corner or trail marker
- Focus on effort, not pace

Often, starting is the hardest part—once you get going, momentum takes over.

## 2. Remember Your "Why"

Ask yourself: Why do I run? Maybe it''s for health, stress relief, or training for a race. Reconnecting with your deeper purpose can provide the spark you need.

**Quick tip:** Write your "why" on a sticky note and keep it on your fridge, desk, or mirror.

## 3. Make It Fun

Running doesn''t always have to be serious training. Try:

- Exploring a new route
- Running with a friend or group
- Creating a fresh playlist or podcast queue
- Turning your run into intervals or a fun challenge

## 4. Use the Power of Routine

When running is built into your daily routine, it requires less willpower. Schedule runs at the same time each day so they become automatic, like brushing your teeth.

## 5. Celebrate Small Wins

Track your progress in a journal or app. Even logging short runs can give you a sense of accomplishment. Reward yourself for sticking with your plan—a new pair of socks or a favorite snack can go a long way.

### Did You Know?

Research shows that people who run with a partner or group are 25% more likely to stick to their training plans than those who run alone.

## 6. Listen to Your Body

Some days, low motivation is a sign of fatigue or overtraining. Learn to tell the difference between "I don''t feel like it" and "I need rest." Resting when your body truly needs it is part of smart training.

## Final Motivation

Every runner faces tough days—but pushing through (or adjusting wisely) is what separates those who stick with it from those who quit.

👉 **Next time motivation dips, try one of these strategies, get out the door, and remember: even your hardest days count as victories.**',
  (SELECT id FROM categories WHERE name = 'Mindset'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '5 min',
  true,
  false,
  now()
);