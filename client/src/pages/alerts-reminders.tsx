import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Bell, Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { type Reminder } from '@shared/schema';

export default function AlertsRemindersPage() {
  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/users/1/reminders'],
  });

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
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input placeholder="E.g., Take medication" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Time</label>
                    <Input placeholder="E.g., 8:00 AM" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Frequency</label>
                    <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                      <option>Once</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                      <option>Medication</option>
                      <option>Hydration</option>
                      <option>Exercise</option>
                      <option>Wellness</option>
                    </select>
                  </div>
                  <Button className="w-full">Schedule Reminder</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
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
