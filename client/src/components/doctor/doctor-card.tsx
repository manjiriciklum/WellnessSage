import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Navigation, Eye } from 'lucide-react';
import { type Doctor } from '@/types/doctor';
import { DoctorProfileDialog } from './doctor-profile-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
  onShowOnMap?: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onBookAppointment, onShowOnMap }: DoctorCardProps) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Format location for display
  const formatLocation = (doctor: Doctor) => {
    const parts = [doctor.area, doctor.city, doctor.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  const handleViewProfile = () => {
    setIsProfileDialogOpen(true);
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={doctor.imageUrl || ''} alt={doctor.name} />
            <AvatarFallback>{doctor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800 dark:text-white">
                  {doctor.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-300">
                  {doctor.specialty} • {formatLocation(doctor)}
                </p>
                <div className="flex items-center mt-1">
                  <StarRating 
                    value={doctor.rating} 
                    showValue={true}
                    reviewCount={doctor.reviews?.length || 0}
                  />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-1">
                  Experience: {doctor.experience} years • Fee: ${doctor.consultationFee}
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button 
                  size="sm" 
                  className="text-xs md:text-sm"
                  onClick={() => onBookAppointment(doctor)}
                >
                  Book Appointment
                </Button>
                {onShowOnMap && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-xs md:text-sm"
                          onClick={() => onShowOnMap(doctor)}
                        >
                          <Navigation size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show on Map</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs md:text-sm"
                        onClick={handleViewProfile}
                      >
                        <Eye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <DoctorProfileDialog
        doctor={doctor}
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      />
    </>
  );
} 