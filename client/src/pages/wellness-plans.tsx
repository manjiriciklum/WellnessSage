import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/ui/simple-progress';
import { Heart, Utensils, Moon, Brain } from 'lucide-react';

export default function WellnessPlansPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Wellness Plans</h1>
      
      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4">All Plans</TabsTrigger>
            <TabsTrigger value="fitness" className="text-xs sm:text-sm px-2 sm:px-4">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition" className="text-xs sm:text-sm px-2 sm:px-4">Nutrition</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs sm:text-sm px-2 sm:px-4">Sleep</TabsTrigger>
            <TabsTrigger value="stress" className="text-xs sm:text-sm px-2 sm:px-4">Stress</TabsTrigger>
          </TabsList>
          <Button className="w-full sm:w-auto">Create New Plan</Button>
        </div>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="text-primary" size={18} />
                  <CardTitle className="text-lg text-wrap break-words">Cardio Boost</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                  A 4-week program to improve cardiovascular health through progressive workouts.
                </p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="mb-4">
                  <SimpleProgress value={65} maxValue={100} colorClass="bg-primary" />
                </div>
                <Button variant="outline" className="w-full">View Plan</Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-t-4 border-t-secondary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Utensils className="text-secondary" size={18} />
                  <CardTitle className="text-lg text-wrap break-words">Balanced Nutrition</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                  A customized meal plan with protein-rich breakfasts and balanced macros throughout the day.
                </p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="mb-4">
                  <SimpleProgress value={40} maxValue={100} colorClass="bg-secondary" />
                </div>
                <Button variant="outline" className="w-full">View Plan</Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-t-4 border-t-accent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Moon className="text-accent" size={18} />
                  <CardTitle className="text-lg text-wrap break-words">Better Sleep Habits</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                  Improve sleep quality through consistent bedtime routines and environment optimization.
                </p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="mb-4">
                  <SimpleProgress value={25} maxValue={100} colorClass="bg-accent" />
                </div>
                <Button variant="outline" className="w-full">View Plan</Button>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-t-4 border-t-error">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="text-error" size={18} />
                  <CardTitle className="text-lg text-wrap break-words">Stress Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-200 mb-4 text-sm break-words">
                  Learn techniques to reduce stress through meditation, breathing exercises, and mindfulness.
                </p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-neutral-500 dark:text-neutral-300">Progress</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="mb-4">
                  <SimpleProgress value={10} maxValue={100} colorClass="bg-error" />
                </div>
                <Button variant="outline" className="w-full">View Plan</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="fitness">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Fitness plans will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Nutrition plans will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="sleep">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Sleep plans will appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="stress">
          <div className="text-center p-8">
            <p className="text-neutral-600 dark:text-neutral-200">
              Stress management plans will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
