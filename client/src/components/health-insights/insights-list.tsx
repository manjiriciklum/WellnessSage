import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Brain, Utensils, Dumbbell } from 'lucide-react';
import { getColorForCategory, getIconForCategory } from '@/lib/utils';
import { type AiInsight } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

// Mock data specific to health insights page
const healthInsightsMockData = (userId: number): AiInsight[] => [
  {
    id: 1,
    userId: userId,
    title: 'Comprehensive Health Analysis',
    description: 'Based on your recent health data, we\'ve identified several areas for improvement. Your sleep quality has decreased by 15% this week.',
    category: 'stress',
    action: 'View Analysis',
    createdAt: new Date(),
    isRead: false
  },
  {
    id: 2,
    userId: userId,
    title: 'Long-term Health Trends',
    description: 'Your cardiovascular health has shown steady improvement over the past 3 months. Keep up the good work with your exercise routine!',
    category: 'fitness',
    action: 'See Trends',
    createdAt: new Date(),
    isRead: false
  },
  {
    id: 3,
    userId: userId,
    title: 'Nutrition Assessment',
    description: 'Your dietary patterns indicate a need for more protein-rich foods. Consider incorporating more lean meats and legumes into your diet.',
    category: 'nutrition',
    action: 'Get Plan',
    createdAt: new Date(),
    isRead: false
  }
];

export function InsightsList() {
  const { user } = useAuth();
  const userId = user?.id;

  console.log(user);

  const { data: insights, isLoading, error } = useQuery<AiInsight[]>({
    queryKey: ['health-insights', userId],
    enabled: !!userId,
    initialData: userId ? healthInsightsMockData(userId) : undefined,
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      try {
        const response = await apiRequest('GET', `/api/users/${userId}/ai-insights`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching health insights:', error);
        return healthInsightsMockData(userId);
      }
    }
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm animate-pulse">
            <CardContent className="p-5 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading insights: {error.message}</div>;
  }

  if (!insights || insights.length === 0) {
    return <div className="text-neutral-600 dark:text-neutral-400">No insights available yet.</div>;
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card 
          key={insight.id} 
          className={`shadow-sm border-l-4 ${getBorderColor(insight.category)}`}
        >
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex items-start">
                <div className={`rounded-full ${getBgColor(insight.category)} p-3 mr-4`}>
                  {getIconComponent(insight.category)}
                </div>
                <div>
                  <h3 className="text-md font-medium text-neutral-800 dark:text-white mb-1">{insight.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{insight.description}</p>
                </div>
              </div>
              <Button 
                className="whitespace-nowrap"
                variant={insight.category === 'stress' ? 'default' : 'outline'}
              >
                {insight.action}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 