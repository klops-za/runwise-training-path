-- Insert the article about warming up before running
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
  'How to Warm Up Properly Before a Run',
  'how-to-warm-up-properly-before-a-run',
  'Learn how to warm up properly before a run. Simple dynamic drills to boost performance, prevent injury, and make every run feel better.',
  '# How to Warm Up Properly Before a Run

Picture this: you lace up your shoes, head out the door, and start running right away. A few minutes in, your legs feel heavy, your breathing is rough, and your body just isn''t cooperating. Sound familiar? That''s where a proper warm-up comes in.

A good warm-up prepares your muscles, joints, and mind for the miles ahead. It improves performance, reduces injury risk, and makes running feel smoother from the very first step.

## Why Warming Up Matters

Running is high-impact. Without a warm-up, you''re asking cold muscles and stiff joints to suddenly perform at full force. This can lead to:

- Tightness and discomfort
- Poor running form
- Higher risk of strains or sprains

> "A few minutes of warming up can save you weeks of sitting out with an injury."

## The Right Way to Warm Up

A proper warm-up should be dynamic (moving) rather than static (holding stretches). Static stretching is better after your run, while dynamic moves activate muscles and increase blood flow.

**Here''s a simple pre-run warm-up routine (5–10 minutes):**

1. **Brisk Walk or Easy Jog (2–3 minutes):** Get your heart rate up gradually.
2. **Leg Swings:** Forward-backward and side-to-side to loosen hips.
3. **High Knees:** Lightly drive knees toward your chest for quick turnover.
4. **Butt Kicks:** Warm up hamstrings and prep your stride.
5. **Walking Lunges:** Activate glutes, quads, and core.
6. **Skipping or Strides:** Add short bursts at your planned running pace.

## Tailor Your Warm-Up to Your Run

- **Easy run:** Keep it short—just an easy jog plus a couple of mobility drills.
- **Tempo run or intervals:** Spend extra time with dynamic drills and add a few faster strides to prime your body.
- **Long run:** Focus on loosening hips, calves, and hamstrings, since they''ll be working for miles.

### Did You Know?

Warming up can improve running economy by up to 7%—meaning you''ll use less energy at the same pace.

## Common Warm-Up Mistakes

- **Skipping it entirely:** Leads to sluggish starts and higher injury risk.
- **Static stretching only:** Can reduce muscle power before running.
- **Rushing through:** Take at least 5 minutes—your body will thank you.

## Final Motivation

A proper warm-up isn''t just a chore—it''s a performance booster and injury shield. By adding 5–10 minutes of prep before every run, you''ll feel stronger, smoother, and more confident from the start.

👉 **Next time you head out, give your body the warm-up it deserves—and enjoy the difference every step of the way.**',
  (SELECT id FROM categories WHERE name = 'Training'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '5 min',
  true,
  false,
  now()
);