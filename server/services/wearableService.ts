/**
 * Wearable Device Service
 * 
 * Provides functionality for integrating with wearable devices, simulating
 * real-time health data, and synchronizing device data with the platform.
 */

import { WearableDevice, HealthData, InsertHealthData, DeviceCapabilities } from '@shared/schema';
import { storage } from '../storage';
import { encryptData } from '../security';

/**
 * Syncs health data from a wearable device to create new health records
 */
export async function syncWearableHealthData(deviceId: number): Promise<HealthData | null> {
  try {
    // Get the device to sync
    const device = await storage.getWearableDevice(deviceId);
    if (!device || !device.isConnected) {
      console.error(`Cannot sync device ${deviceId}: Device not found or not connected`);
      return null;
    }
    
    // Get the user's latest health data to build upon
    const latestHealthData = await storage.getLatestHealthData(device.userId);
    
    // Simulate new health data based on device capabilities
    const capabilities = device.capabilities as DeviceCapabilities || {};
    const simulatedData = simulateHealthData(latestHealthData, capabilities);
    
    // Create new health record with the simulated data
    const newHealthData: InsertHealthData = {
      userId: device.userId,
      date: new Date(),
      healthMetrics: simulatedData
    };
    
    // Store the health data
    const createdHealthData = await storage.createHealthData(newHealthData);
    
    // Update the device's last synced timestamp
    await storage.updateWearableDeviceLastSynced(deviceId, new Date());
    
    return createdHealthData;
  } catch (error) {
    console.error('Error syncing wearable health data:', error);
    return null;
  }
}

/**
 * Gets supported device types with their default capabilities
 */
