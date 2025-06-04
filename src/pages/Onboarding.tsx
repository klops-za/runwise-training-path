import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, User, Target, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type RunnerInsert = Database['public']['Tables']['runners']['Insert'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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

  // Unit conversion functions
  const convertHeight = (value: string, fromUnit: string, toUnit: string) => {
    if (!value || fromUnit === toUnit) return value;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (fromUnit === 'mi' && toUnit === 'km') {
      // Convert inches to cm
      return (numValue * 2.54).toFixed(1);
    } else if (fromUnit === 'km' && toUnit === 'mi') {
      // Convert cm to inches
      return (numValue / 2.54).toFixed(1);
    }
    return value;
  };

  const convertWeight = (value: string, fromUnit: string, toUnit: string) => {
    if (!value || fromUnit === toUnit) return value;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (fromUnit === 'mi' && toUnit === 'km') {
      // Convert lbs to kg
      return (numValue * 0.453592).toFixed(1);
    } else if (fromUnit === 'km' && toUnit === 'mi') {
      // Convert kg to lbs
      return (numValue / 0.453592).toFixed(1);
    }
    return value;
  };

  const convertMileage = (value: string, fromUnit: string, toUnit: string) => {
    if (!value || fromUnit === toUnit) return value;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (fromUnit === 'mi' && toUnit === 'km') {
      // Convert miles to km
      return (numValue * 1.60934).toFixed(1);
    } else if (fromUnit === 'km' && toUnit === 'mi') {
      // Convert km to miles
      return (numValue / 1.60934).toFixed(1);
    }
    return value;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field === 'preferred_unit' && typeof value === 'string') {
      const oldUnit = formData.preferred_unit;
      const newUnit = value;
      
      // Convert existing values to new unit
      const convertedHeight = convertHeight(formData.height_cm, oldUnit, newUnit);
      const convertedWeight = convertWeight(formData.weight_kg, oldUnit, newUnit);
      const convertedMileage = convertMileage(formData.weekly_mileage, oldUnit, newUnit);
      
      setFormData(prev => ({
        ...prev,
        preferred_unit: newUnit,
        height_cm: convertedHeight,
        weight_kg: convertedWeight,
        weekly_mileage: convertedMileage
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCrossTrainingChange = (activity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cross_training_preferences: checked 
        ? [...prev.cross_training_preferences, activity]
        : prev.cross_training_preferences.filter(a => a !== activity)
    }));
  };

  const saveRunnerProfile = async () => {
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Error",
        description: "You must be logged in to create a profile.",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('=== DEBUG: Starting profile save ===');
      console.log('User object:', user);
      console.log('Form data:', formData);
      
      // Properly cast the data to match the database schema
      const profileData: RunnerInsert = {
        id: user.id,
        email: user.email || '',
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

      console.log('=== Profile data to insert ===', profileData);

      // Check if a profile already exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('runners')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Existing profile check:', existingProfile);
      console.log('Select error:', selectError);

      let data, error;
      
      if (existingProfile) {
        console.log('Profile exists, attempting update...');
        ({ data, error } = await supabase
          .from('runners')
          .update(profileData)
          .eq('id', user.id)
          .select());
      } else {
        console.log('No existing profile, attempting insert...');
        ({ data, error } = await supabase
          .from('runners')
          .insert(profileData)
          .select());
      }

      if (error) {
        console.error('=== Supabase operation error ===');
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error code:', error.code);
        
        toast({
          title: "Error",
          description: `Failed to save your profile: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('=== Profile saved successfully ===', data);
      return true;
    } catch (error) {
      console.error('=== Unexpected error saving runner profile ===', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      const success = await saveRunnerProfile();
      if (success) {
        toast({
          title: "Profile Created!",
          description: "Your running profile has been saved.",
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.first_name && formData.last_name && formData.age && formData.gender;
      case 2:
        return formData.height_cm && formData.weight_kg;
      case 3:
        return formData.experience_level && formData.training_days;
      case 4:
        return formData.race_goal && formData.race_date;
      default:
        return false;
    }
  };

  const stepIcons = [User, Activity, Target, Calendar];
  const StepIcon = stepIcons[currentStep - 1];
  const crossTrainingOptions = ['Swimming', 'Cycling', 'Yoga', 'Elliptical', 'None'];

  // Get unit labels based on preferred unit
  const heightLabel = formData.preferred_unit === 'mi' ? 'Height (inches)' : 'Height (cm)';
  const weightLabel = formData.preferred_unit === 'mi' ? 'Weight (lbs)' : 'Weight (kg)';
  const mileageLabel = formData.preferred_unit === 'mi' ? 'Current Weekly Mileage (miles)' : 'Current Weekly Mileage (km)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              RunWise
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="border-blue-100">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Physical Details"}
                {currentStep === 3 && "Running Experience"}
                {currentStep === 4 && "Goals & Preferences"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Preferred Units</Label>
                    <RadioGroup 
                      value={formData.preferred_unit} 
                      onValueChange={(value) => handleInputChange('preferred_unit', value)}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mi" id="miles" />
                        <Label htmlFor="miles">Miles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="km" id="kilometers" />
                        <Label htmlFor="kilometers">Kilometers</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height_cm">{heightLabel}</Label>
                      <Input
                        id="height_cm"
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) => handleInputChange('height_cm', e.target.value)}
                        placeholder={formData.preferred_unit === 'mi' ? "70" : "178"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight_kg">{weightLabel}</Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                        placeholder={formData.preferred_unit === 'mi' ? "150" : "68"}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="injury_history">Injury History (Optional)</Label>
                    <Textarea
                      id="injury_history"
                      value={formData.injury_history}
                      onChange={(e) => handleInputChange('injury_history', e.target.value)}
                      placeholder="Describe any past injuries or physical limitations..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Cross-Training Preferences</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {crossTrainingOptions.map((activity) => (
                        <div key={activity} className="flex items-center space-x-2">
                          <Checkbox
                            id={activity}
                            checked={formData.cross_training_preferences.includes(activity)}
                            onCheckedChange={(checked) => handleCrossTrainingChange(activity, checked as boolean)}
                          />
                          <Label htmlFor={activity}>{activity}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label>Running Experience Level</Label>
                    <RadioGroup 
                      value={formData.experience_level} 
                      onValueChange={(value) => handleInputChange('experience_level', value)}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Novice" id="novice" />
                        <Label htmlFor="novice">Novice (0-1 years)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Recreational" id="recreational" />
                        <Label htmlFor="recreational">Recreational (1-3 years)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Competitive" id="competitive" />
                        <Label htmlFor="competitive">Competitive (3-5 years)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Elite" id="elite" />
                        <Label htmlFor="elite">Elite (5+ years)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weekly_mileage">{mileageLabel}</Label>
                      <Input
                        id="weekly_mileage"
                        type="number"
                        value={formData.weekly_mileage}
                        onChange={(e) => handleInputChange('weekly_mileage', e.target.value)}
                        placeholder={formData.preferred_unit === 'mi' ? "25" : "40"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="training_days">Training Days per Week</Label>
                      <Input
                        id="training_days"
                        type="number"
                        min="1"
                        max="7"
                        value={formData.training_days}
                        onChange={(e) => handleInputChange('training_days', e.target.value)}
                        placeholder="4"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="training_intensity_preference">Training Intensity Preference</Label>
                    <Select value={formData.training_intensity_preference} onValueChange={(value) => handleInputChange('training_intensity_preference', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low - Focus on easy runs</SelectItem>
                        <SelectItem value="Moderate">Moderate - Balanced approach</SelectItem>
                        <SelectItem value="High">High - Intense training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recent_race_distance">Recent Race Distance (Optional)</Label>
                      <Select value={formData.recent_race_distance} onValueChange={(value) => handleInputChange('recent_race_distance', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5K">5K</SelectItem>
                          <SelectItem value="10K">10K</SelectItem>
                          <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recent_race_time">Recent Race Time (Optional)</Label>
                      <Input
                        id="recent_race_time"
                        value={formData.recent_race_time}
                        onChange={(e) => handleInputChange('recent_race_time', e.target.value)}
                        placeholder="e.g., 25:00 or 52:30"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fitness_score">Fitness Score (Optional)</Label>
                    <Input
                      id="fitness_score"
                      type="number"
                      value={formData.fitness_score}
                      onChange={(e) => handleInputChange('fitness_score', e.target.value)}
                      placeholder="45"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      If you don't know your fitness score, we can calculate it from your recent race time
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="race_goal">Target Race Distance</Label>
                    <Select value={formData.race_goal} onValueChange={(value) => handleInputChange('race_goal', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What distance are you training for?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5K">5K</SelectItem>
                        <SelectItem value="10K">10K</SelectItem>
                        <SelectItem value="Half Marathon">Half Marathon</SelectItem>
                        <SelectItem value="Marathon">Marathon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="race_date">Target Race Date</Label>
                      <Input
                        id="race_date"
                        type="date"
                        value={formData.race_date}
                        onChange={(e) => handleInputChange('race_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="training_start_date">Training Start Date (Optional)</Label>
                      <Input
                        id="training_start_date"
                        type="date"
                        value={formData.training_start_date}
                        onChange={(e) => handleInputChange('training_start_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Training Plan Preview</h4>
                    <p className="text-blue-700 text-sm">
                      Based on your inputs, we'll create a personalized {formData.race_goal} training plan 
                      with {formData.training_days} training days per week, {formData.training_intensity_preference?.toLowerCase()} intensity, 
                      leading up to your race on {formData.race_date ? new Date(formData.race_date).toLocaleDateString() : '[selected date]'}.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white flex items-center"
                >
                  {currentStep === 4 ? 'Create Profile' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
