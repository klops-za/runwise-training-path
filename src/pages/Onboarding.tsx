import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, User, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    experience_level: '',
    weekly_mileage: '',
    training_days: [] as string[],
    preferred_unit: 'mi',
    race_goal: '',
    race_date: '',
    recent_race_time: ''
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
      const convertedHeight = convertHeight(formData.height, oldUnit, newUnit);
      const convertedWeight = convertWeight(formData.weight, oldUnit, newUnit);
      const convertedMileage = convertMileage(formData.weekly_mileage, oldUnit, newUnit);
      
      setFormData(prev => ({
        ...prev,
        preferred_unit: newUnit,
        height: convertedHeight,
        weight: convertedWeight,
        weekly_mileage: convertedMileage
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTrainingDayChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      training_days: checked 
        ? [...prev.training_days, day]
        : prev.training_days.filter(d => d !== day)
    }));
  };

  const saveRunnerProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('runners')
        .upsert({
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          experience_level: formData.experience_level || null,
          weekly_mileage: formData.weekly_mileage ? parseFloat(formData.weekly_mileage) : null,
          training_days: formData.training_days,
          preferred_unit: formData.preferred_unit,
          race_goal: formData.race_goal || null,
          race_date: formData.race_date || null,
        }, { onConflict: 'email' });

      if (error) {
        console.error('Error saving runner profile:', error);
        toast({
          title: "Error",
          description: "Failed to save your profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving runner profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
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
        return formData.age && formData.gender && formData.height && formData.weight;
      case 2:
        return formData.experience_level && formData.training_days.length > 0;
      case 3:
        return formData.race_goal && formData.race_date;
      default:
        return false;
    }
  };

  const stepIcons = [User, Target, Calendar];
  const StepIcon = stepIcons[currentStep - 1];
  const trainingDayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
              <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <Card className="border-blue-100">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StepIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                {currentStep === 1 && "Tell us about yourself"}
                {currentStep === 2 && "Your running experience"}
                {currentStep === 3 && "Your race goals"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">{heightLabel}</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder={formData.preferred_unit === 'mi' ? "70" : "178"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">{weightLabel}</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder={formData.preferred_unit === 'mi' ? "150" : "68"}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
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
                    <Label>Training Days</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {trainingDayOptions.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.training_days.includes(day)}
                            onCheckedChange={(checked) => handleTrainingDayChange(day, checked as boolean)}
                          />
                          <Label htmlFor={day}>{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recent_race_time">Recent Race Time (optional)</Label>
                    <Input
                      id="recent_race_time"
                      value={formData.recent_race_time}
                      onChange={(e) => handleInputChange('recent_race_time', e.target.value)}
                      placeholder="e.g., 5K in 25:00 or 10K in 52:00"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This helps us calculate your VDOT for better pacing recommendations
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
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

                  <div>
                    <Label htmlFor="race_date">Target Race Date</Label>
                    <Input
                      id="race_date"
                      type="date"
                      value={formData.race_date}
                      onChange={(e) => handleInputChange('race_date', e.target.value)}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Your Training Plan Preview</h4>
                    <p className="text-blue-700 text-sm">
                      Based on your inputs, we'll create a personalized {formData.race_goal} training plan 
                      with {formData.training_days.length} training days per week, starting immediately and 
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
                  {currentStep === 3 ? 'Create Profile' : 'Next'}
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
