import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Award, Languages } from 'lucide-react';
import { type Doctor } from '@/types/doctor';

interface DoctorInfoCardProps {
  doctor: Doctor;
  onShowOnMap: (doctor: Doctor) => void;
  isSelected?: boolean;
}

export function DoctorInfoCard({ doctor, onShowOnMap, isSelected }: DoctorInfoCardProps) {
  return (
    <Card className={`transition-all duration-300 ${isSelected ? 'border-blue-500 shadow-lg' : ''}`}>
      <CardContent className="p-2">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3 className="font-semibold text-base text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-blue-600">{doctor.specialty}</p>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-1">
              <StarRating rating={doctor.rating} />
              <span className="text-sm text-gray-600">({doctor.rating.toFixed(1)})</span>
            </div>

            <div className="mt-1 space-y-1 text-sm text-gray-600">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{doctor.area}, {doctor.city}</span>
              </p>              
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 