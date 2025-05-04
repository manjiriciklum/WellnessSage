import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useHealthData } from '@/hooks/use-health-data';

export function ActivityMetrics() {
  const { healthData, isLoading } = useHealthData();
  
  const stepsProgress = healthData ? (healthData.steps / 10000) * 100 : 0;
  const activeMinutesProgress = healthData ? (healthData.activeMinutes / 60) * 100 : 0;
  const caloriesProgress = healthData ? (healthData.calories / 2500) * 100 : 0;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Daily Activity</h3>
          <Button variant="ghost" size="icon" className="text-neutral-400 dark:text-neutral-300 h-6 w-6">
            <MoreHorizontal size={16} />
          </Button>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">Steps</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                {healthData?.steps?.toLocaleString() || '0'} / 10,000
              </span>
            </div>
            <Progress value={stepsProgress} className="h-2" 
              indicatorClassName="bg-primary" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">Active Minutes</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                {healthData?.activeMinutes || '0'} / 60
              </span>
            </div>
            <Progress value={activeMinutesProgress} className="h-2" 
              indicatorClassName="bg-secondary" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">Calories</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                {healthData?.calories?.toLocaleString() || '0'} / 2,500
              </span>
            </div>
            <Progress value={caloriesProgress} className="h-2" 
              indicatorClassName="bg-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
