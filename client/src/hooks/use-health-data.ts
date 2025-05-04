import { useQuery } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';

export function useHealthData() {
  // In a real app, we would get the user ID from auth context
  // For demo purposes, we're using a hardcoded user ID
  const userId = 1;
  
  const {
    data: healthData,
    isLoading,
    error
  } = useQuery<HealthData>({
    queryKey: [`/api/users/${userId}/health-data/latest`],
  });
  
  return {
    healthData,
    isLoading,
    error
  };
}
