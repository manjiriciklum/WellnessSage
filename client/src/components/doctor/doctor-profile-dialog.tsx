import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@/types/doctor';

interface DoctorProfileDialogProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorProfileDialog({ doctor, isOpen, onClose }: DoctorProfileDialogProps) {
  if (!doctor) return null;

  // Format location for display
  const formatLocation = (doctor: Doctor) => {
    const parts = [doctor.area, doctor.city, doctor.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Doctor Profile</DialogTitle>
          <DialogDescription>
            Detailed information about Dr. {doctor.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-2">
          <div className="flex items-start gap-2">
            <Avatar className="w-20 h-20">
                <AvatarImage src={doctor.imageUrl || ''} alt={doctor.name} />
              <AvatarFallback>{doctor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
              <h3 className="text-lg font-semibold">{doctor.name}</h3>
              <p className="text-sm text-neutral-500">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <StarRating 
                    value={doctor.rating} 
                    showValue={true}
                    reviewCount={doctor.reviews?.length || 0}
                  />
                </div>
              </div>
            </div>

          <div className="grid gap-4">
              <div>
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-neutral-600">{doctor.description}</p>
              </div>

              <div>
              <h4 className="font-medium mb-2">Experience</h4>
              <p className="text-sm text-neutral-600">{doctor.experience} years of experience</p>
              </div>

              <div>
              <h4 className="font-medium mb-2">Education</h4>
              <ul className="list-disc list-inside text-sm text-neutral-600">
                {doctor.education.map((edu, index) => (
                  <li key={index}>{edu}</li>
                ))}
              </ul>
              </div>

              <div>
              <h4 className="font-medium mb-2">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang, index) => (
                  <span key={index} className="px-2 py-1 bg-neutral-100 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Location</h4>
              <p className="text-sm text-neutral-600">
                {formatLocation(doctor)}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Consultation Fee</h4>
              <p className="text-sm text-neutral-600">${doctor.consultationFee}</p>
            </div>

            {doctor.reviews && doctor.reviews.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Reviews</h4>
                <div className="space-y-3">
                  {doctor.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{review.patientName}</span>
                        <StarRating value={review.rating} showValue={false} />
                      </div>
                      <p className="text-sm text-neutral-600">{review.comment}</p>
                      <p className="text-xs text-neutral-500 mt-1">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 