
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import type { Database } from '@/integrations/supabase/types';

type RunnerUpdate = Database['public']['Tables']['runners']['Update'];

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    experience_level: '',
    weekly_mileage: '',
    training_days: '',
    preferred_unit: 'mi',
    fitness_score: '',
    recent_race_distance: '',
    recent_race_time: '',
    race_goal: '',
    race_date: '',
    training_intensity_preference: '',
    injury_history: '',
    cross_training_preferences: [] as string[],
    training_start_date: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('runners')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Error",
            description: "Failed to load your profile.",
            variant: "destructive",
          });
          return;
        }

        if (profile) {
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            age: profile.age?.toString() || '',
            gender: profile.gender || '',
            height_cm: profile.height_cm?.toString() || '',
            weight_kg: profile.weight_kg?.toString() || '',
            experience_level: profile.experience_level || '',
            weekly_mileage: profile.weekly_mileage?.toString() || '',
            training_days: profile.training_days?.toString() || '',
            preferred_unit: profile.preferred_unit || 'mi',
            fitness_score: profile.fitness_score?.toString() || '',
            recent_race_distance: profile.recent_race_distance || '',
            recent_race_time: profile.recent_race_time || '',
            race_goal: profile.race_goal || '',
            race_date: profile.race_date || '',
            training_intensity_preference: profile.training_intensity_preference || '',
            injury_history: profile.injury_history || '',
            cross_training_preferences: profile.cross_training_preferences || [],
            training_start_date: profile.training_start_date || ''
          });
        }
      } catch (error) {
        console.error('Unexpected error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCrossTrainingChange = (activity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cross_training_preferences: checked 
        ? [...prev.cross_training_preferences, activity]
        : prev.cross_training_preferences.filter(a => a !== activity)
    }));
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData: RunnerUpdate = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender ? (formData.gender as Database['public']['Enums']['gender_type']) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        experience_level: formData.experience_level ? (formData.experience_level as Database['public']['Enums']['experience_level_type']) : null,
        weekly_mileage: formData.weekly_mileage ? parseFloat(formData.weekly_mileage) : null,
        training_days: formData.training_days ? parseInt(formData.training_days) : null,
        preferred_unit: formData.preferred_unit as Database['public']['Enums']['unit_type'],
        fitness_score: formData.fitness_score ? parseFloat(formData.fitness_score) : null,
        recent_race_distance: formData.recent_race_distance ? (formData.recent_race_distance as Database['public']['Enums']['race_type']) : null,
        recent_race_time: formData.recent_race_time || null,
        race_goal: formData.race_goal ? (formData.race_goal as Database['public']['Enums']['race_type']) : null,
        race_date: formData.race_date || null,
        training_intensity_preference: formData.training_intensity_preference ? (formData.training_intensity_preference as Database['public']['Enums']['intensity_type']) : null,
        injury_history: formData.injury_history || null,
        cross_training_preferences: formData.cross_training_preferences.length > 0 ? formData.cross_training_preferences : null,
        training_start_date: formData.training_start_date || null
      };

      const { error } = await supabase
        .from('runners')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update your profile.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const crossTrainingOptions = ['Swimming', 'Cycling', 'Yoga', 'Elliptical', 'None'];
  const heightLabel = formData.preferred_unit === 'mi' ? 'Height (inches)' : 'Height (cm)';
  const weightLabel = formData.preferred_unit === 'mi' ? 'Weight (lbs)' : 'Weight (kg)';
  const mileageLabel = formData.preferred_unit === 'mi' ? 'Current Weekly Mileage (miles)' : 'Current Weekly Mileage (km)';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">Update your running profile and preferences</p>
            </div>
            <Button 
              onClick={saveProfile}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="border-blue-100 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name" className="text-foreground">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name" className="text-foreground">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-foreground">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-foreground">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Preferred Units</Label>
                  <RadioGroup 
                    value={formData.preferred_unit} 
                    onValueChange={(value) => handleInputChange('preferred_unit', value)}
                    className="flex space-x-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mi" id="miles" />
                      <Label htmlFor="miles" className="text-foreground">Miles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="km" id="kilometers" />
                      <Label htmlFor="kilometers" className="text-foreground">Kilometers</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height_cm" className="text-foreground">{heightLabel}</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange('height_cm', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight_kg" className="text-foreground">{weightLabel}</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Running Information */}
            <Card className="border-orange-100 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="text-orange-900 dark:text-orange-100">Running Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <Label className="text-foreground">Experience Level</Label>
                  <RadioGroup 
                    value={formData.experience_level} 
                    onValueChange={(value) => handleInputChange('experience_level', value)}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Novice" id="novice" />
                      <Label htmlFor="novice" className="text-foreground">Novice (0-1 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Recreational" id="recreational" />
                      <Label htmlFor="recreational" className="text-foreground">Recreational (1-3 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Competitive" id="competitive" />
                      <Label htmlFor="competitive" className="text-foreground">Competitive (3-5 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Elite" id="elite" />
                      <Label htmlFor="elite" className="text-foreground">Elite (5+ years)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weekly_mileage" className="text-foreground">{mileageLabel}</Label>
                    <Input
                      id="weekly_mileage"
                      type="number"
                      value={formData.weekly_mileage}
                      onChange={(e) => handleInputChange('weekly_mileage', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="training_days" className="text-foreground">Training Days per Week</Label>
                    <Input
                      id="training_days"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.training_days}
                      onChange={(e) => handleInputChange('training_days', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="training_intensity_preference" className="text-foreground">Training Intensity</Label>
                  <Select value={formData.training_intensity_preference} onValueChange={(value) => handleInputChange('training_intensity_preference', value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="Low">Low - Focus on easy runs</SelectItem>
                      <SelectItem value="Moderate">Moderate - Balanced approach</SelectItem>
                      <SelectItem value="High">High - Intense training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fitness_score" className="text-foreground">Fitness Score</Label>
                  <Input
                    id="fitness_score"
                    type="number"
                    value={formData.fitness_score}
                    onChange={(e) => handleInputChange('fitness_score', e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals & Training */}
            <Card className="border-blue-100 dark:border-blue-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Goals & Training Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="race_goal" className="text-foreground">Target Race Distance</Label>
                    <Select value={formData.race_goal} onValueChange={(value) => handleInputChange('race_goal', value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="5K">5K</SelectItem>
                        <SelectItem value="10K">10K</SelectItem>
                        <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                        <SelectItem value="Marathon">Marathon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="race_date" className="text-foreground">Target Race Date</Label>
                    <Input
                      id="race_date"
                      type="date"
                      value={formData.race_date}
                      onChange={(e) => handleInputChange('race_date', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="training_start_date" className="text-foreground">Training Start Date</Label>
                    <Input
                      id="training_start_date"
                      type="date"
                      value={formData.training_start_date}
                      onChange={(e) => handleInputChange('training_start_date', e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recent_race_distance" className="text-foreground">Recent Race Distance</Label>
                    <Select value={formData.recent_race_distance} onValueChange={(value) => handleInputChange('recent_race_distance', value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select distance" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="5K">5K</SelectItem>
                        <SelectItem value="10K">10K</SelectItem>
                        <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recent_race_time" className="text-foreground">Recent Race Time</Label>
                    <Input
                      id="recent_race_time"
                      value={formData.recent_race_time}
                      onChange={(e) => handleInputChange('recent_race_time', e.target.value)}
                      placeholder="e.g., 25:00 or 52:30"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="injury_history" className="text-foreground">Injury History</Label>
                  <Textarea
                    id="injury_history"
                    value={formData.injury_history}
                    onChange={(e) => handleInputChange('injury_history', e.target.value)}
                    placeholder="Describe any past injuries or physical limitations..."
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Cross-Training Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {crossTrainingOptions.map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox
                          id={activity}
                          checked={formData.cross_training_preferences.includes(activity)}
                          onCheckedChange={(checked) => handleCrossTrainingChange(activity, checked as boolean)}
                        />
                        <Label htmlFor={activity} className="text-foreground">{activity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
