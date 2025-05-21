import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Search, MapPin, Calendar as CalendarIcon, Navigation } from 'lucide-react';
import { DoctorListing } from '@/components/doctor/doctor-listing';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@/types/doctor';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { DoctorMap } from '@/components/map/doctor-map';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { DoctorInfoCard } from '@/components/doctor/doctor-info-card';

// Helper function to format location
const formatLocation = (doctor: Doctor): string => {
  const parts = [
    doctor.area,
    doctor.city,
    doctor.state,
    doctor.country
  ].filter(Boolean);
  return parts.join(', ');
};

// Transform API doctor data to match our expected format
const transformDoctorData = (apiDoctor: any): Doctor => {
  return {
    id: apiDoctor.id || apiDoctor._id?.$oid || '',
    name: apiDoctor.name || '',
    specialty: apiDoctor.specialty || '',
    address: apiDoctor.address || '',
    area: apiDoctor.area || '',
    city: apiDoctor.city || '',
    state: apiDoctor.state || '',
    country: apiDoctor.country || '',
    rating: apiDoctor.rating || 0,
    experience: apiDoctor.experience || 0,
    languages: apiDoctor.languages || [],
    education: apiDoctor.education || [],
    available: apiDoctor.available || false,
    consultationFee: apiDoctor.consultationFee || 0,
    imageUrl: apiDoctor.imageUrl || '',
    gender: apiDoctor.gender || '',
    description: apiDoctor.description || '',
    location: apiDoctor.location || { lat: 0, lng: 0 },
    reviews: apiDoctor.reviews || [],
    availability: apiDoctor.availability || {},
    vector_text: apiDoctor.vector_text || '',
    symptoms: apiDoctor.symptoms || [],
    createdAt: apiDoctor.createdAt ? new Date(apiDoctor.createdAt) : new Date()
  };
};

export default function FindDoctorPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mapSelectedDoctor, setMapSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('all');
  const [mapRef, setMapRef] = useState<any>(null);
  
  // Fetch doctors data
  const { data: apiDoctors, isLoading } = useQuery<any[]>({
    queryKey: ['/api/doctors'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 1
  });

  // Transform the API data
  const doctors = apiDoctors?.map(transformDoctorData) || [];

  // Filter doctors based on search term and active specialty
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = doctor.name.toLowerCase();
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = activeSpecialty === 'all' || doctor.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorClick = (doctor: Doctor) => {
    setMapSelectedDoctor(doctor);
    if (mapRef && doctor.location?.lat && doctor.location?.lng) {
      // Stage 1: Start with an extremely wide view
      mapRef.flyTo({
        center: [doctor.location.lng, doctor.location.lat],
        zoom: 3, // Start with a continent-level view
        duration: 2000,
        essential: true,
        pitch: 0,
        bearing: 0,
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        curve: 1.5 // Accelerate the animation
      });

      // Stage 2: Zoom to country level with rotation
      setTimeout(() => {
        mapRef.flyTo({
          center: [doctor.location.lng, doctor.location.lat],
          zoom: 8,
          duration: 2000,
          essential: true,
          pitch: 30,
          bearing: 45, // Rotate 45 degrees
          curve: 1.5
        });

        // Stage 3: Zoom to city level with more rotation
        setTimeout(() => {
          mapRef.flyTo({
            center: [doctor.location.lng, doctor.location.lat],
            zoom: 15,
            duration: 2000,
            essential: true,
            pitch: 45,
            bearing: -45, // Rotate back
            curve: 1.5
          });

          // Stage 4: Final extreme close-up with dramatic effects
          setTimeout(() => {
            // First, rotate to create a spinning effect
            mapRef.flyTo({
              center: [doctor.location.lng, doctor.location.lat],
              zoom: 15, // Keep same zoom temporarily
              duration: 1000,
              essential: true,
              pitch: 60,
              bearing: 180, // Full rotation
              curve: 1.5
            });

            // Then zoom in with maximum effect
            setTimeout(() => {
              mapRef.flyTo({
                center: [doctor.location.lng, doctor.location.lat],
                zoom: 20,
                duration: 2000,
                essential: true,
                pitch: 75, // Extreme tilt
                bearing: 0, // Return to north
                curve: 1.5
              });
            }, 1000);
          }, 2000);
        }, 2000);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-headings font-bold mb-6">Find a Doctor</h1>
      
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Map Section */}
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            
            <h3 className="text-lg font-semibold mb-4">Doctor Locations</h3>
            <div className="relative w-full" style={{ height: '400px', position: 'relative' }} id="map-cont">
            {mapSelectedDoctor && (
              <div className="mb-4" style={{ height: '100px', width: '200px', position: 'absolute', left: '10px', top: '40px' }}>
                <DoctorInfoCard
                  doctor={mapSelectedDoctor}
                  onShowOnMap={handleDoctorClick}
                  isSelected={true}
                />
              </div>
            )}
              <DoctorMap 
                doctors={filteredDoctors} 
                selectedDoctor={mapSelectedDoctor}
                onDoctorSelect={handleDoctorClick}
                onMapReady={setMapRef}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of the content */}
      <Tabs defaultValue="all" value={activeSpecialty} onValueChange={setActiveSpecialty}>
        <div className="flex items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All Specialties</TabsTrigger>
            <TabsTrigger value="Primary Care">Primary Care</TabsTrigger>
            <TabsTrigger value="Cardiology">Cardiology</TabsTrigger>
            <TabsTrigger value="Mental Health">Mental Health</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all">
          <DoctorListing 
            specialty="all" 
            onShowOnMap={handleDoctorClick}
          />
        </TabsContent>
        
        <TabsContent value="Primary Care">
          <DoctorListing 
            specialty="Primary Care" 
            onShowOnMap={handleDoctorClick}
          />
        </TabsContent>
        
        <TabsContent value="Cardiology">
          <DoctorListing 
            specialty="Cardiology" 
            onShowOnMap={handleDoctorClick}
          />
        </TabsContent>
        
        <TabsContent value="Mental Health">
          <DoctorListing 
            specialty="Mental Health" 
            onShowOnMap={handleDoctorClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
