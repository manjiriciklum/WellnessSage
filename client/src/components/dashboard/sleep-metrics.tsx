import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useHealthData } from '@/hooks/use-health-data';
import { formatDuration } from '@/lib/utils';

export function SleepMetrics() {
  const { healthData, isLoading } = useHealthData();
  
  const sleepHours = healthData?.sleepHours || 0;
  const sleepQuality = healthData?.sleepQuality || 0;
  const deepSleepHours = sleepHours * 0.375; // Approximation for visualization
  
  const sleepTrend = sleepQuality > 70 ? 'Improving' : 'Declining';
  const trendColor = sleepTrend === 'Improving' ? 'bg-success/10 text-success' : 'bg-error/10 text-error';
  const trendValue = sleepTrend === 'Improving' ? '+8%' : '-8%';
  const trendIcon = sleepTrend === 'Improving' ? 'arrow_upward' : 'arrow_downward';
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-200">Sleep Quality</h3>
          <span className={`text-xs ${trendColor} px-2 py-1 rounded-full flex items-center`}>
            <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {sleepTrend === 'Improving' ? (
                <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            {trendValue}
          </span>
        </div>
        <div className="my-3 h-[150px]">
          <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(126, 87, 194)" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="rgb(126, 87, 194)" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            <path d="M0,120 C20,100 40,110 60,95 C80,80 100,85 120,75 C140,65 160,40 180,60 C200,80 220,70 240,40 C260,10 280,30 300,20 L300,150 L0,150 Z" 
                  fill="url(#sleepGradient)" stroke="rgb(126, 87, 194)" strokeWidth="2"/>
          </svg>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-300">Total</span>
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-100">
              {formatDuration(sleepHours)}
            </p>
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-300">Deep</span>
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-100">
              {formatDuration(deepSleepHours)}
            </p>
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-500 dark:text-neutral-300">Quality</span>
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-100">
              {sleepQuality}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
