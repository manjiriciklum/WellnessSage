import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

/**
 * Custom hook to fetch the last 6 months' health data for a user
 */
export function useSixMonthHealthData() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const {
    data: sixMonthHealthData,
    isLoading,
    error
  } = useQuery<HealthData[]>({
    queryKey: [`/api/users/${userId}/health-data/six-month`],
  });
  
  // Process data to get it in the right format for chart visualization
  const processedData = {
    labels: sixMonthHealthData?.map(data => {
      const date = new Date(data.date!);
      // Return date in MM/DD format
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    
    datasets: {
      steps: sixMonthHealthData?.map(data => data.steps || 0) || [],
      calories: sixMonthHealthData?.map(data => data.calories || 0) || [],
      activeMinutes: sixMonthHealthData?.map(data => data.activeMinutes || 0) || [],
      heartRate: sixMonthHealthData?.map(data => data.heartRate || 0) || [],
      sleepHours: sixMonthHealthData?.map(data => data.sleepHours || 0) || [],
      sleepQuality: sixMonthHealthData?.map(data => data.sleepQuality || 0) || [],
      healthScore: sixMonthHealthData?.map(data => data.healthScore || 0) || [],
      stressLevel: sixMonthHealthData?.map(data => data.stressLevel || 0) || []
    }
  };
  
  return {
    sixMonthHealthData,
    processedData,
    isLoading,
    error
  };
} 