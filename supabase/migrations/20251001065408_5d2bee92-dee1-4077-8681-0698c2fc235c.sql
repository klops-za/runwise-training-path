-- Insert the article about sleep and running performance
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
  'The Role of Sleep in Running Performance',
  'the-role-of-sleep-in-running-performance',
  'Discover the role of sleep in running performance. Learn why rest boosts recovery, prevents injury, and helps you run stronger and faster.',
  '# The Role of Sleep in Running Performance

You can follow the best training plan, eat the perfect pre-run meal, and buy top-tier running shoes—but if you''re skimping on sleep, your performance will suffer. Sleep is one of the most overlooked training tools for runners. It''s during those precious hours of rest that your body repairs, rebuilds, and prepares for your next run.

## Why Sleep Matters for Runners

Running puts stress on muscles, joints, and your nervous system. Sleep is when the magic happens:

- **Muscle repair:** Growth hormone released during deep sleep helps muscles recover.
- **Energy restoration:** Sleep replenishes glycogen, your body''s fuel for long runs.
- **Mental focus:** Quality sleep sharpens concentration and motivation.

> "Sleep is the cheapest and most effective performance booster you have."

## How Lack of Sleep Hurts Performance

Missing out on sleep—even just a few hours—can have noticeable effects:

- Reduced endurance and slower pace
- Higher perceived effort (runs feel harder)
- Increased risk of injury due to slower reaction time
- Weakened immune system, making recovery harder

In fact, studies show that sleep-deprived athletes are up to 60% more likely to get injured.

## How Much Sleep Do Runners Need?

For most adults, 7–9 hours per night is ideal. But runners in training—especially for marathons or ultras—may benefit from closer to 9–10 hours, or by adding short naps.

## Tips for Better Sleep

- **Stick to a schedule:** Go to bed and wake up at the same time daily.
- **Create a wind-down routine:** Stretch, read, or meditate before bed.
- **Limit screens:** Blue light delays melatonin production.
- **Keep it cool and dark:** A quiet, cool room supports deeper sleep.
- **Avoid heavy meals and caffeine late in the day.**

### Did You Know?

Elite athletes like Usain Bolt and Mo Farah reportedly sleep up to 10 hours a night, plus naps, to maximize recovery.

## Sleep and Training Cycles

- **Before a race:** Prioritize several nights of good sleep in the week leading up. (One restless night before race day won''t ruin your performance if you''ve banked solid rest beforehand.)
- **During heavy training blocks:** Add extra rest to adapt to higher mileage.
- **After long runs:** Your body needs additional recovery—don''t underestimate rest days.

## Final Motivation

Think of sleep as part of your training plan—not an afterthought. Every hour of rest strengthens your body, sharpens your mind, and fuels your next run.

👉 **Tonight, trade that extra episode or scroll for an earlier bedtime—your future miles will thank you.**',
  (SELECT id FROM categories WHERE name = 'Health'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '5 min',
  true,
  false,
  now()
);