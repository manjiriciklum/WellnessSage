import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user';
import { useTheme } from '@/components/theme-provider';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Monitor, 
  SmartphoneCharging, 
  Trash2, 
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile">
        <div className="flex mb-6 overflow-x-auto">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock size={16} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield size={16} />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun size={16} />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <SmartphoneCharging size={16} />
              <span>Devices</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.lastName} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                  <Button className="w-full md:w-auto">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="profileImage" className="text-center cursor-pointer">
                    <div className="px-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-md text-center hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                      Upload New Photo
                    </div>
                    <Input 
                      id="profileImage" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </Label>
                  <Button variant="outline" className="w-full">Remove Photo</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable 2FA</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Email Notifications', description: 'Receive email notifications for important updates' },
                  { title: 'Push Notifications', description: 'Receive push notifications on your device' },
                  { title: 'SMS Notifications', description: 'Receive text messages for critical alerts' },
                  { title: 'Health Insights', description: 'AI-generated insights based on your health data' },
                  { title: 'Medication Reminders', description: 'Reminders to take your medication' },
                  { title: 'Appointment Reminders', description: 'Reminders for upcoming doctor appointments' },
                  { title: 'Health Goal Updates', description: 'Updates on your progress towards health goals' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                    </div>
                    <Switch defaultChecked={i < 5} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Data Sharing with Doctors', description: 'Allow your doctors to access your health data' },
                  { title: 'Data Sharing with Applications', description: 'Allow third-party apps to access your health data' },
                  { title: 'Health Data Analytics', description: 'Allow anonymous usage of your data for health research' },
                  { title: 'Activity Tracking', description: 'Track your activities to provide personalized insights' },
                  { title: 'Location Services', description: 'Use your location to find nearby healthcare services' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                    </div>
                    <Switch defaultChecked={i <= 1} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full md:w-auto">Download My Data</Button>
                <Button variant="destructive" className="w-full md:w-auto">Delete All Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className={`p-4 border rounded-md flex flex-col items-center gap-2 cursor-pointer ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-neutral-200 dark:border-neutral-600'}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                </div>
                <div 
                  className={`p-4 border rounded-md flex flex-col items-center gap-2 cursor-pointer ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-neutral-200 dark:border-neutral-600'}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                </div>
                <div 
                  className={`p-4 border rounded-md flex flex-col items-center gap-2 cursor-pointer ${theme === 'system' ? 'border-primary bg-primary/10' : 'border-neutral-200 dark:border-neutral-600'}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-6 w-6" />
                  <span>System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <SmartphoneCharging className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">iPhone 13</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Last active: Today, 2:30 PM
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                </div>
                
                <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">MacBook Pro</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Last active: Yesterday, 8:15 AM
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Disconnect</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex flex-col space-y-2">
            <Button variant="outline" className="w-full md:w-auto" size="lg">
              <Trash2 size={16} className="mr-2" />
              Remove All Devices
            </Button>
            <Button variant="destructive" className="w-full md:w-auto" size="lg">
              <LogOut size={16} className="mr-2" />
              Sign Out of All Devices
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
