
import { useState } from 'react';
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
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    raceType: '' as RaceType,
    experienceLevel: '' as ExperienceLevel,
    trainingDays: 5,
    raceDate: undefined as Date | undefined,
    trainingStartDate: new Date(),
    fitnessScore: 50,
    trainingIntensity: 'Moderate' as IntensityType,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      raceType: '' as RaceType,
      experienceLevel: '' as ExperienceLevel,
      trainingDays: 5,
      raceDate: undefined,
      trainingStartDate: new Date(),
      fitnessScore: 50,
      trainingIntensity: 'Moderate' as IntensityType,
    });
  };

  const handleCreate = async () => {
    if (!user || !formData.name || !formData.raceType || !formData.experienceLevel || !formData.raceDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      const { data: planId, error } = await supabase.rpc('generate_training_plan', {
        runner_uuid: user.id,
        race_type_param: formData.raceType,
        experience_level_param: formData.experienceLevel,
        fitness_score_param: formData.fitnessScore,
        training_days_param: formData.trainingDays,
        race_date_param: formData.raceDate.toISOString().split('T')[0],
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
              <Label>Race Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.raceDate ? format(formData.raceDate, "PPP") : "Select race date"}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fitnessScore">Fitness Score (1-100)</Label>
              <Input
                id="fitnessScore"
                type="number"
                min="1"
                max="100"
                value={formData.fitnessScore}
                onChange={(e) => setFormData({ ...formData, fitnessScore: parseInt(e.target.value) || 50 })}
              />
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
