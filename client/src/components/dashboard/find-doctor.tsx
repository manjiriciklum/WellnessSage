import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@shared/schema';
import { Search, MapPin, Eye } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';

export function FindDoctor() {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const specialties = ['Primary Care', 'Cardiology', 'Mental Health', 'Dermatology', 'Nutrition'];
  const [activeSpecialty, setActiveSpecialty] = useState('All');

  const handleSpecialtyClick = (specialty: string) => {
    setActiveSpecialty(specialty);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">Find a Doctor</h2>
        <Link href="/find-doctor">
          <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors p-0">View All</Button>
        </Link>
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-wrap mb-4 gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                placeholder="Search by specialty, name..." 
                className="pl-10"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <div className="relative flex-1 min-w-[180px]">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                value={location} 
                className="pl-10"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button>
              Search
            </Button>
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 mb-4">
            <Button 
              variant={activeSpecialty === 'All' ? 'default' : 'outline'} 
              className="rounded-full text-xs h-8"
              onClick={() => handleSpecialtyClick('All')}
            >
              All
            </Button>
            {specialties.map((specialty) => (
              <Button 
                key={specialty} 
                variant={activeSpecialty === specialty ? 'default' : 'outline'} 
                className="rounded-full text-xs h-8 whitespace-nowrap"
                onClick={() => handleSpecialtyClick(specialty)}
              >
                {specialty}
              </Button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-neutral-100 dark:border-neutral-600 py-4 animate-pulse">
                  <div className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {doctors?.map((doctor) => (
                <div key={doctor.id} className="border-b border-neutral-100 dark:border-neutral-600 py-4 first:pt-0 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.profileImage || ''} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
                      <AvatarFallback>{doctor.firstName[0]}{doctor.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-md font-medium text-neutral-800 dark:text-white">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-300">
                        {doctor.specialty} • {doctor.practice}
                      </p>
                      <div className="flex items-center mt-1">
                        <StarRating 
                          value={doctor.rating || 0} 
                          showValue={true}
                          reviewCount={doctor.reviewCount || undefined}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button>
                        Book Appointment
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
