import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AddReminderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Define categories with their associated colors
const reminderCategories = [
  { value: 'medication', label: 'Medication', color: 'blue-500' },
  { value: 'hydration', label: 'Hydration', color: 'cyan-500' },
  { value: 'activity', label: 'Activity', color: 'green-500' },
  { value: 'appointment', label: 'Appointment', color: 'purple-500' },
  { value: 'nutrition', label: 'Nutrition', color: 'yellow-500' },
  { value: 'other', label: 'Other', color: 'gray-500' },
];

// Extend the insert schema with additional validation
const formSchema = z.object({
  userId: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  time: z.string().min(1, 'Time is required'),
  frequency: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  color: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddReminderModal({ isOpen, onClose }: AddReminderModalProps) {
  const { user } = useAuth();
  const userId = user?.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      title: '',
      description: '',
      time: '',
      frequency: '',
      category: 'medication',
      color: reminderCategories[0].color,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      // Ensure color is set based on category
      const category = reminderCategories.find(c => c.value === data.category);
      const formattedData = {
        ...data,
        color: category?.color || 'blue-500',
      };
      
      console.log('Submitting reminder:', formattedData);
      const response = await apiRequest('POST', '/api/reminders', formattedData);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save reminder');
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate queries to refresh reminder list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/reminders`] });
      
      // Close the modal and show success toast
      onClose();
      toast({
        title: 'Reminder added successfully',
        description: 'Your reminder has been created.',
        variant: 'default',
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add reminder',
        description: error.message || 'An error occurred while adding the reminder.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  const handleCategoryChange = (value: string) => {
    const category = reminderCategories.find(c => c.value === value);
    if (category) {
      form.setValue('color', category.color);
    }
    form.setValue('category', value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
          <DialogDescription>
            Create a new reminder to help you stay on track with your health goals.
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
                    <Input placeholder="Take medication" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this reminder"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input placeholder="8:00 AM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Daily" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={handleCategoryChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reminderCategories.map((category) => (
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
