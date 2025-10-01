-- Insert the article about strength training for runners
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
  'Strength Training for Runners: Why Squats Are Your Secret Weapon',
  'strength-training-for-runners-why-squats-are-your-secret-weapon',
  'Strength training for runners: discover why squats are your secret weapon for speed, endurance, and injury prevention.',
  '# Strength Training for Runners: Why Squats Are Your Secret Weapon

Many runners believe the best way to get faster and stronger is simply to run more. While mileage matters, strength training is the hidden key to better performance—and few exercises are as powerful as the squat. Squats build strength, stability, and resilience, making them a true secret weapon for runners of all levels.

## Why Strength Training Matters for Runners

Running is a repetitive, impact-heavy sport. Without strength training, weak muscles can lead to imbalances, inefficient form, and injury. Adding exercises like squats helps you:

- Improve running economy (use less energy at the same pace)
- Protect joints by strengthening supporting muscles
- Increase power for hills and sprints
- Reduce risk of overuse injuries

> "Strong runners are resilient runners—the stronger your body, the longer you''ll last."

## Why Squats Are a Runner''s Best Friend

The squat is a compound movement, meaning it works multiple muscles at once. For runners, it strengthens the exact areas you need for better performance:

- **Quads:** Power your stride forward
- **Glutes:** Stabilize hips and prevent knee pain
- **Hamstrings:** Balance the quads and protect against injury
- **Core:** Maintain upright posture during long runs

## How Squats Improve Running

- **Stronger Stride:** Squats build explosive power, translating into faster acceleration and smoother hill running.
- **Better Endurance:** Stronger leg muscles delay fatigue on long runs.
- **Injury Prevention:** Balanced lower-body strength reduces stress on knees, hips, and ankles.
- **Improved Form:** A stable core and hips keep your running posture efficient.

## How to Do Squats Correctly

1. Stand with feet shoulder-width apart
2. Keep your chest tall and core tight
3. Lower your hips back and down as if sitting in a chair
4. Keep knees aligned with toes
5. Push through your heels to return to standing

**Pro tip:** Start with bodyweight squats, then progress to goblet squats or barbell squats for added strength.

### Did You Know?

Research shows that runners who added squats and lower-body strength work improved their 5K times by up to 5% in just 8 weeks.

## Variations for Runners

- **Split Squats:** Build single-leg strength for balanced strides
- **Jump Squats:** Add explosive power for sprints and hills
- **Bulgarian Split Squats:** Challenge balance and stability

## Final Motivation

Mileage makes you a runner—but strength keeps you running strong. By making squats part of your weekly routine, you''ll boost power, prevent injuries, and unlock new speed and endurance.

👉 **Add squats to your training this week, and feel the difference every time your feet hit the ground.**',
  (SELECT id FROM categories WHERE name = 'Training'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'beginner',
  '6 min',
  true,
  false,
  now()
);