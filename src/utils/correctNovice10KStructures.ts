
import { supabase } from '@/integrations/supabase/client';

export const correctNovice10KStructures = async () => {
  console.log('Correcting Novice 10K workout structures...');
  
  // Delete existing novice 10K structures that are incorrect
  const { error: deleteError } = await supabase
    .from('workout_structures')
    .delete()
    .eq('race_distance', '10K')
    .eq('experience_level', 'Novice');
    
  if (deleteError) {
    console.error('Error deleting old structures:', deleteError);
    return;
  }
  
  // Insert corrected novice 10K structures with appropriate distances
  const correctStructures = [
    // BASE PHASE - Novice 10K
    {
      workout_type: 'Easy',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Base',
      min_distance: 3.0,
      max_distance: 4.0,
      min_duration: 20,
      max_duration: 30,
      structure_json: {
        description: "Easy run at comfortable conversational pace",
        main: [{
          distance: 3.5,
          pace: "easy",
          effort: "Easy"
        }],
        warmup: { duration: 300, description: "5 min easy walk/jog" },
        cooldown: { duration: 300, description: "5 min cool down walk" }
      }
    },
    {
      workout_type: 'Long',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Base',
      min_distance: 5.0,
      max_distance: 7.0,
      min_duration: 35,
      max_duration: 50,
      structure_json: {
        description: "Long run for endurance building",
        main: [{
          distance: 6.0,
          pace: "easy",
          effort: "Easy"
        }]
      }
    },
    {
      workout_type: 'Recovery',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Base',
      min_distance: 2.0,
      max_distance: 3.0,
      min_duration: 15,
      max_duration: 25,
      structure_json: {
        description: "Recovery run or walk-run intervals",
        main: [{
          distance: 2.5,
          pace: "recovery",
          effort: "Very Easy"
        }]
      }
    },
    
    // BUILD PHASE - Novice 10K
    {
      workout_type: 'Easy',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Build',
      min_distance: 3.5,
      max_distance: 5.0,
      min_duration: 25,
      max_duration: 35,
      structure_json: {
        description: "Easy run at comfortable conversational pace",
        main: [{
          distance: 4.0,
          pace: "easy",
          effort: "Easy"
        }]
      }
    },
    {
      workout_type: 'Tempo',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Build',
      min_distance: 4.0,
      max_distance: 5.0,
      min_duration: 25,
      max_duration: 35,
      structure_json: {
        description: "2K tempo run at comfortably hard effort",
        main: [{
          distance: 2.0,
          pace: "tempo",
          effort: "Comfortably Hard"
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Interval',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Build',
      min_distance: 4.0,
      max_distance: 5.0,
      min_duration: 30,
      max_duration: 40,
      structure_json: {
        description: "6x400m intervals at 10K pace with 90s rest",
        main: [{
          distance: 0.25,
          pace: "10K",
          effort: "Hard",
          reps: 6,
          rest: 90
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Long',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Build',
      min_distance: 6.0,
      max_distance: 8.0,
      min_duration: 40,
      max_duration: 55,
      structure_json: {
        description: "Long run for endurance building",
        main: [{
          distance: 7.0,
          pace: "easy",
          effort: "Easy"
        }]
      }
    },
    
    // PEAK PHASE - Novice 10K
    {
      workout_type: 'Easy',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Peak',
      min_distance: 4.0,
      max_distance: 5.0,
      min_duration: 25,
      max_duration: 35,
      structure_json: {
        description: "Easy run at comfortable conversational pace",
        main: [{
          distance: 4.5,
          pace: "easy",
          effort: "Easy"
        }]
      }
    },
    {
      workout_type: 'Tempo',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Peak',
      min_distance: 5.0,
      max_distance: 6.0,
      min_duration: 30,
      max_duration: 40,
      structure_json: {
        description: "3K tempo run at 10K goal pace",
        main: [{
          distance: 3.0,
          pace: "goal",
          effort: "Comfortably Hard"
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Interval',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Peak',
      min_distance: 5.0,
      max_distance: 6.0,
      min_duration: 35,
      max_duration: 45,
      structure_json: {
        description: "8x400m intervals at 5K pace with 75s rest",
        main: [{
          distance: 0.25,
          pace: "5K",
          effort: "Hard",
          reps: 8,
          rest: 75
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Long',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Peak',
      min_distance: 7.0,
      max_distance: 8.0,
      min_duration: 45,
      max_duration: 55,
      structure_json: {
        description: "Long run with some tempo segments",
        main: [{
          segments: [
            { distance: 2.0, pace: "easy", effort: "Easy" },
            { distance: 2.0, pace: "tempo", effort: "Moderate" },
            { distance: 2.0, pace: "easy", effort: "Easy" }
          ]
        }]
      }
    },
    
    // TAPER PHASE - Novice 10K
    {
      workout_type: 'Easy',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Taper',
      min_distance: 3.0,
      max_distance: 4.0,
      min_duration: 20,
      max_duration: 30,
      structure_json: {
        description: "Easy run to maintain fitness",
        main: [{
          distance: 3.5,
          pace: "easy",
          effort: "Easy"
        }]
      }
    },
    {
      workout_type: 'Tempo',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Taper',
      min_distance: 4.0,
      max_distance: 5.0,
      min_duration: 25,
      max_duration: 35,
      structure_json: {
        description: "Short tempo run to sharpen for race",
        main: [{
          distance: 1.5,
          pace: "goal",
          effort: "Comfortably Hard"
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Interval',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Taper',
      min_distance: 4.0,
      max_distance: 5.0,
      min_duration: 25,
      max_duration: 35,
      structure_json: {
        description: "4x400m strides at race pace",
        main: [{
          distance: 0.25,
          pace: "goal",
          effort: "Hard",
          reps: 4,
          rest: 120
        }],
        warmup: { duration: 600, description: "10 min easy warm-up" },
        cooldown: { duration: 600, description: "10 min easy cool-down" }
      }
    },
    {
      workout_type: 'Long',
      experience_level: 'Novice',
      race_distance: '10K',
      phase: 'Taper',
      min_distance: 5.0,
      max_distance: 6.0,
      min_duration: 35,
      max_duration: 45,
      structure_json: {
        description: "Reduced long run to maintain endurance",
        main: [{
          distance: 5.5,
          pace: "easy",
          effort: "Easy"
        }]
      }
    }
  ];
  
  // Insert corrected structures
  const { data, error } = await supabase
    .from('workout_structures')
    .insert(correctStructures);
    
  if (error) {
    console.error('Error inserting corrected structures:', error);
    return;
  }
  
  console.log('Successfully inserted corrected novice 10K structures:', data);
  return data;
};

// Make it available for testing
if (typeof window !== 'undefined') {
  (window as any).correctNovice10KStructures = correctNovice10KStructures;
}
