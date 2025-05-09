import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function useHealthData() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const {
    data: healthData,
    isLoading,
    error
  } = useQuery<HealthData>({
    queryKey: [`/api/users/${userId}/health-data/latest`],
  });

  const deleteHealthDataMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/health-data/${id}`);
    },
    onSuccess: () => {
      // Invalidate the queries to refetch data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/health-data/latest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/health-data/weekly`] });
      
      toast({
        title: 'Health data deleted',
        description: 'Your health data has been successfully deleted',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error deleting health data:', error);
      toast({
        title: 'Failed to delete health data',
        description: 'An error occurred while deleting your health data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    healthData,
    isLoading,
    error,
    deleteHealthData: deleteHealthDataMutation.mutate,
    isDeletingHealthData: deleteHealthDataMutation.isPending
  };
}
