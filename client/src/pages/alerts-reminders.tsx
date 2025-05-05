import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Check, X, AlertTriangle, Info } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { type Reminder } from '@shared/schema';
import { useNotification } from '@/contexts/NotificationContext';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function AlertsRemindersPage() {
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('Daily');
  const [reminderCategory, setReminderCategory] = useState('Medication');
  const { addNotification } = useNotification();
  
  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/users/1/reminders'],
  });
  
  // Add a mutation to create a new reminder
  const createReminderMutation = useMutation({
    mutationFn: async (reminder: any) => {
      return apiRequest('/api/reminders', 'POST', reminder);
    },
    onSuccess: () => {
      // Clear the form
      setReminderTitle('');
      setReminderTime('');
      // Invalidate the reminders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/reminders'] });
    },
  });
  
  // Function to handle form submission
  const handleSubmitReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the reminder
    createReminderMutation.mutate({
      userId: 1, // Using a fixed user ID for the demo
      title: reminderTitle,
      time: reminderTime,
      frequency: reminderFrequency.toLowerCase(),
      category: reminderCategory.toLowerCase(),
      color: getCategoryColor(reminderCategory),
      isCompleted: false,
      description: ''
    });
  };
  
  // Function to get color based on category
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medication': return '#f44336'; // red
      case 'hydration': return '#1e88e5'; // blue
      case 'exercise': return '#fb8c00'; // orange
      case 'wellness': return '#26a69a'; // teal
      default: return '#9c27b0'; // purple
    }
  };
  
  // Function to test notifications manually
  const testNotification = (type: 'reminder' | 'alert' | 'success' | 'info') => {
    const titles = {
      reminder: 'Medication Reminder',
      alert: 'Health Alert',
      success: 'Goal Achieved',
      info: 'Device Connected'
    };
    
    const messages = {
      reminder: 'Time to take your medication',
      alert: 'Your heart rate has been elevated for the past hour',
      success: 'Congratulations! You have reached your step goal for today',
      info: 'Your Samsung Galaxy Watch 6 has been connected successfully'
    };
    
    addNotification({
      title: titles[type],
      message: messages[type],
      type
    });
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-headings font-bold">Alerts & Reminders</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          New Reminder
        </Button>
      </div>
      
      <Tabs defaultValue="reminders">
        <TabsList className="mb-6">
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reminders">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Active Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-12 bg-neutral-100 dark:bg-neutral-700 rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reminders?.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 border border-neutral-100 dark:border-neutral-600 rounded-md">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full bg-${reminder.color} mr-3`}></div>
                          <div>
                            <p className="text-sm font-medium">{reminder.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-300">{reminder.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-success">
                            <Check size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Schedule a Reminder</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReminder} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input 
                      value={reminderTitle}
                      onChange={(e) => setReminderTitle(e.target.value)}
                      placeholder="E.g., Take medication"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Time</label>
                    <Input 
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      placeholder="E.g., 8:00 AM"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Frequency</label>
                    <select 
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                    >
                      <option>Once</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select 
                      value={reminderCategory}
                      onChange={(e) => setReminderCategory(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                    >
                      <option>Medication</option>
                      <option>Hydration</option>
                      <option>Exercise</option>
                      <option>Wellness</option>
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createReminderMutation.isPending}
                  >
                    {createReminderMutation.isPending ? 'Creating...' : 'Schedule Reminder'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Medication Reminders', description: 'Receive alerts when it\'s time to take medication' },
                    { title: 'Wellness Plan Updates', description: 'Get notified about changes to your wellness plans' },
                    { title: 'Health Insights', description: 'AI-generated insights based on your health data' },
                    { title: 'Doctor Appointments', description: 'Reminders for upcoming medical appointments' },
                    { title: 'Device Sync Alerts', description: 'Notifications when your devices need to be synced' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">{item.title}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-300">{item.description}</p>
                      </div>
                      <Switch defaultChecked={i !== 4} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Test Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Test the different types of push notifications to see how they appear on your device.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-16" 
                      onClick={() => testNotification('reminder')}
                    >
                      <Bell className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Reminder</div>
                        <div className="text-xs text-neutral-500">Medication alert</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-16" 
                      onClick={() => testNotification('alert')}
                    >
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div className="text-left">
                        <div className="font-medium">Alert</div>
                        <div className="text-xs text-neutral-500">Health warning</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-16" 
                      onClick={() => testNotification('success')}
                    >
                      <Check className="h-5 w-5 text-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Success</div>
                        <div className="text-xs text-neutral-500">Goal achieved</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 h-16" 
                      onClick={() => testNotification('info')}
                    >
                      <Info className="h-5 w-5 text-gray-500" />
                      <div className="text-left">
                        <div className="font-medium">Info</div>
                        <div className="text-xs text-neutral-500">Device connected</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Input component for this page
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
      {...props}
    />
  );
}
