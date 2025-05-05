import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type WearableDevice } from '@shared/schema';
import { Watch, Smartphone, Scale, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { DeviceDetails } from '../devices/device-details';

export function ConnectedDevices() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: devices, isLoading } = useQuery<WearableDevice[]>({
    queryKey: ['/api/users/1/wearable-devices'],
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'watch':
        return <Watch className="mr-3 text-primary" size={18} />;
      case 'smartphone':
        return <Smartphone className="mr-3 text-primary" size={18} />;
      case 'scale':
        return <Scale className="mr-3 text-neutral-400" size={18} />;
      default:
        return <Watch className="mr-3 text-primary" size={18} />;
    }
  };

  const handleConnect = async (deviceId: number) => {
    await apiRequest('PUT', `/api/wearable-devices/${deviceId}/connect`);
    queryClient.invalidateQueries({ queryKey: ['/api/users/1/wearable-devices'] });
  };
  
  const handleOpenDeviceDetails = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
    setIsOpen(true);
  };

  return (
    <>
      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">Connected Devices</h4>
      
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="h-6 bg-neutral-100 dark:bg-neutral-700 rounded-md w-2/3"></div>
              <div className="h-6 bg-neutral-100 dark:bg-neutral-700 rounded-md w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {devices?.map((device) => (
            <div 
              key={device.id} 
              className="flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded-md -mx-2"
              onClick={() => handleOpenDeviceDetails(device.id)}
            >
              <div className="flex items-center">
                {getDeviceIcon(device.deviceType)}
                <span className="text-sm text-neutral-700 dark:text-neutral-200">{device.deviceName}</span>
              </div>
              {device.isConnected ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs px-2 py-0.5 rounded-full">
                  Connected
                </Badge>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnect(device.id);
                  }}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Device Details
            </DialogTitle>
          </DialogHeader>
          {selectedDeviceId && <DeviceDetails deviceId={selectedDeviceId} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
