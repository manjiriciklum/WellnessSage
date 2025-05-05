import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type AddHealthDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Extend the insert schema with additional validation
const formSchema = z.object({
  userId: z.number(),
  date: z.date().optional().default(() => new Date()),
  steps: z.number().min(0).optional().nullable(),
  activeMinutes: z.number().min(0).optional().nullable(),
  calories: z.number().min(0).optional().nullable(),
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  sleepQuality: z.number().min(0).max(100).optional().nullable(),
  heartRate: z.number().min(0).max(220).optional().nullable(),
  healthScore: z.number().min(0).max(100).optional().nullable(),
  stressLevel: z.number().min(0).max(10).optional().nullable(),
  healthMetrics: z.any().optional().default({})
});

type FormValues = z.infer<typeof formSchema>;

export function AddHealthDataModal({ isOpen, onClose }: AddHealthDataModalProps) {
  // Hard-coded userId for demo purposes
  const userId = 1;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      date: new Date(),
      steps: null,
      activeMinutes: null,
      calories: null,
      sleepHours: null,
      sleepQuality: null,
      heartRate: null,
      healthScore: null,
      stressLevel: null,
      healthMetrics: {}
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      // Clean up and format the data for API submission
      // Ensure all fields are properly set with correct types
      const formattedData = {
        userId: data.userId,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        steps: data.steps !== null ? data.steps : null,
        activeMinutes: data.activeMinutes !== null ? data.activeMinutes : null,
        calories: data.calories !== null ? data.calories : null,
        sleepHours: data.sleepHours !== null ? data.sleepHours : null,
        sleepQuality: data.sleepQuality !== null ? data.sleepQuality : null,
        heartRate: data.heartRate !== null ? data.heartRate : null,
        healthScore: data.healthScore !== null ? data.healthScore : null,
        stressLevel: data.stressLevel !== null ? data.stressLevel : null,
        healthMetrics: data.healthMetrics || {}
      };
      
      console.log('Submitting health data:', formattedData);
      const response = await apiRequest('POST', '/api/health-data', formattedData);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save health data');
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate the health data queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/health-data/latest`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/health-data/weekly`] });
      
      // Close the modal and show success toast
      onClose();
      toast({
        title: 'Health data added successfully',
        description: 'Your health data has been recorded.',
        variant: 'default',
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add health data',
        description: error.message || 'An error occurred while adding health data.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Health Data</DialogTitle>
          <DialogDescription>
            Manually add your health metrics. This data will be used to track your health progress.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steps</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 8000"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Minutes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 30"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories Burned</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 1500"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heart Rate (BPM)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 72"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sleepHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g. 7.5"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max="100"
                        placeholder="e.g. 85"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress Level (0-10)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max="10"
                        placeholder="e.g. 3"
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Data'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
