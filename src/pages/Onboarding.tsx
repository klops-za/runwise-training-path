
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, User, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    experience_level: '',
    weekly_mileage: '',
    training_days: '',
    preferred_unit: 'miles',
    race_goal: '',
    race_date: '',
    recent_race_time: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // This will be connected to Supabase to save the runner profile
      toast({
        title: "Profile Created!",
        description: "Your training plan is being generated...",
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.age && formData.gender && formData.height && formData.weight;
      case 2:
        return formData.experience_level && formData.weekly_mileage && formData.training_days;
      case 3:
        return formData.race_goal && formData.race_date;
      default:
        return false;
    }
  };

  const stepIcons = [User, Target, Calendar];
  const StepIcon = stepIcons[currentStep - 1];

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
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
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
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (inches)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="150"
                      />
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
                        <RadioGroupItem value="miles" id="miles" />
                        <Label htmlFor="miles">Miles</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kilometers" id="kilometers" />
                        <Label htmlFor="kilometers">Kilometers</Label>
                      </div>
                    </RadioGroup>
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
                        <RadioGroupItem value="beginner" id="beginner" />
                        <Label htmlFor="beginner">Beginner (0-1 years)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intermediate" id="intermediate" />
                        <Label htmlFor="intermediate">Intermediate (1-3 years)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced">Advanced (3+ years)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="weekly_mileage">Current Weekly Mileage</Label>
                    <Select value={formData.weekly_mileage} onValueChange={(value) => handleInputChange('weekly_mileage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current weekly mileage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10">0-10 miles/week</SelectItem>
                        <SelectItem value="10-20">10-20 miles/week</SelectItem>
                        <SelectItem value="20-30">20-30 miles/week</SelectItem>
                        <SelectItem value="30-40">30-40 miles/week</SelectItem>
                        <SelectItem value="40+">40+ miles/week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="training_days">Training Days per Week</Label>
                    <Select value={formData.training_days} onValueChange={(value) => handleInputChange('training_days', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How many days can you train?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="4">4 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="6">6 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                      </SelectContent>
                    </Select>
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
                      with {formData.training_days} training days per week, starting immediately and 
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
                  {currentStep === 3 ? 'Create Plan' : 'Next'}
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
