-- Insert the article about hydration for long runs
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
  'Hydration Hacks for Long Runs',
  'hydration-hacks-for-long-runs',
  'Stay strong with these hydration hacks for long runs. Learn when, what, and how much to drink for peak performance and recovery.',
  '# Hydration Hacks for Long Runs

Ask any seasoned runner and they''ll tell you—hydration can make or break a long run. Dehydration leads to fatigue, cramps, and even dangerous heat illness, while overhydration can cause stomach sloshing or low sodium levels. The sweet spot? Knowing how much, when, and what to drink.

Here are the best hydration hacks for long runs to keep you energized, safe, and performing your best.

## Why Hydration Matters

During a long run, your body loses water and electrolytes (like sodium and potassium) through sweat. Even a 2% drop in hydration can reduce performance, slow your pace, and increase perceived effort.

> "Hydration isn''t just about drinking water—it''s about fueling your body to go the distance."

## Pre-Run Hydration

- **Start early:** Sip water throughout the day before your run.
- **Pre-load with electrolytes:** For runs longer than 90 minutes or in hot weather, consider a sports drink or electrolyte tablet the night before and morning of your run.
- **Avoid chugging right before:** It can cause stomach sloshing. Take small sips instead.

## During Your Run

- **Follow the 20-minute rule:** Aim for a few sips of water every 15–20 minutes.
- **Know your sweat rate:** Weigh yourself before and after a long run. Every pound lost = about 16 oz of fluid to replace.
- **Balance fluids with electrolytes:** Alternate between water and sports drinks to prevent cramping and maintain sodium balance.

**Pro tip:** Practice your hydration strategy during training—not on race day.

## Smart Carry Options

Carrying fluids doesn''t have to be a hassle. Try:

- **Handheld bottles:** Best for shorter long runs (up to 10 miles).
- **Hydration belts:** Evenly distribute weight and allow multiple bottles.
- **Hydration vests/packs:** Perfect for marathons and trail runs where refills are scarce.

### Did You Know?

Marathon runners can lose up to 1 liter of sweat per hour—sometimes more in hot, humid conditions.

## Post-Run Rehydration

- **Drink gradually:** Rehydrate over the next few hours, not all at once.
- **Replace electrolytes:** Use a recovery drink, coconut water, or salty snack.
- **Check your urine:** Pale yellow = hydrated. Dark = drink more.

## Common Mistakes to Avoid

- **Only drinking water:** Can lead to hyponatremia (low sodium levels).
- **Waiting until thirsty:** Thirst often lags behind your actual hydration needs.
- **Overhydrating before your run:** Causes discomfort and bathroom breaks.

## Final Motivation

Hydration is your secret weapon for strong, enjoyable long runs. With the right strategy, you''ll run farther, recover faster, and feel better every step of the way.

👉 **Next time you head out for a long run, plan your hydration like you plan your route—and watch your endurance soar.**',
  (SELECT id FROM categories WHERE name = 'Nutrition'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'intermediate',
  '6 min',
  true,
  false,
  now()
);