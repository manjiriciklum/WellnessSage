import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/ui/simple-progress';
import { 
  Heart, 
  Utensils, 
  Moon, 
  Brain, 
  Plus, 
  Calendar, 
  Target,
  CheckCircle2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

// Mock wellness plans data for demo purposes
const mockWellnessPlans = [
  {
    id: 1,
    userId: 2,
    planName: "Cardio Boost",
    planType: "fitness",
    description: "A 4-week program to improve cardiovascular health through progressive workouts.",
    startDate: new Date(2025, 4, 1), // May 1, 2025
    endDate: new Date(2025, 4, 29), // May 29, 2025
    goals: {
      dailySteps: 10000,
      weeklyWorkouts: 4,
      heartRateZone: "70-80% max",
      activities: [
        "30 min jogging (Mon/Wed/Fri)",
        "45 min cycling (Tue/Thu)",
        "60 min hiking (weekend)"
      ]
    },
    progress: 65
  },
  {
    id: 2,
    userId: 2,
    planName: "Balanced Nutrition",
    planType: "nutrition",
    description: "A customized meal plan with protein-rich breakfasts and balanced macros throughout the day.",
    startDate: new Date(2025, 4, 10), // May 10, 2025
    endDate: new Date(2025, 5, 10), // June 10, 2025
    goals: {
      dailyProtein: "100g",
      dailyCalories: 2200,
      waterIntake: "3L",
      mealPlan: [
        "Protein-rich breakfast",
        "Balanced lunch with vegetables",
        "Light dinner before 7pm",
        "Healthy snacks between meals"
      ]
    },
    progress: 40
  },
  {
    id: 3,
    userId: 2,
    planName: "Better Sleep Habits",
    planType: "sleep",
    description: "Improve sleep quality through consistent bedtime routines and environment optimization.",
    startDate: new Date(2025, 4, 15), // May 15, 2025
    endDate: new Date(2025, 5, 15), // June 15, 2025
    goals: {
      sleepDuration: "8 hours",
      bedtime: "10:30 PM",
      wakeTime: "6:30 AM",
      routine: [
        "No screens 1 hour before bed",
        "Bedroom temperature at 68°F",
        "Light stretching before sleep",
        "No caffeine after 2pm"
      ]
    },
    progress: 25
  },
  {
    id: 4,
    userId: 2,
    planName: "Stress Management",
    planType: "stress",
    description: "Learn techniques to reduce stress through meditation, breathing exercises, and mindfulness.",
    startDate: new Date(2025, 4, 20), // May 20, 2025
    endDate: new Date(2025, 5, 20), // June 20, 2025
    goals: {
      dailyMeditation: "15 minutes",
      breathingExercises: "3 times per day",
      journaling: "Evening reflection",
      activities: [
        "Morning meditation",
        "Midday breathing exercise",
        "Evening journaling",
        "Weekly yoga session"
      ]
    },
    progress: 10
  }
];

interface PlanDetailsProps {
  plan: typeof mockWellnessPlans[0];
}

// Component to display plan details
const PlanDetails: React.FC<PlanDetailsProps> = ({ plan }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-medium">Timeline</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Start Date</p>
            <p className="text-sm font-medium">{format(new Date(plan.startDate), 'PPP')}</p>
          </div>
          {plan.endDate && (
            <div>
              <p className="text-xs text-neutral-500">End Date</p>
              <p className="text-sm font-medium">{format(new Date(plan.endDate), 'PPP')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-neutral-500" />
          <h3 className="text-sm font-medium">Goals</h3>
        </div>
        <div className="space-y-2 bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md">
          {plan.planType === 'fitness' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500">Daily Steps</p>
                  <p className="text-sm font-medium">{plan.goals.dailySteps}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Weekly Workouts</p>
                  <p className="text-sm font-medium">{plan.goals.weeklyWorkouts}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Target Heart Rate Zone</p>
                  <p className="text-sm font-medium">{plan.goals.heartRateZone}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Planned Activities</p>
                <ul className="space-y-1">
                  {plan.goals.activities && plan.goals.activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {plan.planType === 'nutrition' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500">Daily Protein</p>
                  <p className="text-sm font-medium">{plan.goals.dailyProtein}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Daily Calories</p>
                  <p className="text-sm font-medium">{plan.goals.dailyCalories}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Water Intake</p>
                  <p className="text-sm font-medium">{plan.goals.waterIntake}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Meal Plan</p>
                <ul className="space-y-1">
                  {plan.goals.mealPlan && plan.goals.mealPlan.map((meal, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>{meal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {plan.planType === 'sleep' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500">Sleep Duration</p>
                  <p className="text-sm font-medium">{plan.goals.sleepDuration}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Bedtime</p>
                  <p className="text-sm font-medium">{plan.goals.bedtime}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Wake Time</p>
                  <p className="text-sm font-medium">{plan.goals.wakeTime}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Sleep Routine</p>
                <ul className="space-y-1">
                  {plan.goals.routine && plan.goals.routine.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {plan.planType === 'stress' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-neutral-500">Daily Meditation</p>
                  <p className="text-sm font-medium">{plan.goals.dailyMeditation}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Breathing Exercises</p>
                  <p className="text-sm font-medium">{plan.goals.breathingExercises}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Journaling</p>
                  <p className="text-sm font-medium">{plan.goals.journaling}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Daily Activities</p>
                <ul className="space-y-1">
                  {plan.goals.activities && plan.goals.activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-neutral-500">Progress</span>
          <span className="font-medium">{plan.progress}%</span>
        </div>
        <SimpleProgress value={plan.progress} maxValue={100} />
      </div>
    </div>
  );
};

export default function WellnessPlansPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof mockWellnessPlans[0] | null>(null);
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleViewPlan = (plan: typeof mockWellnessPlans[0]) => {
    setSelectedPlan(plan);
    setViewDialogOpen(true);
  };

  const createPlanMutation = useMutation({
    mutationFn: async (newPlan: any) => {
      const res = await apiRequest('POST', '/api/wellness-plans', newPlan);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New wellness plan created successfully",
      });
      setCreateDialogOpen(false);
      // Reset form
      setPlanName('');
      setPlanType('');
      setDescription('');
      // Invalidate wellness plans query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/wellness-plans`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create plan: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newPlan = {
      userId: user?.id,
      planName,
      planType,
      description,
      startDate: new Date(),
      goals: {} // Default empty goals object
    };

    createPlanMutation.mutate(newPlan);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Wellness Plans</h1>
      
      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4">All Plans</TabsTrigger>
            <TabsTrigger value="fitness" className="text-xs sm:text-sm px-2 sm:px-4">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs sm:text-sm px-2 sm:px-4">Nutrition</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs sm:text-sm px-2 sm:px-4">Sleep</TabsTrigger>
            <TabsTrigger value="stress" className="text-xs sm:text-sm px-2 sm:px-4">Stress</TabsTrigger>
          </TabsList>
          <Button 
            className="w-full sm:w-auto"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Plan
          </Button>
        </div>
        
        {/* Create Plan Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Wellness Plan</DialogTitle>
              <DialogDescription>
                Add details for your new wellness plan. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Morning Workout Routine"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="planType">Plan Type</Label>
                  <Select
                    value={planType}
                    onValueChange={setPlanType}
                  >
                    <SelectTrigger id="planType">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="sleep">Sleep</SelectItem>
                      <SelectItem value="stress">Stress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your wellness plan..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* View Plan Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlan?.planType === 'fitness' && <Heart className="text-primary" size={20} />}
                {selectedPlan?.planType === 'nutrition' && <Utensils className="text-secondary" size={20} />}
                {selectedPlan?.planType === 'sleep' && <Moon className="text-accent" size={20} />}
                {selectedPlan?.planType === 'stress' && <Brain className="text-error" size={20} />}
                {selectedPlan?.planName}
              </DialogTitle>
              <DialogDescription>
                {selectedPlan?.description}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && <PlanDetails plan={selectedPlan} />}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWellnessPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`shadow-sm border-t-4 ${
                  plan.planType === 'fitness' ? 'border-t-primary' : 
                  plan.planType === 'nutrition' ? 'border-t-secondary' : 
                  plan.planType === 'sleep' ? 'border-t-accent' : 
                  'border-t-error'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {plan.planType === 'fitness' && <Heart className="text-primary" size={18} />}
                    {plan.planType === 'nutrition' && <Utensils className="text-secondary" size={18} />}
                    {plan.planType === 'sleep' && <Moon className="text-accent" size={18} />}
                    {plan.planType === 'stress' && <Brain className="text-error" size={18} />}
                    <CardTitle className="text-lg text-wrap break-words">{plan.planName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                    {plan.description}
                  </p>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <div className="mb-4">
                    <SimpleProgress value={plan.progress} maxValue={100} />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleViewPlan(plan)}
                  >
                    View Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="fitness">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWellnessPlans
              .filter(plan => plan.planType === 'fitness')
              .map((plan) => (
                <Card key={plan.id} className="shadow-sm border-t-4 border-t-primary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Heart className="text-primary" size={18} />
                      <CardTitle className="text-lg text-wrap break-words">{plan.planName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                      {plan.description}
                    </p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="mb-4">
                      <SimpleProgress value={plan.progress} maxValue={100} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewPlan(plan)}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWellnessPlans
              .filter(plan => plan.planType === 'nutrition')
              .map((plan) => (
                <Card key={plan.id} className="shadow-sm border-t-4 border-t-secondary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Utensils className="text-secondary" size={18} />
                      <CardTitle className="text-lg text-wrap break-words">{plan.planName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                      {plan.description}
                    </p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="mb-4">
                      <SimpleProgress value={plan.progress} maxValue={100} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewPlan(plan)}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sleep">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWellnessPlans
              .filter(plan => plan.planType === 'sleep')
              .map((plan) => (
                <Card key={plan.id} className="shadow-sm border-t-4 border-t-accent">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Moon className="text-accent" size={18} />
                      <CardTitle className="text-lg text-wrap break-words">{plan.planName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                      {plan.description}
                    </p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="mb-4">
                      <SimpleProgress value={plan.progress} maxValue={100} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewPlan(plan)}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWellnessPlans
              .filter(plan => plan.planType === 'stress')
              .map((plan) => (
                <Card key={plan.id} className="shadow-sm border-t-4 border-t-error">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Brain className="text-error" size={18} />
                      <CardTitle className="text-lg text-wrap break-words">{plan.planName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                      {plan.description}
                    </p>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <div className="mb-4">
                      <SimpleProgress value={plan.progress} maxValue={100} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewPlan(plan)}
                    >
                      View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
