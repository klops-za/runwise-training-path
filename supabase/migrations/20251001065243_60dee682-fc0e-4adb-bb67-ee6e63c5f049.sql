-- Insert the article about nutrition for runners
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
  'What to Eat Before and After a Run',
  'what-to-eat-before-and-after-a-run',
  'Learn what to eat before and after a run. Fuel with carbs, recover with protein, and hydrate smart to boost performance and recovery.',
  '# What to Eat Before and After a Run

Ask any runner, and they''ll tell you—nutrition can make or break a workout. Eat the right foods, and you''ll feel energized and strong. Eat the wrong ones (or nothing at all), and you risk sluggish legs, cramps, or hitting the dreaded wall.

Knowing what to eat before and after a run helps you fuel your performance, recover faster, and get the most out of your training.

## What to Eat Before a Run

The goal of pre-run nutrition is simple: give your body easy-to-digest energy without upsetting your stomach.

### General Guidelines

- **Timing matters:** Eat 30–90 minutes before shorter runs; 2–3 hours for longer runs.
- **Focus on carbs:** Carbs are your body''s preferred fuel.
- **Go light on fat and fiber:** They slow digestion and may cause GI distress.

### Great Pre-Run Snacks

- Banana with a spoonful of peanut butter
- Slice of toast with honey or jam
- Small bowl of oatmeal with berries
- Energy bar with simple ingredients

> "Think of your pre-run meal as fuel, not a feast."

## What to Eat After a Run

Post-run nutrition is all about recovery—refueling energy stores, repairing muscles, and rehydrating.

### The 3 R''s of Recovery

- **Refuel (carbs):** Replenish glycogen used during your run
- **Repair (protein):** Support muscle recovery and growth
- **Rehydrate (fluids):** Replace water and electrolytes lost through sweat

### Smart Post-Run Choices

- Smoothie with fruit, Greek yogurt, and almond milk
- Turkey or tofu wrap with veggies
- Chocolate milk (yes, it''s a great carb-protein combo!)
- Rice or quinoa bowl with lean protein and greens

**Timing tip:** Aim to eat within 30–60 minutes after running for best recovery.

### Did You Know?

Research shows that consuming carbs and protein in a 3:1 ratio after exercise speeds up glycogen restoration and muscle repair.

## Hydration Counts Too

- **Before:** Sip water throughout the day, not just right before you run.
- **During:** For runs over an hour, consider sports drinks with electrolytes.
- **After:** Replace lost fluids—your urine should be pale yellow as a guide.

## Common Mistakes to Avoid

- **Running on a heavy meal:** Can lead to cramps or stomach upset.
- **Skipping recovery fuel:** Increases fatigue and slows progress.
- **Ignoring electrolytes:** Especially important in hot weather or long runs.

## Final Motivation

Eating well before and after your runs isn''t complicated—it''s about giving your body the right fuel at the right time. With smart nutrition, you''ll feel stronger, recover faster, and enjoy every mile even more.

👉 **Next time you lace up, pair your miles with the right meals—and run your best.**',
  (SELECT id FROM categories WHERE name = 'Nutrition'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '6 min',
  true,
  false,
  now()
);