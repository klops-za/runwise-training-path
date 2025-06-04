
-- Insert the articles from the blog series
-- First, get the category and author IDs
DO $$
DECLARE
    training_cat_id UUID;
    health_cat_id UUID;
    nutrition_cat_id UUID;
    mindset_cat_id UUID;
    author_id UUID;
    aerobic_base_id UUID;
    periodization_id UUID;
    workouts_id UUID;
    strength_id UUID;
    injury_id UUID;
    nutrition_id UUID;
    mental_id UUID;
    customization_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO training_cat_id FROM public.categories WHERE name = 'Training';
    SELECT id INTO health_cat_id FROM public.categories WHERE name = 'Health';
    SELECT id INTO nutrition_cat_id FROM public.categories WHERE name = 'Nutrition';
    SELECT id INTO mindset_cat_id FROM public.categories WHERE name = 'Mindset';
    
    -- Get author ID
    SELECT id INTO author_id FROM public.authors WHERE name = 'Running Expert';

    -- Insert articles
    INSERT INTO public.articles (title, excerpt, content, category_id, author_id, slug, read_time, difficulty, published, published_at, featured) VALUES
    (
        'Building Your Aerobic Base: The Foundation for All Distances',
        'Why every runner—from 5K to marathon—needs a strong aerobic base, and how to build it at any level.',
        E'# Building Your Aerobic Base: The Foundation for All Distances\n\n## Introduction\nA robust aerobic base is the single most important factor for long-distance running success, regardless of your race distance or experience level.\n\n## Why Aerobic Base Matters\nYour aerobic system provides the foundation for all endurance activities. Understanding key concepts like VO₂ max, lactate threshold, and aerobic adaptation helps you train more effectively.\n\n### Key Benefits:\n- Improved oxygen delivery to muscles\n- Enhanced fat oxidation for fuel\n- Better recovery between hard efforts\n- Reduced injury risk through gradual adaptation\n\n## How to Build Your Base\nBuilding an aerobic base requires patience and consistency. The foundation is built through:\n\n### Easy Runs (80% of training)\n- Conversational pace\n- Heart rate in Zone 1-2\n- Focus on time, not speed\n\n### Gradual Progression\n- Increase weekly mileage by 10% each week\n- Take a down week every 4th week\n- Listen to your body\n\n### Sample 8-Week Base Building Plan\n**Beginner (0-20 miles/week):**\n- Week 1: 12 miles (3x4 mile runs)\n- Week 2: 15 miles (3x5 mile runs)\n- Week 3: 18 miles (4x4.5 mile runs)\n- Week 4: 15 miles (recovery week)\n- Week 5: 20 miles (4x5 mile runs)\n- Week 6: 22 miles (4x5.5 mile runs)\n- Week 7: 25 miles (5x5 mile runs)\n- Week 8: 20 miles (recovery week)\n\n## Common Mistakes to Avoid\n1. **Too much intensity too soon** - Save speedwork for later phases\n2. **Ignoring recovery** - Easy days should feel easy\n3. **Impatience** - Base building takes 8-12 weeks minimum\n\n## Action Steps\n1. Determine your current weekly mileage\n2. Plan your base building phase (8-12 weeks)\n3. Focus on consistency over speed\n4. Monitor your progress with a training log\n\n*Remember: A strong base is built slowly but pays dividends in all future training.*',
        training_cat_id,
        author_id,
        'building-aerobic-base-foundation-distances',
        '8 min read',
        'beginner',
        true,
        '2025-06-04',
        true
    ),
    (
        'Periodization Demystified: Structuring Your Training Year',
        'Learn how to organize your training into effective phases for optimal results and injury prevention.',
        E'# Periodization Demystified: Structuring Your Training Year\n\n## Introduction\nPeriodization is the systematic planning of athletic training. It''s the backbone of elite training programs and should guide recreational runners too.\n\n## The Training Phases Explained\n\n### Base Phase (8-12 weeks)\n- Build aerobic capacity\n- Increase weekly mileage gradually\n- 80% easy running, 20% moderate\n- Focus: Volume over intensity\n\n### Build Phase (6-8 weeks)\n- Add tempo runs and intervals\n- Maintain mileage while increasing intensity\n- Sport-specific strength training\n- Focus: Race-specific fitness\n\n### Peak Phase (3-4 weeks)\n- Highest intensity workouts\n- Race-pace practice\n- Tune-up races\n- Focus: Race sharpness\n\n### Taper Phase (1-3 weeks)\n- Reduce volume, maintain intensity\n- Focus on recovery\n- Mental preparation\n- Focus: Arrive fresh and confident\n\n### Transition Phase (2-4 weeks)\n- Active recovery\n- Cross-training\n- Address weaknesses\n- Focus: Physical and mental recovery\n\n## Sample Periodized Plans\n\n### 5K/10K Plan (16 weeks)\n- Base: 8 weeks\n- Build: 6 weeks\n- Peak: 2 weeks\n\n### Half Marathon Plan (18 weeks)\n- Base: 10 weeks\n- Build: 6 weeks\n- Peak: 2 weeks\n\n### Marathon Plan (20 weeks)\n- Base: 12 weeks\n- Build: 6 weeks\n- Peak: 2 weeks\n\n## Actionable Tips\n1. **Schedule backwards** from your goal race\n2. **Include tune-up races** 3-6 weeks before your goal\n3. **Be flexible** - adjust based on how you feel\n4. **Track your progress** with a training log\n\n*Periodization ensures you peak at the right time while minimizing injury risk.*',
        training_cat_id,
        author_id,
        'periodization-demystified-structuring-training-year',
        '10 min read',
        'intermediate',
        true,
        '2025-06-11',
        true
    ),
    (
        'Essential Running Workouts Explained',
        'A deep dive into the key workouts that drive adaptation and performance for every runner.',
        E'# Essential Running Workouts Explained\n\n## Introduction\nUnderstanding the purpose behind each workout type helps you train more effectively and stay motivated.\n\n## The Five Essential Workout Types\n\n### 1. Easy Runs (Aerobic Base)\n**Purpose:** Build aerobic capacity, promote recovery\n**Effort:** Conversational pace (can speak in full sentences)\n**Duration:** 30-90 minutes\n**Frequency:** 3-5 times per week\n\n### 2. Long Runs (Endurance)\n**Purpose:** Build endurance, mental toughness, glycogen storage\n**Effort:** Easy to moderate pace\n**Duration:** 60-180 minutes\n**Frequency:** Once per week\n\n### 3. Tempo Runs (Lactate Threshold)\n**Purpose:** Improve lactate clearance, race pace comfort\n**Effort:** "Comfortably hard" - could say short phrases\n**Duration:** 20-40 minutes at tempo pace\n**Frequency:** Once per week\n\n### 4. Interval Training (VO₂ Max)\n**Purpose:** Improve maximal oxygen uptake, speed endurance\n**Effort:** Hard (7-9/10 effort)\n**Duration:** 3-8 minute intervals with recovery\n**Frequency:** Once per week\n\n### 5. Hill Workouts (Strength/Power)\n**Purpose:** Build strength, improve running economy\n**Effort:** Hard uphill, easy recovery downhill\n**Duration:** 30 seconds to 3 minutes uphill\n**Frequency:** Once every 1-2 weeks\n\n## Sample Weekly Schedules\n\n### Beginner (3-4 days/week)\n- Monday: Rest\n- Tuesday: Easy run (30 min)\n- Wednesday: Rest or cross-training\n- Thursday: Easy run (30 min)\n- Friday: Rest\n- Saturday: Long run (45-60 min)\n- Sunday: Easy run (20-30 min) or rest\n\n### Intermediate (5-6 days/week)\n- Monday: Easy run (45 min)\n- Tuesday: Tempo run (30 min total)\n- Wednesday: Easy run (45 min)\n- Thursday: Intervals (40 min total)\n- Friday: Easy run (30 min) or rest\n- Saturday: Long run (75-120 min)\n- Sunday: Easy run (45 min)\n\n### Advanced (6-7 days/week)\n- Monday: Easy run (60 min)\n- Tuesday: Intervals (50 min total)\n- Wednesday: Easy run (60 min)\n- Thursday: Tempo run (45 min total)\n- Friday: Easy run (45 min)\n- Saturday: Long run (90-180 min)\n- Sunday: Easy run (60 min)\n\n## Workout Progression Tips\n1. **Start conservative** - build intensity gradually\n2. **Quality over quantity** - better to nail a shorter workout\n3. **Listen to your body** - skip hard days if overly fatigued\n4. **Vary your routes** - keep training interesting\n\n*Remember: Every workout has a purpose. Trust the process and be consistent.*',
        training_cat_id,
        author_id,
        'essential-running-workouts-explained',
        '9 min read',
        'all-levels',
        true,
        '2025-06-18',
        true
    ),
    (
        'Strength & Cross-Training for Runners',
        'Why supplemental training is essential—and how to do it right for injury prevention and performance.',
        E'# Strength & Cross-Training for Runners\n\n## Introduction\nRunning is a repetitive motion that can lead to muscle imbalances and overuse injuries. Strength training and cross-training address these issues while improving performance.\n\n## Benefits of Strength Training\n\n### Injury Prevention\n- Strengthens supporting muscles\n- Corrects muscle imbalances\n- Improves bone density\n- Enhances joint stability\n\n### Performance Benefits\n- Improved running economy\n- Better power and speed\n- Enhanced endurance\n- Faster recovery\n\n## Essential Strength Exercises\n\n### Lower Body\n1. **Squats** - Overall leg strength\n2. **Single-leg deadlifts** - Hamstring and glute strength\n3. **Calf raises** - Lower leg power\n4. **Step-ups** - Functional leg strength\n5. **Lunges** - Hip stability and strength\n\n### Core\n1. **Planks** - Core stability\n2. **Dead bugs** - Core control\n3. **Bird dogs** - Back strength\n4. **Russian twists** - Rotational strength\n5. **Glute bridges** - Hip strength\n\n### Upper Body\n1. **Push-ups** - Arm and chest strength\n2. **Pull-ups/rows** - Back strength\n3. **Shoulder press** - Shoulder stability\n\n## 2x/Week Strength Routine\n\n### Day 1: Lower Body Focus\n- Squats: 3x12\n- Single-leg deadlifts: 3x10 each leg\n- Calf raises: 3x15\n- Planks: 3x30-60 seconds\n- Glute bridges: 3x15\n\n### Day 2: Upper Body & Core\n- Push-ups: 3x10-15\n- Pull-ups/rows: 3x8-12\n- Shoulder press: 3x10\n- Dead bugs: 3x10 each side\n- Russian twists: 3x20\n\n## Cross-Training Options\n\n### Low Impact Options\n- **Swimming** - Full-body, non-impact\n- **Cycling** - Leg strength, cardiovascular\n- **Elliptical** - Running motion, low impact\n- **Aqua jogging** - Running motion, zero impact\n\n### Active Recovery\n- **Yoga** - Flexibility and mindfulness\n- **Walking** - Gentle movement\n- **Foam rolling** - Self-massage\n- **Stretching** - Mobility maintenance\n\n## Integration by Training Phase\n\n### Base Phase\n- 2-3 strength sessions per week\n- Higher volume, moderate intensity\n- Focus on building strength foundation\n\n### Build Phase\n- 2 strength sessions per week\n- Maintain strength while increasing running\n- Sport-specific movements\n\n### Peak Phase\n- 1-2 strength sessions per week\n- Maintenance only\n- Light, movement-based sessions\n\n## Timing Your Sessions\n- **After easy runs** - When legs are warm\n- **On rest days** - When fresh\n- **Never before hard workouts** - Avoid fatigue\n\n*Consistency is key - 20-30 minutes twice a week is better than one long session.*',
        training_cat_id,
        author_id,
        'strength-cross-training-runners',
        '7 min read',
        'beginner',
        true,
        '2025-06-25',
        false
    ),
    (
        'Injury Prevention and Recovery for Runners',
        'Stay healthy and consistent with these proven strategies for recovery and injury prevention.',
        E'# Injury Prevention and Recovery for Runners\n\n## Introduction\nStaying healthy is the most important factor in long-term running success. Consistency trumps intensity every time.\n\n## Common Running Injuries\n\n### Most Frequent Issues\n1. **Runner''s knee** - Pain around kneecap\n2. **IT band syndrome** - Pain on outside of knee\n3. **Plantar fasciitis** - Heel and arch pain\n4. **Shin splints** - Lower leg pain\n5. **Achilles tendonitis** - Heel cord pain\n\n### Primary Causes\n- **Too much, too soon** - Rapid mileage increases\n- **Poor running form** - Inefficient mechanics\n- **Inadequate recovery** - Not enough rest\n- **Muscle imbalances** - Weak supporting muscles\n- **Worn-out shoes** - Inadequate support\n\n## Prevention Strategies\n\n### The 10% Rule\n- Increase weekly mileage by no more than 10%\n- Take a down week every 4th week\n- Build gradually over months, not weeks\n\n### Proper Warm-up\n**5-minute routine:**\n1. Walking (1 minute)\n2. Leg swings (30 seconds each direction)\n3. High knees (30 seconds)\n4. Butt kicks (30 seconds)\n5. Easy jogging (2 minutes)\n\n### Cool-down Protocol\n**10-minute routine:**\n1. Walking (2 minutes)\n2. Static stretching (5 minutes)\n3. Foam rolling (3 minutes)\n\n### Strength Training\n- 2x per week minimum\n- Focus on hips, glutes, and core\n- Address muscle imbalances\n\n### Proper Footwear\n- Replace shoes every 300-500 miles\n- Get professionally fitted\n- Consider your foot type and gait\n- Rotate between 2-3 pairs\n\n## Recovery Methods\n\n### Sleep (Most Important)\n- 7-9 hours per night\n- Consistent sleep schedule\n- Cool, dark environment\n- No screens 1 hour before bed\n\n### Active Recovery\n- Easy walking\n- Gentle swimming\n- Yoga or stretching\n- Light cycling\n\n### Passive Recovery\n- Complete rest\n- Massage\n- Compression therapy\n- Ice baths (post-hard efforts)\n\n### Nutrition for Recovery\n- **Within 30 minutes post-run:**\n  - 3:1 carb to protein ratio\n  - Chocolate milk works great\n- **Daily hydration:**\n  - Half your body weight in ounces\n  - More in hot weather\n\n## Warning Signs to Stop\n\n### When to Take a Day Off\n- Persistent pain that worsens during running\n- Excessive fatigue or sluggishness\n- Elevated resting heart rate\n- Disturbed sleep patterns\n- Irritability or mood changes\n\n### When to See a Professional\n- Pain that doesn''t improve with 3-5 days rest\n- Pain that affects your gait\n- Swelling or visible deformity\n- Numbness or tingling\n\n## Creating Your Recovery Plan\n\n### Daily\n- Quality sleep\n- Proper hydration\n- Post-run stretching\n\n### Weekly\n- 1-2 complete rest days\n- 1-2 easy/recovery runs\n- Strength training sessions\n\n### Monthly\n- Down week (reduce volume by 20-30%)\n- Massage or soft tissue work\n- Assessment of training and goals\n\n*Remember: It''s better to be 90% trained and 100% healthy than 100% trained and injured.*',
        health_cat_id,
        author_id,
        'injury-prevention-recovery-runners',
        '8 min read',
        'all-levels',
        true,
        '2025-07-02',
        false
    ),
    (
        'Runner''s Nutrition & Hydration Guide',
        'Master the essentials of fueling and hydrating for training, race day, and recovery.',
        E'# Runner''s Nutrition & Hydration Guide\n\n## Introduction\nProper nutrition and hydration are the fuel for your running engine. Get these right, and everything else becomes easier.\n\n## Macronutrient Needs for Runners\n\n### Carbohydrates (45-65% of calories)\n**Why:** Primary fuel for high-intensity exercise\n**Sources:** Whole grains, fruits, vegetables, legumes\n**Timing:** \n- Before runs: 1-4g per kg body weight (1-4 hours prior)\n- During runs: 30-60g per hour (runs >60 minutes)\n- After runs: 1-1.2g per kg body weight (within 30 minutes)\n\n### Protein (15-20% of calories)\n**Why:** Muscle repair and recovery\n**Sources:** Lean meats, fish, eggs, dairy, legumes, nuts\n**Amount:** 1.2-1.6g per kg body weight daily\n**Timing:** 15-25g within 30 minutes post-run\n\n### Fats (20-35% of calories)\n**Why:** Energy for easy runs, hormone production\n**Sources:** Nuts, seeds, avocados, olive oil, fatty fish\n**Note:** Avoid high-fat meals 3-4 hours before running\n\n## Pre-Run Fueling\n\n### 3-4 Hours Before\n- Large meal with familiar foods\n- High carbs, moderate protein, low fat/fiber\n- Example: Oatmeal with banana and honey\n\n### 1-2 Hours Before\n- Small snack if needed\n- Easily digestible carbs\n- Example: Toast with jam, sports drink\n\n### 30 Minutes Before\n- Only if you''re used to it\n- Simple carbs\n- Example: Banana, energy gel\n\n## During-Run Fueling\n\n### When to Fuel\n- Runs longer than 60-90 minutes\n- High-intensity efforts >45 minutes\n- Hot weather conditions\n\n### What to Use\n- **Sports drinks:** Carbs + electrolytes\n- **Energy gels:** Concentrated carbs\n- **Real food:** Dates, bananas (for long runs)\n\n### How Much\n- 30-60g carbs per hour\n- Start early (within first 30 minutes)\n- Practice in training, never try new things on race day\n\n## Post-Run Recovery\n\n### The Golden Hour\n**Within 30 minutes:**\n- 3:1 carb to protein ratio\n- 0.5-1g carbs per kg body weight\n- 15-25g protein\n\n### Great Recovery Options\n- Chocolate milk\n- Greek yogurt with berries\n- Turkey and cheese sandwich\n- Protein smoothie with fruit\n\n## Hydration Guidelines\n\n### Daily Hydration\n- **Baseline:** Half your body weight in ounces\n- **Example:** 150 lb person = 75 oz (about 9 cups)\n- **Add more for:** Hot weather, high altitude, caffeine/alcohol\n\n### Pre-Run Hydration\n- 16-20 oz, 2-3 hours before\n- 8 oz, 15-20 minutes before\n- Check urine color (pale yellow is ideal)\n\n### During-Run Hydration\n- 4-6 oz every 15-20 minutes\n- Sports drink for runs >60 minutes\n- Listen to your thirst\n\n### Post-Run Hydration\n- 150% of fluid lost through sweat\n- Weigh yourself before/after to estimate losses\n- Include electrolytes if you''re a heavy sweater\n\n## Race Day Nutrition Strategy\n\n### Pre-Race (3-4 hours)\n- **Breakfast:** Familiar, high-carb, low-fiber\n- **Examples:**\n  - Oatmeal with banana\n  - Toast with honey\n  - Sports drink\n\n### During Race\n- **5K/10K:** Usually no fueling needed\n- **Half Marathon:** Sports drink at aid stations\n- **Marathon:** 30-60g carbs per hour after mile 6\n\n### Post-Race\n- Start with fluids\n- Add carbs and protein within 30 minutes\n- Celebrate appropriately!\n\n## Sample Daily Meal Plan\n\n### For a 150 lb runner training 5-6 days/week\n\n**Breakfast:**\n- Oatmeal with berries and nuts\n- Greek yogurt\n- Coffee\n\n**Lunch:**\n- Quinoa bowl with vegetables and chicken\n- Side of fruit\n- Water\n\n**Snack:**\n- Apple with almond butter\n\n**Dinner:**\n- Salmon with sweet potato and broccoli\n- Small salad\n- Water\n\n**Post-Run (if needed):**\n- Chocolate milk or protein smoothie\n\n## Supplements: What''s Worth It?\n\n### Evidence-Based Options\n- **Vitamin D:** If deficient (get tested)\n- **Iron:** If deficient (common in female runners)\n- **Creatine:** May help with power/strength training\n\n### Usually Not Needed\n- Multivitamins (get nutrients from food)\n- BCAAs (complete proteins are better)\n- Fat burners (focus on whole foods)\n\n*Remember: Real food first, supplements are just that - supplements to a good diet.*',
        nutrition_cat_id,
        author_id,
        'runners-nutrition-hydration-guide',
        '10 min read',
        'intermediate',
        true,
        '2025-07-09',
        false
    ),
    (
        'Mental Strategies & Race Day Execution',
        'Harness the power of your mind and execute a winning race day plan.',
        E'# Mental Strategies & Race Day Execution\n\n## Introduction\nRunning is as much mental as it is physical. Developing mental skills can be the difference between a good race and a great one.\n\n## Building Mental Toughness\n\n### Goal Setting\n**SMART Goals Framework:**\n- **Specific:** "Run a 5K in under 25 minutes"\n- **Measurable:** Use time, pace, or placement\n- **Achievable:** Based on current fitness\n- **Relevant:** Aligns with your values\n- **Time-bound:** Set a target date\n\n### Visualization Techniques\n**Daily Practice (5-10 minutes):**\n1. Find a quiet space\n2. Close your eyes and relax\n3. Visualize your goal race from start to finish\n4. Include all senses - sights, sounds, feelings\n5. Practice handling challenges (hills, fatigue, weather)\n6. End with achieving your goal and celebrating\n\n### Positive Self-Talk\n**Replace negative thoughts:**\n- "I can''t do this" → "This is challenging, but I''m prepared"\n- "I''m too slow" → "I''m getting stronger every step"\n- "I want to quit" → "I''ve trained for this moment"\n\n## Mental Strategies During Training\n\n### Breaking Down Long Runs\n- **Segment approach:** Divide into smaller chunks\n- **Landmark method:** Run from one landmark to the next\n- **Time blocking:** Focus on 5-10 minute intervals\n\n### Dealing with Discomfort\n1. **Acknowledge:** "This is hard, and that''s okay"\n2. **Reframe:** "This is making me stronger"\n3. **Focus on form:** Concentrate on technique\n4. **Use mantras:** Short, powerful phrases\n\n### Mantras That Work\n- "One step at a time"\n- "Strong and steady"\n- "I am prepared"\n- "Embrace the challenge"\n- "This is my moment"\n\n## Pre-Race Mental Preparation\n\n### Week Before Race\n- **Visualize success daily**\n- **Review your race plan**\n- **Practice positive self-talk**\n- **Avoid negative race reports or stories**\n- **Trust your training**\n\n### Night Before\n- **Prepare everything** (clothes, bib, fuel)\n- **Get adequate sleep** (7-8 hours)\n- **Avoid new foods or activities**\n- **Do light visualization**\n- **Set multiple alarms**\n\n### Morning of Race\n- **Follow your routine**\n- **Eat familiar breakfast**\n- **Arrive early but not too early**\n- **Stay warm and relaxed**\n- **Positive self-talk**\n\n## Race Day Execution\n\n### Start Line Strategy\n**15 minutes before:**\n- Final bathroom break\n- Dynamic warm-up\n- Practice race pace for 30 seconds\n- Deep breathing exercises\n- Positive mantras\n\n### Race Execution by Distance\n\n#### 5K Strategy\n- **Mile 1:** Settle into rhythm (slightly conservative)\n- **Mile 2:** Hold steady, stay relaxed\n- **Mile 3 + 0.1:** Give everything you have left\n\n#### 10K Strategy\n- **Miles 1-2:** Controlled effort, find your rhythm\n- **Miles 3-4:** Maintain pace, stay patient\n- **Miles 5-6:** Gradually increase effort\n- **Final 0.2:** Empty the tank\n\n#### Half Marathon Strategy\n- **Miles 1-3:** Conservative start, settle in\n- **Miles 4-8:** Find your groove, stay comfortable\n- **Miles 9-11:** Maintain focus, prepare for challenge\n- **Miles 12-13.1:** Dig deep, finish strong\n\n#### Marathon Strategy\n- **Miles 1-6:** Easy effort, save energy\n- **Miles 7-13:** Settle into marathon pace\n- **Miles 14-20:** Stay mentally engaged\n- **Miles 21-26.2:** One mile at a time, mental toughness\n\n### Managing Race Day Challenges\n\n**When things go wrong:**\n1. **Stay calm** - don''t panic\n2. **Assess** - is it serious or just discomfort?\n3. **Adapt** - adjust pace or goals if needed\n4. **Refocus** - return to your mantras\n5. **Remember why** - recall your motivation\n\n### Pacing Strategies\n\n**Negative Split:**\n- Run second half faster than first\n- Conservative start, strong finish\n- Best for beginners\n\n**Even Split:**\n- Consistent pace throughout\n- Requires good pacing sense\n- Most efficient for experienced runners\n\n**Variable Pacing:**\n- Adjust for course and conditions\n- Slower uphill, faster downhill\n- Advanced strategy\n\n## Post-Race Mental Recovery\n\n### Immediate Post-Race\n- **Celebrate your effort** regardless of outcome\n- **Focus on positives** from the experience\n- **Avoid immediate analysis** of what went wrong\n\n### Week After\n- **Reflect objectively** on the race\n- **Identify lessons learned**\n- **Set new goals** when ready\n- **Appreciate your progress**\n\n## Building Confidence\n\n### Through Training\n- **Complete your workouts** as prescribed\n- **Practice race pace** regularly\n- **Simulate race conditions** in training\n- **Keep a training log** to see progress\n\n### Through Experience\n- **Start with shorter races** to build confidence\n- **Focus on process goals** not just outcome\n- **Learn from each race**\n- **Celebrate small victories**\n\n*Remember: Your mind is your most powerful tool. Train it just like you train your body.*',
        mindset_cat_id,
        author_id,
        'mental-strategies-race-day-execution',
        '8 min read',
        'all-levels',
        true,
        '2025-07-16',
        false
    ),
    (
        'Customizing Your Running Plan: Pacing & Adaptation',
        'Learn how to personalize your training, set the right paces, and adapt as you improve.',
        E'# Customizing Your Running Plan: Pacing & Adaptation\n\n## Introduction\nGeneric training plans are a starting point, but truly effective training is individualized. Learn how to customize your plan for optimal results.\n\n## Understanding Your Current Fitness\n\n### Recent Race Performance\n**Use recent race times to set training paces:**\n- Race within last 6 months is most accurate\n- Adjust for weather, course difficulty, and fitness changes\n- Use online pace calculators as a starting point\n\n### Heart Rate Training\n**Finding your zones:**\n- **Zone 1 (Easy):** 60-70% max HR\n- **Zone 2 (Aerobic):** 70-80% max HR\n- **Zone 3 (Tempo):** 80-90% max HR\n- **Zone 4 (Threshold):** 90-95% max HR\n- **Zone 5 (VO₂ Max):** 95-100% max HR\n\n**Estimating Max HR:**\n- Formula: 220 - age (rough estimate)\n- Field test: 5-minute all-out effort\n- Lab test: Most accurate but not necessary\n\n### Rate of Perceived Exertion (RPE)\n**1-10 Scale:**\n- **1-2:** Very easy, can sing\n- **3-4:** Easy, conversational\n- **5-6:** Moderate, somewhat hard\n- **7-8:** Hard, can speak short phrases\n- **9-10:** Very hard to maximal\n\n## Setting Your Training Paces\n\n### Easy/Recovery Pace\n- **Feel:** Conversational, relaxed\n- **HR:** Zone 1-2 (60-80% max HR)\n- **RPE:** 3-5 out of 10\n- **Purpose:** Aerobic base, recovery\n\n### Long Run Pace\n- **Feel:** Comfortable, steady\n- **HR:** Zone 1-2 (70-80% max HR)\n- **RPE:** 4-6 out of 10\n- **Rule:** 30-90 seconds slower than goal race pace\n\n### Tempo Pace\n- **Feel:** Comfortably hard, sustainable\n- **HR:** Zone 3 (80-90% max HR)\n- **RPE:** 6-7 out of 10\n- **Benchmark:** Current 10K to half marathon pace\n\n### Interval Pace\n- **Feel:** Hard but controlled\n- **HR:** Zone 4-5 (90-100% max HR)\n- **RPE:** 7-9 out of 10\n- **Benchmark:** Current 5K to 10K pace\n\n## Individualization Factors\n\n### Age Considerations\n**Younger runners (teens-20s):**\n- Can handle more intensity\n- Recover faster\n- May need more easy running to prevent burnout\n\n**Master runners (40+):**\n- Need more recovery time\n- Benefit from consistency over intensity\n- May need longer warm-ups\n\n### Experience Level\n**Beginners:**\n- Focus on time over pace\n- 80% easy running minimum\n- Build slowly and consistently\n\n**Experienced runners:**\n- Can handle more intensity\n- Need variety to continue improving\n- May benefit from periodized training\n\n### Training History\n**Coming back from injury:**\n- Start very conservatively\n- Gradual progression is key\n- Listen to your body above all else\n\n**High training background:**\n- May need higher volume to see improvements\n- Can handle more sophisticated training\n- Risk of overtraining if not careful\n\n## Adapting Your Training\n\n### When to Adjust Paces\n**Positive indicators:**\n- Easy runs feel easier at same pace\n- Heart rate lower at same effort\n- Recovery faster between intervals\n- Recent race performance improved\n\n**How to adjust:**\n- Use recent race times for new calculations\n- Adjust gradually (5-10 seconds per mile)\n- Test new paces in workouts before committing\n\n### Signs You Need to Back Off\n**Physical signs:**\n- Elevated resting heart rate\n- Persistent fatigue\n- Decreased performance in workouts\n- Increased susceptibility to illness\n\n**Mental signs:**\n- Loss of motivation\n- Dreading runs\n- Irritability or mood changes\n- Sleep disturbances\n\n### Environmental Adjustments\n\n**Hot Weather:**\n- Slow easy pace by 20-30 seconds per mile\n- Reduce intensity of hard workouts\n- Focus on effort over pace\n- Increase hydration\n\n**Cold Weather:**\n- Longer warm-up needed\n- May run slightly faster once warmed up\n- Layer appropriately\n- Be cautious of ice/snow\n\n**Altitude:**\n- Slow pace by 10-20 seconds per 1000 feet\n- Expect decreased performance initially\n- Allow 2-3 weeks for adaptation\n- Stay extra hydrated\n\n## Creating Your Personal Training Plan\n\n### Step 1: Assess Current Fitness\n- Recent race time or time trial\n- Current weekly mileage\n- Training history and experience\n\n### Step 2: Set Realistic Goals\n- Based on current fitness and time available\n- Include process goals, not just outcome goals\n- Build in flexibility for life circumstances\n\n### Step 3: Choose Your Structure\n- Decide on training days per week\n- Plan your hard/easy day distribution\n- Schedule based on your lifestyle\n\n### Step 4: Monitor and Adjust\n- Keep a training log\n- Track how you feel, not just what you did\n- Be willing to adjust when needed\n\n## Advanced Personalization\n\n### Biomechanical Considerations\n- **High cadence runners:** May benefit from shorter, quicker steps\n- **Long striders:** May excel at longer distances\n- **Heavy heel strikers:** May need more recovery\n\n### Metabolic Considerations\n- **Good fat burners:** May excel at ultra distances\n- **Fast-twitch dominant:** May be better at shorter, faster efforts\n- **Carb-dependent:** May need more fueling during long runs\n\n## Tools for Personalization\n\n### Technology\n- **GPS watches:** For pace and heart rate data\n- **Training apps:** For logging and analysis\n- **Online calculators:** For pace predictions\n\n### Low-Tech Options\n- **Training log:** Simple notebook works great\n- **Talk test:** For easy run pace\n- **Perceived effort:** Most important metric\n\n*Remember: The best training plan is the one you can consistently follow. Listen to your body and adjust accordingly.*',
        training_cat_id,
        author_id,
        'customizing-running-plan-pacing-adaptation',
        '9 min read',
        'advanced',
        true,
        '2025-07-23',
        false
    ) RETURNING id INTO aerobic_base_id, periodization_id, workouts_id, strength_id, injury_id, nutrition_id, mental_id, customization_id;

    -- Insert tags
    INSERT INTO public.tags (name) VALUES 
    ('aerobic-base'), ('endurance'), ('beginner'), ('periodization'), ('training-cycles'), ('planning'),
    ('workouts'), ('intervals'), ('tempo'), ('long-run'), ('strength-training'), ('cross-training'),
    ('injury-prevention'), ('recovery'), ('rest'), ('nutrition'), ('hydration'), ('fueling'),
    ('mental-preparation'), ('race-day'), ('strategy'), ('individualization'), ('pacing'), ('adaptation')
    ON CONFLICT (name) DO NOTHING;

    -- Link articles to tags (simplified - you can expand this)
    INSERT INTO public.article_tags (article_id, tag_id)
    SELECT aerobic_base_id, id FROM public.tags WHERE name IN ('aerobic-base', 'endurance', 'beginner')
    UNION ALL
    SELECT periodization_id, id FROM public.tags WHERE name IN ('periodization', 'training-cycles', 'planning')
    UNION ALL
    SELECT workouts_id, id FROM public.tags WHERE name IN ('workouts', 'intervals', 'tempo', 'long-run')
    UNION ALL
    SELECT strength_id, id FROM public.tags WHERE name IN ('strength-training', 'cross-training', 'injury-prevention')
    UNION ALL
    SELECT injury_id, id FROM public.tags WHERE name IN ('injury-prevention', 'recovery', 'rest')
    UNION ALL
    SELECT nutrition_id, id FROM public.tags WHERE name IN ('nutrition', 'hydration', 'fueling')
    UNION ALL
    SELECT mental_id, id FROM public.tags WHERE name IN ('mental-preparation', 'race-day', 'strategy')
    UNION ALL
    SELECT customization_id, id FROM public.tags WHERE name IN ('individualization', 'pacing', 'adaptation');

END $$;
