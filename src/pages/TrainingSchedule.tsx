
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, CheckCircle, Circle, Play } from 'lucide-react';
import Navigation from '@/components/Navigation';

const TrainingSchedule = () => {
  const [selectedWeek, setSelectedWeek] = useState(8);

  // Mock workout data - this will come from Supabase later
  const workouts = [
    {
      id: 1,
      date: "2024-01-15",
      day: "Monday",
      type: "Easy Run",
      description: "Recovery run at comfortable pace",
      duration: "35 min",
      distance: "4-5 miles",
      intensity: "Easy",
      status: "completed",
      notes: "Focus on form and breathing"
    },
    {
      id: 2,
      date: "2024-01-16",
      day: "Tuesday",
      type: "Tempo Run",
      description: "20-minute tempo after warm-up",
      duration: "45 min",
      distance: "5-6 miles",
      intensity: "Moderate",
      status: "completed",
      notes: "Warm up 10 min, tempo 20 min, cool down 15 min"
    },
    {
      id: 3,
      date: "2024-01-17",
      day: "Wednesday",
      type: "Rest Day",
      description: "Complete rest or light cross-training",
      duration: "0-30 min",
      distance: "0 miles",
      intensity: "Rest",
      status: "completed",
      notes: "Yoga or stretching optional"
    },
    {
      id: 4,
      date: "2024-01-18",
      day: "Thursday",
      type: "Interval Training",
      description: "5 x 800m at 5K pace",
      duration: "50 min",
      distance: "6-7 miles",
      intensity: "Hard",
      status: "scheduled",
      notes: "400m recovery jogs between intervals"
    },
    {
      id: 5,
      date: "2024-01-19",
      day: "Friday",
      type: "Easy Run",
      description: "Recovery run at comfortable pace",
      duration: "30 min",
      distance: "3-4 miles",
      intensity: "Easy",
      status: "scheduled",
      notes: "Keep it relaxed and enjoy"
    },
    {
      id: 6,
      date: "2024-01-20",
      day: "Saturday",
      type: "Long Run",
      description: "Build endurance with steady effort",
      duration: "75 min",
      distance: "9-10 miles",
      intensity: "Moderate",
      status: "scheduled",
      notes: "Practice race nutrition and hydration"
    },
    {
      id: 7,
      date: "2024-01-21",
      day: "Sunday",
      type: "Cross Training",
      description: "Low-impact aerobic exercise",
      duration: "45 min",
      distance: "0 miles",
      intensity: "Easy",
      status: "scheduled",
      notes: "Cycling, swimming, or strength training"
    }
  ];

  const toggleWorkoutStatus = (workoutId: number) => {
    // This will update the workout status in Supabase later
    console.log(`Toggling status for workout ${workoutId}`);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'rest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <Circle className="h-5 w-5 text-gray-400" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Schedule</h1>
          <p className="text-gray-600">Week {selectedWeek} of 16 - Half Marathon Training</p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek === 1}
            >
              Previous Week
            </Button>
            <span className="px-4 py-2 bg-white rounded-lg border font-medium">
              Week {selectedWeek}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWeek(Math.min(16, selectedWeek + 1))}
              disabled={selectedWeek === 16}
            >
              Next Week
            </Button>
          </div>
        </div>

        {/* Workouts Grid */}
        <div className="grid gap-4">
          {workouts.map((workout) => (
            <Card key={workout.id} className={`border transition-all duration-200 hover:shadow-md ${
              workout.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <button 
                        onClick={() => toggleWorkoutStatus(workout.id)}
                        className="flex-shrink-0"
                      >
                        {getStatusIcon(workout.status)}
                      </button>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{workout.type}</h3>
                        <p className="text-sm text-gray-600">{workout.day}, {new Date(workout.date).toLocaleDateString()}</p>
                      </div>
                      
                      <Badge className={getIntensityColor(workout.intensity)}>
                        {workout.intensity}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3">{workout.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {workout.duration}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {workout.distance}
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Notes:</strong> {workout.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {workout.status === 'scheduled' && (
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Week Summary */}
        <Card className="mt-8 border-blue-100">
          <CardHeader>
            <CardTitle>Week {selectedWeek} Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">25</div>
                <div className="text-sm text-gray-600">Total Miles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">5</div>
                <div className="text-sm text-gray-600">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">2</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingSchedule;
