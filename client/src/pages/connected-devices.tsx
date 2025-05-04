import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectedDevices } from '@/components/dashboard/connected-devices';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ConnectedDevicesPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-headings font-bold">Connected Devices</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Device
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectedDevices />
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-200 mb-4">
              Your devices are automatically synced every hour. Last sync: 10 minutes ago.
            </p>
            <Button variant="outline">Sync Now</Button>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white mt-8 mb-4">Available Devices</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Apple Watch', 'Fitbit', 'Garmin', 'Oura Ring', 'Withings Scale', 'Google Fit'].map((device) => (
          <Card key={device} className="shadow-sm">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{device}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-300">Connect your {device}</p>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
