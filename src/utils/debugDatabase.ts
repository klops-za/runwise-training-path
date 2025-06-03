
import { supabase } from '@/integrations/supabase/client';

export const testDatabaseConnection = async () => {
  try {
    console.log('=== Testing database connection ===');
    
    // Test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from('runners')
      .select('count', { count: 'exact', head: true });
    
    console.log('Table exists test:', { testData, testError });
    
    // Test auth
    const { data: user, error: authError } = await supabase.auth.getUser();
    console.log('Auth test:', { user, authError });
    
    // Test session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session test:', { session, sessionError });
    
    // Test RLS policies by attempting a simple select
    if (user.user) {
      console.log('Testing RLS policies...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('runners')
        .select('*')
        .eq('id', user.user.id);
      
      console.log('RLS test result:', { rlsTest, rlsError });
    }
    
    return { success: !testError && !authError && !sessionError };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error };
  }
};
