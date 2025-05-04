import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { type Reminder, type Goal } from '@shared/schema';
import { calculateProgress } from '@/lib/utils';
import { ConnectedDevices } from './connected-devices';

export function RemindersAndGoals() {
  const { data: reminders, isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/users/1/reminders'],
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ['/api/users/1/goals'],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">Reminders & Goals</h2>
        <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors p-0">Add New</Button>
      </div>
      
      <Card className="shadow-sm mb-4">
        <CardContent className="p-5">
          <h3 className="text-md font-medium text-neutral-800 dark:text-white mb-3">Today's Reminders</h3>
          
          {remindersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 border-b border-neutral-100 dark:border-neutral-600 last:border-0 animate-pulse">
                  <div className="h-6 bg-neutral-100 dark:bg-neutral-700 rounded-md w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {reminders?.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-600 last:border-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full bg-${reminder.color} mr-3`}></div>
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-100">{reminder.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-300">{reminder.time}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 h-6 w-6"
                  >
                    <CheckCircle size={18} />
                  </Button>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-md font-medium text-neutral-800 dark:text-white mb-3">Weekly Goals</h3>
          
          {goalsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-4 animate-pulse">
                  <div className="flex justify-between mb-1">
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded-md w-1/3"></div>
                    <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded-md w-1/6"></div>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {goals?.map((goal) => (
                <div key={goal.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">{goal.title}</span>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(goal.current, goal.target)} 
                    className="h-2" 
                    indicatorClassName={
                      goal.category === 'exercise' ? 'bg-primary' :
                      goal.category === 'sleep' ? 'bg-error' :
                      'bg-secondary'
                    }
                  />
                </div>
              ))}
            </>
          )}
          
          <div className="mt-6">
            <ConnectedDevices />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
