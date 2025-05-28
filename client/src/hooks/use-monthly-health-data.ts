import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

/**
 * Custom hook to fetch the last 30 days' health data for a user
 */
export function useMonthlyHealthData() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const {
    data: monthlyHealthData,
    isLoading,
    error
  } = useQuery<HealthData[]>({
    queryKey: [`/api/users/${userId}/health-data/monthly`],
  });
  
  // Process data to get it in the right format for chart visualization
  const processedData = {
    labels: monthlyHealthData?.map(data => {
      const date = new Date(data.date!);
      // Return date in MM/DD format
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    
    datasets: {
      steps: monthlyHealthData?.map(data => data.steps || 0) || [],
      calories: monthlyHealthData?.map(data => data.calories || 0) || [],
      activeMinutes: monthlyHealthData?.map(data => data.activeMinutes || 0) || [],
      heartRate: monthlyHealthData?.map(data => data.heartRate || 0) || [],
      sleepHours: monthlyHealthData?.map(data => data.sleepHours || 0) || [],
      sleepQuality: monthlyHealthData?.map(data => data.sleepQuality || 0) || [],
      healthScore: monthlyHealthData?.map(data => data.healthScore || 0) || [],
      stressLevel: monthlyHealthData?.map(data => data.stressLevel || 0) || []
    }
  };
  
  return {
    monthlyHealthData,
    processedData,
    isLoading,
    error
  };
} 