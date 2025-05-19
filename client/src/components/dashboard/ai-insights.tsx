import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Brain, Utensils, Dumbbell } from 'lucide-react';
import { getColorForCategory, getIconForCategory } from '@/lib/utils';
import { type AiInsight } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { mockAiInsights } from '@/lib/mockData';
import { apiRequest } from '@/lib/queryClient';
import { InsightsList } from '../health-insights/insights-list';

// Shared query key for AI insights
export const AI_INSIGHTS_QUERY_KEY = 'ai-insights';

export function AiInsights() {
  const { user } = useAuth();
  const userId = user?.id;
  const [, navigate] = useLocation();

  const { data: insights, isLoading, error } = useQuery<AiInsight[]>({
    queryKey: [AI_INSIGHTS_QUERY_KEY, userId],
    enabled: !!userId,
    initialData: userId ? mockAiInsights(userId) : undefined,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/users/${userId}/ai-insights`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        // Return mock data if API fails
        return mockAiInsights(userId);
      }
    }
  });

  console.log('AI Insights Debug:', { userId, insights, isLoading, error });

  const getIconComponent = (category: string) => {
    switch (category) {
      case 'stress':
        return <Brain size={24} />;
      case 'nutrition':
        return <Utensils size={24} />;
      case 'fitness':
        return <Dumbbell size={24} />;
      default:
        return <Brain size={24} />;
    }
  };

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'stress':
        return 'border-primary';
      case 'nutrition':
        return 'border-secondary';
      case 'fitness':
        return 'border-accent';
      default:
        return 'border-primary';
    }
  };

  const getBgColor = (category: string) => {
    switch (category) {
      case 'stress':
        return 'bg-primary/10 text-primary';
      case 'nutrition':
        return 'bg-secondary/10 text-secondary';
      case 'fitness':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">AI Health Insights</h2>
        {/* <Button 
          variant="link" 
          className="text-primary text-sm font-medium hover:text-primary-dark transition-colors p-0"
          onClick={() => navigate('/health-insights')}
        >
          View All
        </Button> */}
      </div>
      
      <InsightsList />
    </section>
  );
}
