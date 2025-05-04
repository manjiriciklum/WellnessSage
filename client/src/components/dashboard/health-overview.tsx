import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ActivityMetrics } from './activity-metrics';
import { SleepMetrics } from './sleep-metrics';
import { useHealthData } from '@/hooks/use-health-data';

export function HealthOverview() {
  const { healthData, isLoading } = useHealthData();
  
  const healthScore = healthData?.healthScore || 0;
  
  return (
    <section className="mb-8">
      <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white mb-4">Health Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Health Score</h3>
              <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full flex items-center">
                <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                5%
              </span>
            </div>
            <div className="flex items-center justify-center my-3">
              <CircularProgress value={healthScore} size="lg" />
            </div>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-300">
              {healthScore >= 80 ? "Your health score is excellent" : 
               healthScore >= 60 ? "Your health score is good" : 
               "Your health score needs improvement"}
            </p>
          </CardContent>
        </Card>
        
        <ActivityMetrics />
        
        <SleepMetrics />
      </div>
    </section>
  );
}
