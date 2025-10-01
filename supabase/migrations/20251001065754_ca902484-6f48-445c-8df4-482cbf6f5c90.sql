-- Insert the article about periodization training
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
  'Periodization Training: How Elite Runners Plan Their Seasons',
  'periodization-training-how-elite-runners-plan-their-seasons',
  'Periodization training explained—learn how elite runners plan their seasons, build endurance, sharpen speed, and peak on race day.',
  '# Periodization Training: How Elite Runners Plan Their Seasons

Ever wonder how elite runners peak at just the right time—whether it''s the Olympics, a marathon, or a championship race? The secret isn''t just talent. It''s periodization training—a structured way of organizing training into phases that balance stress, recovery, and performance.

The good news? You don''t have to be a pro to use it. With the right approach, periodization can help any runner avoid burnout, reduce injury risk, and hit new personal bests.

## What Is Periodization Training?

Periodization is the practice of dividing the year into specific training blocks, each with its own focus. Instead of training hard all the time, you cycle through different intensities and volumes. This builds fitness gradually and allows your body to peak at the right moment.

> "Train hard, rest smart, peak strong—that''s the essence of periodization."

## The Main Phases of Periodization

### Base Phase (Foundation)

- **Focus:** Easy miles, long runs, aerobic development
- **Why it matters:** Builds endurance and resilience for harder training later

### Build Phase (Strength & Speed)

- **Focus:** Hill workouts, tempos, intervals
- **Why it matters:** Improves strength, running economy, and VO₂ max

### Peak Phase (Race Prep)

- **Focus:** Race-pace workouts, sharpening speed, tapering volume
- **Why it matters:** Prepares your body and mind for top performance

### Recovery Phase (Off-Season)

- **Focus:** Rest, cross-training, reduced mileage
- **Why it matters:** Allows full recovery and prevents burnout

## Why Elite Runners Use Periodization

- **Prevents overtraining:** Alternating phases balances stress and rest.
- **Maximizes performance:** Ensures peak fitness for key races.
- **Improves motivation:** Training variety keeps things fresh.
- **Reduces injury risk:** Gradual progression protects muscles and joints.

### Did You Know?

Many elite marathoners spend 70–80% of their training in low-intensity zones during the base phase—even though they race at high intensity.

## How to Apply Periodization as a Recreational Runner

1. **Pick a goal race:** Work backward from race day to structure your training blocks.
2. **Plan your phases:** Spend 6–8 weeks in each, adjusting based on your fitness level.
3. **Include recovery weeks:** Every 3–4 weeks, reduce mileage by 20–30% to recharge.
4. **Stay flexible:** Life happens—adjust phases if needed rather than skipping them.

## Example: 16-Week Half Marathon Periodization Plan

- **Weeks 1–6:** Base—easy runs + long run progression
- **Weeks 7–10:** Build—add tempos, hills, and strides
- **Weeks 11–13:** Peak—race-pace workouts + sharpen speed
- **Weeks 14–16:** Taper—reduce volume, keep intensity, race strong

## Final Motivation

Periodization isn''t just for pros—it''s for anyone who wants to run stronger, smarter, and healthier. By structuring your training into phases, you''ll build endurance, sharpen speed, and arrive at the start line ready to perform your best.

👉 **Choose your next goal, plan your phases, and train like the elites—one smart block at a time.**',
  (SELECT id FROM categories WHERE name = 'Training'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'advanced',
  '6 min',
  true,
  false,
  now()
);