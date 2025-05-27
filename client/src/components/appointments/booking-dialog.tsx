import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type Doctor } from '@/types/doctor';

const API_URL = 'http://localhost:5000/api';

interface BookingDialogProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  appointmentType: 'in-clinic' | 'video' | null;
}

export function BookingDialog({ doctor, isOpen, onClose, onSuccess, appointmentType }: BookingDialogProps) {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookAppointment = useMutation({
    mutationFn: async (appointmentData: {
      doctorId: string;
      date: string;
      timeSlot: string;
      location?: string;
      reason: string;
      appointmentType: 'in-clinic' | 'video';
    }) => {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
      });
      onClose();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !appointmentType) return;
    
    if (!date || !timeSlot || !reason || (appointmentType === 'in-clinic' && !location)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    bookAppointment.mutate({
      doctorId: doctor.id,
      date: format(date, 'yyyy-MM-dd'),
      timeSlot,
      location: appointmentType === 'in-clinic' ? location : undefined,
      reason,
      appointmentType,
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsCalendarOpen(false);
  };

  if (!doctor) return null;

  // Get available time slots from doctor's availability
  const availableTimeSlots = doctor.availability?.timeSlots || [
    '09:00 AM',
    '10:30 AM',
    '02:00 PM',
    '03:30 PM',
    '04:00 PM'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {appointmentType === 'video' ? 'Video' : ''} Appointment with Dr. {doctor.name}</DialogTitle>
          <DialogDescription>
            Select your preferred date and time slot for the appointment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {appointmentType === 'in-clinic' && (
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {doctor.locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="main">Main Clinic</SelectItem>
                      <SelectItem value="satellite">Satellite Clinic</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Reason for Visit</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Checkup</SelectItem>
                <SelectItem value="followup">Follow-up Visit</SelectItem>
                <SelectItem value="consultation">New Consultation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={bookAppointment.isPending}>
              {bookAppointment.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 