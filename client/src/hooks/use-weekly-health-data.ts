import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

/**
 * Custom hook to fetch the current week's health data for a user
 */
export function useWeeklyHealthData() {
  const { user } = useAuth();
  const userId = user?.id;
  
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