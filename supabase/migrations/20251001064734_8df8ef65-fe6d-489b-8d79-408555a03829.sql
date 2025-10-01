-- Insert the article about the 10% rule
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
  'How to Build Endurance Safely: The 10% Rule Explained',
  'how-to-build-endurance-safely-the-10-percent-rule',
  'Learn how to build endurance safely with the 10% rule. Increase mileage gradually, avoid injuries, and stay consistent in your running journey.',
  '# How to Build Endurance Safely: The 10% Rule Explained

If you''re excited about running longer distances, it''s easy to get carried away and add miles too quickly. But pushing too hard, too soon, often leads to burnout or injury. That''s where the 10% rule comes in—a simple, time-tested guideline to help you build endurance safely and enjoy steady progress.

## What Is the 10% Rule?

The 10% rule suggests that you should increase your weekly running mileage by no more than 10% each week. For example:

- If you ran 10 miles this week, aim for no more than 11 miles next week.
- If you ran 20 miles, increase to about 22 miles—not 30.

This gradual approach gives your muscles, joints, and cardiovascular system time to adapt, lowering your risk of injury.

> "The best runners aren''t the fastest starters—they''re the ones who stay healthy long enough to keep improving."

## Why It Works

Running stresses your body, and adaptation takes time. The 10% rule helps balance challenge with recovery so you can:

- Build endurance without overwhelming your body
- Strengthen tendons, ligaments, and muscles gradually
- Reduce common injuries like shin splints and IT band pain
- Maintain motivation by avoiding burnout

## How to Apply the 10% Rule

1. **Track your mileage.** Use a running app or journal to log your weekly total.
2. **Start small.** If you''re a beginner, even a 5% increase may be plenty.
3. **Increase every other week.** Some runners prefer alternating "hard" and "easy" weeks to allow more recovery.
4. **Listen to your body.** If you''re sore, tired, or feeling pain, hold steady before adding mileage.

### Did You Know?

Research shows that up to 80% of running injuries come from training errors, mostly from ramping up mileage too quickly.

## Common Mistakes to Avoid

- **Going faster and farther**: The 10% rule is about distance, not speed. Don''t pile on both at once.
- **Skipping rest days**: Rest is when your body adapts—without it, progress stalls.
- **Ignoring individual needs**: Some runners adapt faster; others need smaller increases. Adjust for your body.

## Beyond the 10% Rule

The 10% rule is a great guideline, but it''s not one-size-fits-all. Experienced runners may safely increase mileage more quickly, while beginners might need to go slower. Pairing mileage increases with cross-training (cycling, swimming, strength training) also builds endurance without extra impact on your joints.

## Final Motivation

Endurance is built over weeks, months, and years—not overnight. The 10% rule keeps you progressing at a safe pace, reducing setbacks and helping you enjoy the journey.

👉 **Focus on steady growth, stay patient, and remember:** every mile you add wisely is another step toward becoming the strong, resilient runner you want to be.',
  (SELECT id FROM categories WHERE name = 'Training'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '5 min',
  true,
  false,
  now()
);