import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Search, MapPin, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Doctor } from '@shared/schema';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface DoctorListingProps {
  specialty?: string;
}

function DoctorListing({ specialty = 'all' }: DoctorListingProps) {
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });
  
  // Filter doctors by specialty if needed
  const filteredDoctors = specialty === 'all' ? 
    doctors : 
    doctors?.filter(doctor => doctor.specialty.toLowerCase().includes(specialty.toLowerCase()));

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
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
            {filteredDoctors?.map((doctor) => (
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
  );
}

export default function FindDoctorPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-headings font-bold mb-6">Find a Doctor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm md:col-span-2">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                <Input 
                  placeholder="Search by specialty, name..." 
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1 min-w-[180px]">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                <Input 
                  defaultValue="San Francisco, CA" 
                  className="pl-10"
                />
              </div>
              <Button>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={18} className="text-neutral-500" />
              <h3 className="font-medium">Schedule Appointment</h3>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mb-4"
            />
            <Button className="w-full">Check Availability</Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <div className="flex items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Specialties</TabsTrigger>
            <TabsTrigger value="primary">Primary Care</TabsTrigger>
            <TabsTrigger value="cardiology">Cardiology</TabsTrigger>
            <TabsTrigger value="mental">Mental Health</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <DoctorListing specialty="all" />
        </TabsContent>
        
        <TabsContent value="primary">
          <DoctorListing specialty="Primary Care" />
        </TabsContent>
        
        <TabsContent value="cardiology">
          <DoctorListing specialty="Cardiology" />
        </TabsContent>
        
        <TabsContent value="mental">
          <DoctorListing specialty="Mental Health" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
