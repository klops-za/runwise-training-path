
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Plus, Archive, Play, Trash2, Copy, Eye, Settings } from 'lucide-react';
import CreatePlanDialog from '@/components/plans/CreatePlanDialog';
import type { Database } from '@/integrations/supabase/types';

type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];

const Plans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('runner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load training plans.",
          variant: "destructive",
        });
        return;
      }

      setPlans(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const activatePlan = async (planId: string) => {
    if (!user) return;

    try {
      // Archive all current active plans
      await supabase
        .from('training_plans')
        .update({ status: 'archived' })
        .eq('runner_id', user.id)
        .eq('status', 'active');

      // Activate the selected plan
      const { error } = await supabase
        .from('training_plans')
        .update({ status: 'active' })
        .eq('id', planId);

      if (error) {
        console.error('Error activating plan:', error);
        toast({
          title: "Error",
          description: "Failed to activate plan.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Plan activated successfully!",
      });

      fetchPlans();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const archivePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('training_plans')
        .update({ status: 'archived' })
        .eq('id', planId);

      if (error) {
        console.error('Error archiving plan:', error);
        toast({
          title: "Error",
          description: "Failed to archive plan.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Plan archived successfully!",
      });

      fetchPlans();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      // First delete all workouts for this plan
      await supabase
        .from('workouts')
        .delete()
        .eq('plan_id', planId);

      // Then delete the plan
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: "Error",
          description: "Failed to delete plan.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Plan deleted successfully!",
      });

      fetchPlans();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calculateProgress = (plan: TrainingPlan) => {
    const planData = plan.plan_data as any;
    const totalWeeks = planData?.total_weeks || 16;
    const startDate = plan.start_date ? new Date(plan.start_date) : new Date();
    const weeksElapsed = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7));
    const currentWeek = Math.min(Math.max(weeksElapsed + 1, 1), totalWeeks);
    return Math.round((currentWeek / totalWeeks) * 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Training Plans</h1>
            <p className="text-muted-foreground">Manage your training plans and track your progress</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Training Plans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first training plan to start your running journey.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const progress = calculateProgress(plan);
              const planData = plan.plan_data as any;
              
              return (
                <Card key={plan.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge className={getStatusColor(plan.status || 'active')}>
                        {plan.status || 'active'}
                      </Badge>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Race Type</p>
                        <p className="font-medium">{plan.race_type || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Weeks</p>
                        <p className="font-medium">{planData?.total_weeks || 16}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{formatDate(plan.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(plan.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-4">
                      {plan.status === 'active' ? (
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/schedule')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Schedule
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => activatePlan(plan.id)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      
                      {plan.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => archivePlan(plan.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Training Plan</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{plan.name}"? This action cannot be undone and will remove all associated workouts.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePlan(plan.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreatePlanDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPlanCreated={fetchPlans}
      />
    </div>
  );
};

export default Plans;
