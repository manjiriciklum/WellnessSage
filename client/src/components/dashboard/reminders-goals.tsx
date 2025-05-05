import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { SimpleProgress } from '@/components/ui/simple-progress';
import { CheckCircle, Plus } from 'lucide-react';
import { type Reminder, type Goal } from '@shared/schema';
import { calculateProgress } from '@/lib/utils';
import { AddReminderModal } from './add-reminder-modal';
import { AddGoalModal } from './add-goal-modal';
import { useAuth } from '@/hooks/use-auth';

export function RemindersAndGoals() {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const { data: reminders, isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: [`/api/users/${userId}/reminders`],
    enabled: !!userId,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: [`/api/users/${userId}/goals`],
    enabled: !!userId,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">Reminders & Goals</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsReminderModalOpen(true)}
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Reminder</span>
          </Button>
          <Button 
            onClick={() => setIsGoalModalOpen(true)}
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Goal</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm h-full">
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
        
        <Card className="shadow-sm h-full">
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
                {/* Display goals from the API */}
                {goals?.map((goal) => (
                  <div key={goal.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-neutral-700 dark:text-neutral-200">{goal.title}</span>
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <SimpleProgress 
                      value={goal.current || 0} 
                      maxValue={goal.target || 1}
                      colorClass={
                        goal.category === 'exercise' ? 'bg-primary' :
                        goal.category === 'sleep' ? 'bg-error' :
                        'bg-secondary'
                      }
                    />
                  </div>
                ))}
                
                {/* Dummy goals for demonstration */}
                <div className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">Daily Walk</span>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      7000/10000
                    </span>
                  </div>
                  <SimpleProgress 
                    value={7000} 
                    maxValue={10000}
                    colorClass="bg-primary"
                  />
                </div>
                
                <div className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">Meditation</span>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      3/5
                    </span>
                  </div>
                  <SimpleProgress 
                    value={3} 
                    maxValue={5}
                    colorClass="bg-secondary"
                  />
                </div>
                
                <div className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">Sleep Duration</span>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      6/8
                    </span>
                  </div>
                  <SimpleProgress 
                    value={6} 
                    maxValue={8}
                    colorClass="bg-error"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      <AddReminderModal 
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />
      
      <AddGoalModal 
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
}
