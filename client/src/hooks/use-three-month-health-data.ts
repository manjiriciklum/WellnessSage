import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

/**
 * Custom hook to fetch the last 3 months' health data for a user
 */
export function useThreeMonthHealthData() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const {
    data: threeMonthHealthData,
    isLoading,
    error
  } = useQuery<HealthData[]>({
    queryKey: [`/api/users/${userId}/health-data/three-month`],
  });
  
  // Process data to get it in the right format for chart visualization
  const processedData = {
    labels: threeMonthHealthData?.map(data => {
      const date = new Date(data.date!);
      // Return date in MM/DD format
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    
    datasets: {
      steps: threeMonthHealthData?.map(data => data.steps || 0) || [],
      calories: threeMonthHealthData?.map(data => data.calories || 0) || [],
      activeMinutes: threeMonthHealthData?.map(data => data.activeMinutes || 0) || [],
      heartRate: threeMonthHealthData?.map(data => data.heartRate || 0) || [],
      sleepHours: threeMonthHealthData?.map(data => data.sleepHours || 0) || [],
      sleepQuality: threeMonthHealthData?.map(data => data.sleepQuality || 0) || [],
      healthScore: threeMonthHealthData?.map(data => data.healthScore || 0) || [],
      stressLevel: threeMonthHealthData?.map(data => data.stressLevel || 0) || []
    }
  };
  
  return {
    threeMonthHealthData,
    processedData,
    isLoading,
    error
  };
} 