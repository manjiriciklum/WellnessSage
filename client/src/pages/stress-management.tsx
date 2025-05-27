import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Target, Clock, Users, Brain, BookOpen, Heart, Music, Coffee, Sun, Moon } from "lucide-react";
import { useLocation } from "wouter";

const dummyStressData = {
  name: "John Doe",
  startDate: "2024-03-20",
  reviewDate: "2024-06-20",
  goals: [
    "Reduce overall stress levels",
    "Improve coping mechanisms for daily stressors",
    "Increase physical and mental resilience",
    "Enhance emotional well-being"
  ],
  dailyPractices: [
    {
      activity: "Mindfulness Meditation",
      description: "10-minute guided or silent meditation",
      time: "Morning",
      frequency: "Daily",
      icon: <Brain className="h-5 w-5" />
    },
    {
      activity: "Physical Activity",
      description: "30-minute walk, yoga, or workout",
      time: "Any",
      frequency: "Daily",
      icon: <Heart className="h-5 w-5" />
    },
    {
      activity: "Hydration",
      description: "Drink at least 8 glasses of water",
      time: "Throughout day",
      frequency: "Daily",
      icon: <Coffee className="h-5 w-5" />
    },
    {
      activity: "Healthy Nutrition",
      description: "Eat balanced meals, reduce sugar/caffeine",
      time: "Meals",
      frequency: "Daily",
      icon: <Sun className="h-5 w-5" />
    },
    {
      activity: "Digital Detox",
      description: "Unplug from screens for 1 hour before bed",
      time: "Evening",
      frequency: "Daily",
      icon: <Moon className="h-5 w-5" />
    }
  ],
  weeklyPractices: [
    {
      activity: "Journaling",
      description: "Reflect on feelings/stress triggers",
      time: "Weekend",
      frequency: "2-3x/week",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      activity: "Social Connection",
      description: "Meet or call a friend or family",
      time: "Flexible",
      frequency: "1-2x/week",
      icon: <Users className="h-5 w-5" />
    },
    {
      activity: "Nature Time",
      description: "Visit a park, garden, or natural area",
      time: "Daytime",
      frequency: "1x/week",
      icon: <Sun className="h-5 w-5" />
    },
    {
      activity: "Creative Outlet",
      description: "Art, music, writing, cooking, etc.",
      time: "Any",
      frequency: "1-2x/week",
      icon: <Music className="h-5 w-5" />
    }
  ],
  monitoringTasks: [
    {
      task: "Stress Level Check-in",
      description: "Rate your stress on a scale of 1-10",
      frequency: "Daily"
    },
    {
      task: "Mood Journal",
      description: "Write 1-2 sentences about how you feel",
      frequency: "Daily"
    },
    {
      task: "Review Progress",
      description: "Assess what's working and what isn't",
      frequency: "Weekly"
    }
  ],
  copingStrategies: [
    "Deep breathing (Box breathing: 4-4-4-4)",
    "Listening to calming music",
    "Taking a short walk",
    "Using a stress ball or fidget tool",
    "Talking to a friend or therapist"
  ],
  professionalSupport: {
    therapist: "Dr. Sarah Johnson (555-0123)",
    supportGroups: "Mindfulness Support Group - Wednesdays 6 PM",
    apps: ["Headspace", "Calm", "Insight Timer"]
  }
};

export default function StressManagementPage() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🌿 Stress Management Wellness Plan</h1>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Start: {dummyStressData.startDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Review: {dummyStressData.reviewDate}</span>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {dummyStressData.goals.map((goal, index) => (
                <li key={index} className="text-gray-600">{goal}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Daily Practices Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Daily Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dummyStressData.dailyPractices.map((practice, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {practice.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{practice.activity}</h3>
                    <p className="text-sm text-gray-600">{practice.description}</p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span>Time: {practice.time}</span>
                      <span>Frequency: {practice.frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Practices Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dummyStressData.weeklyPractices.map((practice, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {practice.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{practice.activity}</h3>
                    <p className="text-sm text-gray-600">{practice.description}</p>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span>Time: {practice.time}</span>
                      <span>Frequency: {practice.frequency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Monitoring & Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dummyStressData.monitoringTasks.map((task, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-50">
                  <h3 className="font-medium">{task.task}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Frequency: {task.frequency}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coping Strategies Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Coping Strategies Toolbox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {dummyStressData.copingStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="h-4 w-4 rounded-full border-2 border-primary" />
                  <span className="text-gray-600">{strategy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Professional Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professional Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Therapist/Counselor</h3>
                <p className="text-gray-600">{dummyStressData.professionalSupport.therapist}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Support Groups</h3>
                <p className="text-gray-600">{dummyStressData.professionalSupport.supportGroups}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Recommended Apps</h3>
                <div className="flex flex-wrap gap-2">
                  {dummyStressData.professionalSupport.apps.map((app, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 