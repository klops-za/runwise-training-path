-- Insert the article about heart rate zones
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
  'Heart Rate Zones Explained: Train Smarter, Not Harder',
  'heart-rate-zones-explained-train-smarter-not-harder',
  'Heart rate zones explained—learn how to train smarter, not harder. Boost endurance, speed, and recovery with heart rate-based running.',
  '# Heart Rate Zones Explained: Train Smarter, Not Harder

Running isn''t just about how far or how fast you go—it''s about how smart you train. One of the best ways to level up your training is by using heart rate zones. By training in specific zones, you''ll know whether you''re building endurance, improving speed, or pushing too hard.

Let''s break down what heart rate zones are, how to find yours, and how to use them to run smarter, not harder.

## What Are Heart Rate Zones?

Heart rate zones are ranges of intensity based on your maximum heart rate (HRmax). Each zone targets a different aspect of fitness: endurance, speed, or recovery.

**A common formula for estimating HRmax is:**

220 – your age = HRmax

From there, your zones are calculated as percentages of HRmax.

## The 5 Heart Rate Zones

### Zone 1: Very Easy (50–60% HRmax)

- Gentle effort, like a warm-up or recovery jog
- Builds base fitness and helps with active recovery

### Zone 2: Easy (60–70% HRmax)

- Conversational pace—you can talk in full sentences
- Best for endurance and fat-burning
- Where most long runs should happen

### Zone 3: Moderate (70–80% HRmax)

- Comfortable but challenging pace
- Improves aerobic capacity and stamina
- Great for steady-state runs

### Zone 4: Hard (80–90% HRmax)

- Breathing heavily, only short phrases possible
- Improves speed and lactate threshold
- Used in tempo runs and intervals

### Zone 5: Maximum Effort (90–100% HRmax)

- All-out effort, lasts only seconds to minutes
- Builds top-end speed and power
- Used sparingly in sprint training

### Did You Know?

Elite marathoners spend 80–85% of their training in Zones 1 and 2, not in the higher zones most beginners gravitate toward.

## How to Use Heart Rate Training

- **Base building:** Run mostly in Zone 2 to build endurance without overtraining.
- **Speed workouts:** Use Zone 4 for tempo runs and Zone 5 for short intervals.
- **Recovery days:** Stick to Zone 1 for active recovery.

**Pro tip:** Don''t rely only on pace—heart rate adjusts for heat, stress, and fatigue, giving you a truer picture of effort.

## Tools for Tracking Heart Rate

- **Chest strap monitors:** Most accurate option
- **Wrist-based watches:** Convenient but less precise
- **Apps:** Many running apps sync with monitors to track your data

## Final Motivation

Heart rate zones take the guesswork out of training. Instead of running harder all the time, you''ll learn when to push—and when to hold back. The result? Better endurance, faster times, and fewer injuries.

👉 **Train by your heart, not just your watch, and you''ll unlock your smartest running yet.**',
  (SELECT id FROM categories WHERE name = 'Training'),
  (SELECT id FROM authors WHERE name = 'Running Expert'),
  'intermediate',
  '6 min',
  true,
  false,
  now()
);