export function getSupportedDeviceTypes(): Array<{
  name: string;
  types: Array<{
    type: string;
    models: Array<{
      name: string;
      manufacturer: string;
      capabilities: DeviceCapabilities;
    }>;
  }>;
}> {
  return [
    {
      name: 'Smartwatches',
      types: [
        {
          type: 'watch',
          models: [
            {
              name: 'Apple Watch Series 8',
              manufacturer: 'Apple',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                temperature: true
              }
            },
            {
              name: 'Apple Watch Ultra',
              manufacturer: 'Apple',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                temperature: true
              }
            },
            {
              name: 'Samsung Galaxy Watch 6',
              manufacturer: 'Samsung',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            },
            {
              name: 'Samsung Galaxy Watch Ultra',
              manufacturer: 'Samsung',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                ecg: true,
                stress: true,
                temperature: true
              }
            },
            {
              name: 'Fitbit Sense 2',
              manufacturer: 'Fitbit',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true,
                temperature: true
              }
            },
            {
              name: 'Garmin Forerunner 955',
              manufacturer: 'Garmin',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Fitness Trackers',
      types: [
        {
          type: 'tracker',
          models: [
            {
              name: 'Fitbit Charge 5',
              manufacturer: 'Fitbit',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                bloodOxygen: true,
                stress: true
              }
            },
            {
              name: 'Garmin Vivosmart 5',
              manufacturer: 'Garmin',
              capabilities: {
                heartRate: true,
                stepCount: true,
                caloriesBurned: true,
                sleep: true,
                stress: true
              }
            },
            {
              name: 'Whoop Strap 4.0',
              manufacturer: 'Whoop',
              capabilities: {
                heartRate: true,
                caloriesBurned: true,
                sleep: true,
                breathingRate: true,
                stress: true
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Smart Rings',
      types: [
        {
          type: 'ring',
          models: [
            {
              name: 'Oura Ring Gen 3',
              manufacturer: 'Oura',
              capabilities: {
                heartRate: true,
                sleep: true,
                temperature: true,
                bloodOxygen: true
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Smart Scales',
      types: [
        {
          type: 'scale',
          models: [
            {
              name: 'Withings Body Comp',
              manufacturer: 'Withings',
              capabilities: {
                weight: true,
                bodyFatPercentage: true
              }
            },
            {
              name: 'Garmin Index S2',
              manufacturer: 'Garmin',
              capabilities: {
                weight: true,
                bodyFatPercentage: true
              }
            }
          ]
        }
      ]
    }
  ];
}

/**
 * Simulates health data based on device capabilities and previous data
 */
function simulateHealthData(latestData: HealthData | undefined, capabilities: DeviceCapabilities): Record<string, any> {
  // Start with some base data
  const baseData: Record<string, any> = {
    // Base metrics every device should track
    activityLevel: Math.floor(Math.random() * 5) + 1, // 1-5 scale
    stepsGoal: 10000,
    caloriesGoal: 2500,
    sleepGoal: 8,
    hydrationGoal: 2000, // ml
    lastUpdated: new Date().toISOString()
  };
  
  // Include metrics based on device capabilities
  if (capabilities.stepCount) {
    baseData.steps = Math.floor(Math.random() * 15000) + 2000; // 2000-17000 steps
  }
  
  if (capabilities.heartRate) {
    baseData.heartRate = Math.floor(Math.random() * 40) + 60; // 60-100 bpm
    baseData.heartRateMin = baseData.heartRate - Math.floor(Math.random() * 10) - 5; // min heart rate
    baseData.heartRateMax = baseData.heartRate + Math.floor(Math.random() * 40) + 20; // max heart rate
  }
  
  if (capabilities.caloriesBurned) {
    baseData.calories = Math.floor(Math.random() * 1500) + 500; // 500-2000 calories
  }
  
  if (capabilities.sleep) {
    baseData.sleep = Math.round((Math.random() * 3) + 5 + Math.random()) * 10 / 10; // 5-8.9 hours
    baseData.deepSleep = Math.round((baseData.sleep * 0.25) * 10) / 10; // ~25% deep sleep
    baseData.remSleep = Math.round((baseData.sleep * 0.2) * 10) / 10; // ~20% REM sleep
  }
  
  if (capabilities.bloodOxygen) {
    baseData.bloodOxygen = Math.floor(Math.random() * 3) + 96; // 96-99%
  }
  
  if (capabilities.stress) {
    baseData.stressLevel = Math.floor(Math.random() * 70) + 20; // 20-90
  }
  
  if (capabilities.temperature) {
    // Normal body temp + small variation
    baseData.temperature = Math.round((36.5 + (Math.random() * 1.6 - 0.8)) * 10) / 10; // 35.7-38.1°C
  }
  
  if (capabilities.weight) {
    // If we have previous data, only change weight slightly
    if (latestData?.healthMetrics?.weight) {
      const prevWeight = parseFloat(latestData.healthMetrics.weight);
      baseData.weight = Math.round((prevWeight + (Math.random() * 0.6 - 0.3)) * 10) / 10;
    } else {
      baseData.weight = Math.round((70 + (Math.random() * 20 - 10)) * 10) / 10; // 60-80kg
    }
  }
  
  if (capabilities.bodyFatPercentage) {
    baseData.bodyFatPercentage = Math.round((20 + (Math.random() * 10 - 5)) * 10) / 10; // 15-25%
  }
  
  if (capabilities.bloodPressure) {
    baseData.systolic = Math.floor(Math.random() * 30) + 110; // 110-140 mmHg
    baseData.diastolic = Math.floor(Math.random() * 20) + 70; // 70-90 mmHg
  }
  
  return baseData;
}

/**
 * Checks device connectivity and performs diagnostics
 */
export async function checkDeviceConnectivity(deviceId: number): Promise<{ 
  connected: boolean; 
  batteryLevel?: number;
  syncStatus?: string;
  firmwareStatus?: string;
  lastChecked: Date;
}> {
  const device = await storage.getWearableDevice(deviceId);
  if (!device) {
    return { connected: false, lastChecked: new Date() };
  }
  
  // Simulate connectivity check
  const batteryLevel = device.batteryLevel || Math.floor(Math.random() * 100);
  const connected = device.isConnected;
  
  return {
    connected,
    batteryLevel,
    syncStatus: connected ? 'Online' : 'Offline',
    firmwareStatus: connected ? (Math.random() > 0.8 ? 'Update Available' : 'Up to Date') : 'Unknown',
    lastChecked: new Date()
  };
}

/**
 * Gets available firmware updates for a device
 */
export async function getAvailableFirmwareUpdates(deviceId: number): Promise<{
  available: boolean;
  currentVersion?: string;
  latestVersion?: string;
  releaseNotes?: string;
  updateSize?: string;
}> {
  const device = await storage.getWearableDevice(deviceId);
  if (!device || !device.isConnected) {
    return { available: false };
  }
  
  // If device has no firmware version, we can't check for updates
  if (!device.firmwareVersion) {
    return { available: false };
  }
  
  // Simulate firmware check
  const available = Math.random() > 0.7;
  
  if (!available) {
    return {
      available: false,
      currentVersion: device.firmwareVersion,
      latestVersion: device.firmwareVersion
    };
  }
  
  // Parse current version and simulate a newer version
  let currentVersionParts = device.firmwareVersion.split('.');
  let newVersionParts = [...currentVersionParts];
  
  // Increment either minor or patch version
  if (Math.random() > 0.5 && newVersionParts.length > 2) {
    // Increment patch version
    newVersionParts[2] = (parseInt(newVersionParts[2]) + 1).toString();
  } else if (newVersionParts.length > 1) {
    // Increment minor version, reset patch
    newVersionParts[1] = (parseInt(newVersionParts[1]) + 1).toString();
    if (newVersionParts.length > 2) {
      newVersionParts[2] = '0';
    }
  } else {
    // Simple increment if version format is unexpected
    newVersionParts[0] = (parseInt(newVersionParts[0]) + 1).toString();
  }
  
  const latestVersion = newVersionParts.join('.');
  
  return {
    available: true,
    currentVersion: device.firmwareVersion,
    latestVersion,
    releaseNotes: 'Bug fixes and performance improvements. Enhanced heart rate tracking accuracy and battery optimization.',
    updateSize: `${Math.floor(Math.random() * 20) + 10}MB`
  };
}
