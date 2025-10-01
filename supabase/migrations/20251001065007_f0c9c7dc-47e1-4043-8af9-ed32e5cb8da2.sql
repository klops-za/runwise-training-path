-- Insert the article about common running injuries
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
  'The 7 Most Common Running Injuries (and How to Prevent Them)',
  'the-7-most-common-running-injuries-and-how-to-prevent-them',
  'Discover the 7 most common running injuries and how to prevent them. Stay strong, avoid setbacks, and keep running pain-free.',
  '# The 7 Most Common Running Injuries (and How to Prevent Them)

Running is one of the best ways to boost fitness, reduce stress, and build endurance—but it''s also a sport with a high risk of overuse injuries. In fact, studies suggest that up to 80% of runners get injured each year. The good news? Most running injuries are preventable with smart training and good habits.

Here are the 7 most common running injuries and how you can avoid them.

## 1. Runner''s Knee (Patellofemoral Pain Syndrome)

**Symptoms:** Achy pain around or behind the kneecap, worse when going downhill or climbing stairs.

**Prevention:**

- Strengthen your quads and hips
- Avoid overstriding
- Run on softer surfaces when possible

## 2. Shin Splints

**Symptoms:** Sharp or aching pain along the front or inside of the shin.

**Prevention:**

- Increase mileage gradually (follow the 10% rule)
- Wear supportive shoes
- Add calf raises and toe raises to strengthen lower legs

## 3. IT Band Syndrome

**Symptoms:** Pain on the outside of the knee that worsens with running.

**Prevention:**

- Foam roll your IT band and glutes
- Strengthen hip stabilizers
- Avoid running on uneven surfaces for long periods

## 4. Plantar Fasciitis

**Symptoms:** Stabbing heel pain, especially in the morning.

**Prevention:**

- Stretch calves and arches
- Wear shoes with proper arch support
- Don''t suddenly increase long runs

## 5. Achilles Tendinitis

**Symptoms:** Stiffness or pain in the back of the heel or lower calf.

**Prevention:**

- Stretch calves regularly
- Strengthen calf muscles with eccentric heel drops
- Avoid sudden speed increases

## 6. Stress Fractures

**Symptoms:** Sharp, localized bone pain that worsens with impact.

**Prevention:**

- Follow gradual mileage increases
- Cross-train to reduce impact load
- Fuel properly with calcium and vitamin D for bone health

## 7. Hamstring Strains

**Symptoms:** Sudden sharp pain or tightness in the back of the thigh.

**Prevention:**

- Warm up with dynamic drills before running
- Strengthen hamstrings and glutes
- Don''t sprint when you''re overly fatigued

### Did You Know?

Nearly 50% of running injuries are linked to training errors—like running too much, too soon, or skipping recovery days.

## How to Stay Injury-Free

- **Listen to your body.** Don''t ignore pain that lasts more than a few days.
- **Strength train.** Strong muscles protect joints and absorb impact.
- **Mix it up.** Add swimming, cycling, or yoga to give your body a break.
- **Rest and recover.** Take at least one rest day per week.

## Final Motivation

Running injuries don''t have to be part of your journey. By training smart, strengthening weak spots, and respecting recovery, you''ll stay healthy and enjoy more miles on the road or trail.

👉 **Run strong, stay consistent, and remember—prevention is the best performance booster.**',
  (SELECT id FROM categories WHERE name = 'Health'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '7 min',
  true,
  false,
  now()
);