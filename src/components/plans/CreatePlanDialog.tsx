
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import { hasActivePremium } from '@/utils/subscription';

type RaceType = Database['public']['Enums']['race_type'];
type ExperienceLevel = Database['public']['Enums']['experience_level_type'];
type IntensityType = Database['public']['Enums']['intensity_type'];

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanCreated: () => void;
}

const CreatePlanDialog = ({ open, onOpenChange, onPlanCreated }: CreatePlanDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [planDuration, setPlanDuration] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    raceType: '' as RaceType,
    experienceLevel: '' as ExperienceLevel,
    trainingDays: 5,
    raceDate: undefined as Date | undefined,
    trainingStartDate: new Date(),
    trainingIntensity: 'Moderate' as IntensityType,
  });

  // Fetch user profile data when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchUserProfile();
    }
  }, [open, user]);

  // Fetch plan duration when race type or experience level changes
  useEffect(() => {
    if (formData.raceType && formData.experienceLevel) {
      fetchPlanDuration();
    } else {
      setPlanDuration(null);
    }
  }, [formData.raceType, formData.experienceLevel]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: runnerData, error } = await supabase
        .from('runners')
        .select('experience_level, training_days')
        .eq('id', user.id)
        .single();

      if (!error && runnerData) {
        setFormData(prev => ({
          ...prev,
          experienceLevel: runnerData.experience_level || prev.experienceLevel,
          trainingDays: runnerData.training_days || prev.trainingDays,
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPlanDuration = async () => {
    try {
      const { data, error } = await supabase
        .from('phase_durations')
        .select('total_weeks')
        .eq('race_type', formData.raceType)
        .eq('experience_level', formData.experienceLevel)
        .single();

      if (!error && data) {
        setPlanDuration(data.total_weeks);
      } else {
        console.error('Error fetching plan duration:', error);
        setPlanDuration(16); // Fallback to 16 weeks
      }
    } catch (error) {
      console.error('Error fetching plan duration:', error);
      setPlanDuration(16); // Fallback to 16 weeks
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      raceType: '' as RaceType,
      experienceLevel: '' as ExperienceLevel,
      trainingDays: 5,
      raceDate: undefined,
      trainingStartDate: new Date(),
      trainingIntensity: 'Moderate' as IntensityType,
    });
    setPlanDuration(null);
  };

  const handleCreate = async () => {
    if (!user || !formData.name || !formData.raceType || !formData.experienceLevel) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Require active Premium subscription
    const sub = await hasActivePremium(user.id);
    if (!sub.active) {
      toast({
        title: "Premium required",
        description: "Upgrade to Premium to create training plans.",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate('/upgrade');
      return;
    }

    setCreating(true);

    try {
      // Get the user's current fitness score from their profile
      const { data: runnerData, error: runnerError } = await supabase
        .from('runners')
        .select('fitness_score')
        .eq('id', user.id)
        .single();

      if (runnerError) {
        console.error('Error fetching runner data:', runnerError);
        toast({
          title: "Error",
          description: "Failed to fetch your profile data. Please ensure your profile is complete.",
          variant: "destructive",
        });
        return;
      }

      const fitnessScore = runnerData?.fitness_score || 50; // Default to 50 if no fitness score

      // Calculate race date - if not provided, use the plan duration from phase_durations table
      const defaultWeeks = planDuration || 16;
      const raceDate = formData.raceDate || new Date(formData.trainingStartDate.getTime() + (defaultWeeks * 7 * 24 * 60 * 60 * 1000));

      const { data: planId, error } = await supabase.rpc('generate_training_plan', {
        runner_uuid: user.id,
        race_type_param: formData.raceType,
        experience_level_param: formData.experienceLevel,
        fitness_score_param: fitnessScore,
        training_days_param: formData.trainingDays,
        race_date_param: raceDate.toISOString().split('T')[0],
        training_start_date_param: formData.trainingStartDate.toISOString().split('T')[0],
        plan_name_param: formData.name,
        plan_description_param: formData.description || null,
      });

      if (error) {
        console.error('Error creating plan:', error);
        toast({
          title: "Error",
          description: `Failed to create training plan: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Training plan created successfully!",
      });

      resetForm();
      onOpenChange(false);
      onPlanCreated();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Training Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spring Marathon 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raceType">Race Type *</Label>
              <Select value={formData.raceType} onValueChange={(value: RaceType) => setFormData({ ...formData, raceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select race distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5K">5K</SelectItem>
                  <SelectItem value="10K">10K</SelectItem>
                  <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                  <SelectItem value="Marathon">Marathon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of your goals and notes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select value={formData.experienceLevel} onValueChange={(value: ExperienceLevel) => setFormData({ ...formData, experienceLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novice">Novice</SelectItem>
                  <SelectItem value="Recreational">Recreational</SelectItem>
                  <SelectItem value="Competitive">Competitive</SelectItem>
                  <SelectItem value="Elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingDays">Training Days per Week</Label>
              <Select value={formData.trainingDays.toString()} onValueChange={(value) => setFormData({ ...formData, trainingDays: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Race Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.raceDate ? format(formData.raceDate, "PPP") : "No specific race date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.raceDate}
                    onSelect={(date) => setFormData({ ...formData, raceDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                {planDuration 
                  ? `If no race date is selected, we'll generate a ${planDuration}-week plan`
                  : "Select race type and experience level to see plan duration"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>Training Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.trainingStartDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.trainingStartDate}
                    onSelect={(date) => setFormData({ ...formData, trainingStartDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity">Training Intensity</Label>
            <Select value={formData.trainingIntensity} onValueChange={(value: IntensityType) => setFormData({ ...formData, trainingIntensity: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={creating}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlanDialog;
