import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Weight, Circle, Terminal, Zap, Target, Heart, StretchVertical } from 'lucide-react';
import { VoiceIndicator } from '@/components/voice-indicator';
import { useSpeech } from '@/hooks/use-speech';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { EquipmentType, GoalType } from '@shared/schema';

const EQUIPMENT_OPTIONS = [
  { id: 'dumbbells', label: 'Dumbbells', icon: Dumbbell },
  { id: 'barbell', label: 'Barbell', icon: Weight },
  { id: 'bands', label: 'Resistance Bands', icon: Circle },
  { id: 'bodyweight', label: 'Bodyweight', icon: Terminal },
] as const;

const GOAL_OPTIONS = [
  { id: 'muscle', label: 'Build Muscle', description: 'Gain strength and size', icon: Zap },
  { id: 'fat-loss', label: 'Lose Fat', description: 'Burn calories and get lean', icon: Target },
  { id: 'strength', label: 'Get Stronger', description: 'Increase power and performance', icon: Weight },
  { id: 'mobility', label: 'Move Better', description: 'Improve flexibility and mobility', icon: StretchVertical },
  { id: 'general-fitness', label: 'General Fitness', description: 'Overall health and wellness', icon: Heart },
] as const;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { status, startListening, stopListening, speak } = useSpeech();
  
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | ''>('');
  const [trainingDays, setTrainingDays] = useState(3);
  const [sessionTime, setSessionTime] = useState(45);
  const [limitations, setLimitations] = useState('');

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('POST', '/api/users', userData);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem('autorep_user_id', user.id.toString());
      toast({
        title: "Welcome to AutoRep!",
        description: "Your personalized workout plan is ready.",
      });
      setLocation('/dashboard');
    },
    onError: () => {
      toast({
        title: "Setup Failed",
        description: "There was a problem creating your profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEquipmentToggle = (equipment: EquipmentType) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleVoiceOnboarding = () => {
    if (status === 'listening') {
      stopListening();
      return;
    }

    speak("Tell me what equipment you have and your fitness goals. For example, say: I have dumbbells and want to build muscle, 3 days a week");
    
    setTimeout(() => {
      startListening((result) => {
        processVoiceInput(result);
      });
    }, 3000);
  };

  const processVoiceInput = (input: string) => {
    const normalizedInput = input.toLowerCase();
    
    // Parse equipment
    const detectedEquipment: EquipmentType[] = [];
    if (normalizedInput.includes('dumbbell')) detectedEquipment.push('dumbbells');
    if (normalizedInput.includes('barbell')) detectedEquipment.push('barbell');
    if (normalizedInput.includes('band') || normalizedInput.includes('resistance')) detectedEquipment.push('bands');
    if (normalizedInput.includes('bodyweight') || normalizedInput.includes('body weight')) detectedEquipment.push('bodyweight');
    
    // Parse goals
    let detectedGoal: GoalType = 'general-fitness';
    if (normalizedInput.includes('muscle') || normalizedInput.includes('build') || normalizedInput.includes('gain')) {
      detectedGoal = 'muscle';
    } else if (normalizedInput.includes('fat') || normalizedInput.includes('lose') || normalizedInput.includes('weight loss')) {
      detectedGoal = 'fat-loss';
    } else if (normalizedInput.includes('strong') || normalizedInput.includes('strength')) {
      detectedGoal = 'strength';
    } else if (normalizedInput.includes('flexible') || normalizedInput.includes('mobility') || normalizedInput.includes('move')) {
      detectedGoal = 'mobility';
    }
    
    // Parse training days
    const daysMatch = normalizedInput.match(/(\d+)\s*days?/);
    const detectedDays = daysMatch ? parseInt(daysMatch[1]) : 3;

    // Parse session time
    const timeMatch = normalizedInput.match(/(\d+)\s*(?:minutes|min)/);
    const detectedTime = timeMatch ? parseInt(timeMatch[1]) : 45;

    // Parse limitations or dislikes
    const limitationMatch = normalizedInput.match(/(?:injury|injuries|hate|avoid)\s(.+)/);
    const detectedLimitations = limitationMatch ? limitationMatch[1].trim() : '';
    
    setSelectedEquipment(detectedEquipment);
    setSelectedGoal(detectedGoal);
    setTrainingDays(Math.min(Math.max(detectedDays, 1), 7));
    setSessionTime(Math.min(Math.max(detectedTime, 10), 120));
    setLimitations(detectedLimitations);
    
    speak(`Got it! I detected ${detectedEquipment.join(' and ')} for equipment, with a goal to ${detectedGoal.replace('-', ' ')}, ${detectedDays} days per week, about ${detectedTime} minutes per session.`);
  };

  const handleCompleteOnboarding = () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Equipment Required",
        description: "Please select at least one type of equipment.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGoal) {
      toast({
        title: "Goal Required", 
        description: "Please select your main fitness goal.",
        variant: "destructive"
      });
      return;
    }

    createUserMutation.mutate({
      username: `user_${Date.now()}`, // Simple username generation
      name: 'AutoRep User',
      equipment: selectedEquipment,
      goals: selectedGoal,
      trainingDays,
      sessionTime,
      limitations
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Dumbbell className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-primary">AutoRep</h1>
          </div>
          <VoiceIndicator status={status} />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AutoRep</h2>
          <p className="text-neutral text-sm">Your voice-first workout coach. Let's set up your personalized training plan.</p>
        </div>

        <div className="space-y-6">
          {/* Equipment Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center mr-3">1</span>
                What equipment do you have?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant="outline"
                    onClick={() => handleEquipmentToggle(id)}
                    className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                      selectedEquipment.includes(id) 
                        ? 'border-primary bg-blue-50 text-primary' 
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-sm font-medium">{label}</span>
                  </Button>
                ))}
              </div>
              {selectedEquipment.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedEquipment.map(equipment => (
                    <Badge key={equipment} variant="secondary">
                      {EQUIPMENT_OPTIONS.find(e => e.id === equipment)?.label}
                    </Badge>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Session Time */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center mr-3">4</span>
              How long is each session?
            </h3>
            <div className="flex justify-center space-x-2">
              {[20,30,45,60,90].map(time => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionTime(time)}
                  className={`w-14 h-10 ${
                    sessionTime === time ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200'
                  }`}
                >
                  {time}m
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Injuries / dislikes */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center mr-3">5</span>
              Any injuries or hated moves?
            </h3>
            <input
              type="text"
              value={limitations}
              onChange={e => setLimitations(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g. shoulder injury, no burpees"
            />
          </CardContent>
        </Card>

          {/* Goal Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center mr-3">2</span>
                What's your main goal?
              </h3>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(({ id, label, description, icon: Icon }) => (
                  <Button
                    key={id}
                    variant="outline"
                    onClick={() => setSelectedGoal(id)}
                    className={`w-full p-4 h-auto text-left ${
                      selectedGoal === id
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className="mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-neutral">{description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Days */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center mr-3">3</span>
                How many days per week?
              </h3>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map(days => (
                  <Button
                    key={days}
                    variant="outline"
                    size="sm"
                    onClick={() => setTrainingDays(days)}
                    className={`w-10 h-10 ${
                      trainingDays === days
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-gray-200'
                    }`}
                  >
                    {days}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voice Onboarding Option */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <VoiceIndicator status={status} className="mr-3" />
                <h3 className="font-semibold">Or just tell me what you want</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Say something like: "I have dumbbells and want to build muscle, 3 days a week"
              </p>
              <Button
                onClick={handleVoiceOnboarding}
                disabled={!useSpeech().isSupported}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
              >
                {status === 'listening' ? 'Stop Listening' : 'Start Voice Setup'}
              </Button>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <Button
            onClick={handleCompleteOnboarding}
            disabled={createUserMutation.isPending || selectedEquipment.length === 0 || !selectedGoal}
            className="w-full py-4 text-lg font-semibold"
            size="lg"
          >
            {createUserMutation.isPending ? 'Creating Your Plan...' : 'Create My Workout Plan'}
          </Button>
        </div>
      </main>
    </div>
  );
}
