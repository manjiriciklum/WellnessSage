import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
          <DialogDescription>
            Choose how you would like to meet with the doctor
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto p-8 flex items-center justify-start gap-6 hover:bg-primary/5"
            onClick={() => onSelectType('in-clinic')}
          >
            <Building2 className="text-primary" style={{width: '28px', height: '28px'}}  />
            <div className="text-left">
              <div className="font-semibold text-lg">In-Clinic Visit</div>
              <div className="text-sm text-muted-foreground">Visit the doctor at their clinic</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-8 flex items-center justify-start gap-6 hover:bg-primary/5"
            onClick={() => onSelectType('video')}
          >
            <Video className="text-primary" style={{width: '30px', height: '30px'}} />
            <div className="text-left">
              <div className="font-semibold text-lg">Video Consultation</div>
              <div className="text-sm text-muted-foreground">Meet with the doctor online</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 