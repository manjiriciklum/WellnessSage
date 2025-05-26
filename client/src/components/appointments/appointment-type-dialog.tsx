import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Video } from "lucide-react";
import { type Doctor } from "@/types/doctor";

interface AppointmentTypeDialogProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'in-clinic' | 'video') => void;
}

export function AppointmentTypeDialog({
  doctor,
  isOpen,
  onClose,
  onSelectType,
}: AppointmentTypeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Appointment Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => onSelectType('in-clinic')}
          >
            <Building2 className="h-6 w-6" />
            <span>In-Clinic Appointment</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => onSelectType('video')}
          >
            <Video className="h-6 w-6" />
            <span>Video Consultation</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 