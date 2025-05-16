import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type HealthData } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface HealthData {
  id: string;
  userId: string;
  date: string;
  steps: number;
  activeMinutes: number;
  calories: number;
  sleepHours: number;
  sleepQuality: number;
  heartRate: number;
  healthScore: number | null;
  stressLevel: number;
  healthMetrics: Record<string, any>;
}

function calculateHealthScore(data: Partial<HealthData>): number {
  // Initialize score components
  let activityScore = 0;
  let sleepScore = 0;
  let heartRateScore = 0;
  let stressScore = 0;

  // Calculate activity score (40% of total)
  if (data.steps !== undefined) {
    // Steps component (20%)
    const stepsScore = Math.min((data.steps / 10000) * 20, 20);
    activityScore += stepsScore;
  }

  if (data.activeMinutes !== undefined) {
    // Active minutes component (20%)
    const activeMinutesScore = Math.min((data.activeMinutes / 60) * 20, 20);
    activityScore += activeMinutesScore;
  }

  // Calculate sleep score (30% of total)
  if (data.sleepHours !== undefined) {
    // Sleep duration component (15%)
    const sleepHoursScore = Math.min((data.sleepHours / 8) * 15, 15);
    sleepScore += sleepHoursScore;
  }

  if (data.sleepQuality !== undefined) {
    // Sleep quality component (15%)
    const sleepQualityScore = (data.sleepQuality / 100) * 15;
    sleepScore += sleepQualityScore;
  }

  // Calculate heart rate score (20% of total)
  if (data.heartRate !== undefined) {
    // Normal resting heart rate is between 60-100 bpm
    // Score decreases as heart rate deviates from optimal range
    const optimalHeartRate = 70;
    const deviation = Math.abs(data.heartRate - optimalHeartRate);
    heartRateScore = Math.max(20 - (deviation * 0.5), 0);
  }

  // Calculate stress score (10% of total)
  if (data.stressLevel !== undefined) {
    // Lower stress level is better
    stressScore = Math.max(10 - (data.stressLevel * 0.5), 0);
  }

  // Calculate total score
  const totalScore = Math.round(activityScore + sleepScore + heartRateScore + stressScore);

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, totalScore));
}

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

export function useWeeklyHealthData() {
  return useQuery({
    queryKey: ['weeklyHealthData'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users/6821f14311ec004ed36ec5aa/health-data/weekly');
      if (!response.ok) {
        throw new Error('Failed to fetch weekly health data');
      }
      const data = await response.json();

      // Calculate health score for each entry if it's null
      const processedData = data.map((entry: HealthData) => ({
        ...entry,
        healthScore: entry.healthScore ?? calculateHealthScore(entry)
      }));

      return {
        processedData,
        isLoading: false,
        error: null
      };
    }
  });
}
