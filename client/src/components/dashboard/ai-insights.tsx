import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Brain, Utensils, Dumbbell } from 'lucide-react';
import { getColorForCategory, getIconForCategory } from '@/lib/utils';
import { type AiInsight } from '@shared/schema';

export function AiInsights() {
  const { data: insights, isLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/users/1/ai-insights'],
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

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">AI Health Insights</h2>
        <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors p-0">View All</Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm animate-pulse">
              <CardContent className="p-5 h-32"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights?.map((insight) => (
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
      )}
    </section>
  );
}
