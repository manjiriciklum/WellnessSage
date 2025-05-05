import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AddGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Define goal categories
const goalCategories = [
  { value: 'exercise', label: 'Exercise' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'meditation', label: 'Meditation' },
  { value: 'other', label: 'Other' },
];

// Extend the insert schema with additional validation
const formSchema = z.object({
  userId: z.number(),
  title: z.string().min(1, 'Title is required'),
  target: z.number().positive('Target must be greater than 0'),
  current: z.number().min(0).optional().default(0),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  startDate: z.date().optional().default(() => new Date()),
  endDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { user } = useAuth();
  const userId = user?.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      title: '',
      target: 0,
      current: 0,
      unit: '',
      category: 'exercise',
      startDate: new Date(),
      endDate: null,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format dates as ISO strings
      const formattedData = {
        ...data,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString() || null,
      };
      
      console.log('Submitting goal:', formattedData);
      try {
        const response = await apiRequest('POST', '/api/goals', formattedData);
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Goal submission failed:', result);
          throw new Error(result.message || result.error || 'Failed to save goal');
        }
        return result;
      } catch (error) {
        console.error('Goal submission exception:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh goal list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goals`] });
      
      // Close the modal and show success toast
      onClose();
      toast({
        title: 'Goal added successfully',
        description: 'Your goal has been created.',
        variant: 'default',
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add goal',
        description: error.message || 'An error occurred while adding the goal.',
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
          <DialogTitle>Add Goal</DialogTitle>
          <DialogDescription>
            Create a new goal to track your progress towards better health.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Exercise 5 days a week" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="10000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="steps" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Progress</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {goalCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {isPending ? 'Saving...' : 'Save Goal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
