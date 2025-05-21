import { z } from 'zod';

export const appointmentSchema = z.object({
  doctorId: z.string(),
  patientId: z.string(),
  date: z.date(),
  timeSlot: z.string(),
  location: z.string(),
  reason: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type Appointment = z.infer<typeof appointmentSchema>; 