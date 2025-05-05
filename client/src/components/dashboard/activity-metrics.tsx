import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/ui/simple-progress';
import { useHealthData } from '@/hooks/use-health-data';

export function ActivityMetrics() {
  const { healthData, isLoading } = useHealthData();
  
  // Log values for debugging
  console.log('Health Data:', healthData);
  
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
            <SimpleProgress value={healthData?.steps || 0} maxValue={10000} colorClass="bg-primary" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">Active Minutes</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                {healthData?.activeMinutes || '0'} / 60
              </span>
            </div>
            <SimpleProgress value={healthData?.activeMinutes || 0} maxValue={60} colorClass="bg-secondary" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-300">Calories</span>
              <span className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">
                {healthData?.calories?.toLocaleString() || '0'} / 2,500
              </span>
            </div>
            <CustomProgress value={healthData?.calories || 0} maxValue={2500} className="h-2" 
              barClassName="bg-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
