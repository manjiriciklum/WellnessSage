import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';

/**
 * Custom hook to fetch the current week's health data for a user
 */
export function useWeeklyHealthData() {
  // In a real app, we would get the user ID from auth context
  // For demo purposes, we're using a hardcoded user ID
  const userId = 1;
  
  const {
    data: weeklyHealthData,
    isLoading,
    error
  } = useQuery<HealthData[]>({
    queryKey: [`/api/users/${userId}/health-data/weekly`],
  });
  
  // Process data to get it in the right format for chart visualization
  const processedData = {
    labels: weeklyHealthData?.map(data => {
      const date = new Date(data.date!);
      // Return short day name (e.g. "Mon", "Tue")
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }) || [],
    
    datasets: {
      steps: weeklyHealthData?.map(data => data.steps || 0) || [],
      calories: weeklyHealthData?.map(data => data.calories || 0) || [],
      activeMinutes: weeklyHealthData?.map(data => data.activeMinutes || 0) || [],
      heartRate: weeklyHealthData?.map(data => data.heartRate || 0) || [],
      sleepHours: weeklyHealthData?.map(data => data.sleepHours || 0) || [],
      sleepQuality: weeklyHealthData?.map(data => data.sleepQuality || 0) || [],
      healthScore: weeklyHealthData?.map(data => data.healthScore || 0) || [],
      stressLevel: weeklyHealthData?.map(data => data.stressLevel || 0) || []
    }
  };
  
  return {
    weeklyHealthData,
    processedData,
    isLoading,
    error
  };
}