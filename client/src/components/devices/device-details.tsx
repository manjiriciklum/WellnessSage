import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WearableDevice } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CheckCircle, XCircle, RefreshCw, Activity, Heart, Zap, Moon, Thermometer, Droplets, Dumbbell } from 'lucide-react';

interface DeviceDetailsProps {
  deviceId: number;
}

export function DeviceDetails({ deviceId }: DeviceDetailsProps) {
  const [syncing, setSyncing] = useState(false);
  
  // Fetch device details
  const { data: device, isLoading: isLoadingDevice } = useQuery<WearableDevice>({
    queryKey: [`/api/wearable-devices/${deviceId}`],
  });
  
  // Fetch device connectivity status
  const { data: connectivity, isLoading: isLoadingConnectivity } = useQuery({
    queryKey: [`/api/wearable-devices/${deviceId}/connectivity`],
    enabled: Boolean(device?.isConnected),
  });
  
  // Fetch firmware status
  const { data: firmware, isLoading: isLoadingFirmware } = useQuery({
    queryKey: [`/api/wearable-devices/${deviceId}/firmware`],
    enabled: Boolean(device?.isConnected),
  });
  
  const handleSyncDevice = async () => {
    if (!device?.isConnected) return;
    
    setSyncing(true);
    try {
      await apiRequest('POST', `/api/wearable-devices/${deviceId}/sync`);
      queryClient.invalidateQueries({ queryKey: [`/api/users/1/health-data/latest`] });
      setTimeout(() => setSyncing(false), 1500); // Show spinner for at least 1.5 seconds
    } catch (error) {
      console.error('Error syncing device:', error);
      setSyncing(false);
    }
  };
  
  const handleConnectDevice = async () => {
    await apiRequest('PUT', `/api/wearable-devices/${deviceId}/connect`);
    queryClient.invalidateQueries({ queryKey: [`/api/wearable-devices/${deviceId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/users/1/wearable-devices`] });
  };
  
  const handleDisconnectDevice = async () => {
    await apiRequest('PUT', `/api/wearable-devices/${deviceId}/disconnect`);
    queryClient.invalidateQueries({ queryKey: [`/api/wearable-devices/${deviceId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/users/1/wearable-devices`] });
  };
  
  if (isLoadingDevice) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center animate-pulse">
        <p className="text-neutral-400">Loading device information...</p>
      </Card>
    );
  }
  
  if (!device) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-red-500">Device not found</p>
        </CardContent>
      </Card>
    );
  }
  
  // Process capabilities for display
  const capabilities = device.capabilities as Record<string, boolean> || {};
  const capabilityIcons: Record<string, React.ReactNode> = {
    heartRate: <Heart size={18} className="text-red-500" />,
    stepCount: <Activity size={18} className="text-blue-500" />,
    caloriesBurned: <Zap size={18} className="text-orange-500" />,
    sleep: <Moon size={18} className="text-indigo-500" />,
    bloodOxygen: <Activity size={18} className="text-purple-500" />,
    temperature: <Thermometer size={18} className="text-emerald-500" />,
    stress: <Activity size={18} className="text-rose-500" />,
    bloodPressure: <Activity size={18} className="text-sky-500" />,
    weight: <Dumbbell size={18} className="text-amber-500" />,
    bodyFatPercentage: <Droplets size={18} className="text-teal-500" />,
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{device.deviceName}</CardTitle>
            <CardDescription>
              {device.manufacturer && device.deviceModel 
                ? `${device.manufacturer} ${device.deviceModel}` 
                : `${device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1)}`}
            </CardDescription>
          </div>
          <Badge 
            className={device.isConnected 
              ? "bg-success/10 text-success border-success/20" 
              : "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"}
          >
            {device.isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            {device.batteryLevel !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Battery</span>
                  <span className={device.batteryLevel < 20 ? 'text-red-500' : 'text-neutral-500'}>
                    {device.batteryLevel}%
                  </span>
                </div>
                <Progress value={device.batteryLevel} className="h-2" />
              </div>
            )}
            
            <div className="space-y-2">
              {device.serialNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Serial Number</span>
                  <span>{device.serialNumber}</span>
                </div>
              )}
              
              {device.firmwareVersion && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Firmware Version</span>
                  <div className="flex items-center gap-1">
                    <span>{device.firmwareVersion}</span>
                    {!isLoadingFirmware && firmware?.available && (
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-200">
                        Update
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {device.lastSynced && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Last Synced</span>
                  <span>{new Date(device.lastSynced).toLocaleString()}</span>
                </div>
              )}
              
              {!isLoadingConnectivity && connectivity && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Sync Status</span>
                  <span className={connectivity.connected ? 'text-success' : 'text-neutral-500'}>
                    {connectivity.syncStatus}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              {device.isConnected ? (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDisconnectDevice}
                  >
                    <XCircle size={16} className="mr-2" />
                    Disconnect
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={syncing}
                    onClick={handleSyncDevice}
                  >
                    <RefreshCw size={16} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleConnectDevice}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Connect Device
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="capabilities" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(capabilities).map(([key, enabled]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-md border">
                  <div className="flex-shrink-0">
                    {capabilityIcons[key] || <Activity size={18} className="text-neutral-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                  </div>
                  <Badge variant={enabled ? "default" : "outline"} className="ml-auto text-xs">
                    {enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-3">
              {device.connectionSettings && (
                <div>
                  {/* @ts-ignore */}
                  {device.connectionSettings.connectionType && (
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-neutral-500">Connection Type</span>
                      <Badge variant="outline">
                        {/* @ts-ignore */}
                        {device.connectionSettings.connectionType.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                  
                  {/* @ts-ignore */}
                  {device.connectionSettings.autoSync !== undefined && (
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-neutral-500">Auto Sync</span>
                      <Badge variant={/* @ts-ignore */ device.connectionSettings.autoSync ? "default" : "outline"}>
                        {/* @ts-ignore */}
                        {device.connectionSettings.autoSync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  )}
                  
                  {/* @ts-ignore */}
                  {device.connectionSettings.syncInterval && (
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-neutral-500">Sync Interval</span>
                      <span>
                        {/* @ts-ignore */}
                        {device.connectionSettings.syncInterval} minutes
                      </span>
                    </div>
                  )}
                  
                  {/* Data permissions section */}
                  {/* @ts-ignore */}
                  {device.connectionSettings.dataPermissions && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Data Permissions</h4>
                      <div className="space-y-2">
                        {/* @ts-ignore */}
                        {Object.entries(device.connectionSettings.dataPermissions).map(([key, enabled]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm">
                              {key.replace(/([A-Z])/g, ' $1').split(/(?=[A-Z])/).map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                            <Badge variant={enabled ? "default" : "outline"} className="text-xs">
                              {enabled ? 'Allowed' : 'Denied'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}