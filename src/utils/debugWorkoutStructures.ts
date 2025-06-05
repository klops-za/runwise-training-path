
import { supabase } from '@/integrations/supabase/client';

export const debugWorkoutStructures = async () => {
  console.log('=== Debugging Workout Structures ===');
  
  // Check novice 10K structures
  const { data: novice10K, error } = await supabase
    .from('workout_structures')
    .select('*')
    .eq('race_distance', '10K')
    .eq('experience_level', 'Novice');
    
  if (error) {
    console.error('Error fetching novice 10K structures:', error);
    return;
  }
  
  console.log('Novice 10K Workout Structures:');
  novice10K?.forEach(structure => {
    console.log(`${structure.workout_type} - ${structure.phase}:`, {
      min_distance: structure.min_distance,
      max_distance: structure.max_distance,
      structure_json: structure.structure_json
    });
  });
  
  return novice10K;
};

// Call this function to debug
if (typeof window !== 'undefined') {
  (window as any).debugWorkoutStructures = debugWorkoutStructures;
}
