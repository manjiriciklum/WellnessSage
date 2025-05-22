import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@/types/doctor';
import { Search, MapPin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
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
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { DoctorProfileDialog } from '@/components/doctor/doctor-profile-dialog';
import { BookingDialog } from '@/components/appointments/booking-dialog';

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

export function FindDoctor() {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { data: apiDoctors, isLoading } = useQuery<any[]>({
    queryKey: ['/api/doctors'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately
    cacheTime: 0, // Don't cache the data
    retry: 1,
    onSuccess: (data) => {
      console.log('Fetched doctors data:', data);
    },
    onError: (error) => {
      console.error('Error fetching doctors:', error);
    }
  });

  // Transform the API data
  const doctors = apiDoctors?.map(transformDoctorData);

  const specialties = ['Primary Care', 'Cardiology', 'Mental Health', 'Dermatology', 'Nutrition'];
  const [activeSpecialty, setActiveSpecialty] = useState('All');

  const handleSpecialtyClick = (specialty: string) => {
    setActiveSpecialty(specialty);
    setCurrentPage(1); // Reset to first page when changing specialty
  };

  // Filter doctors based on search term and active specialty
  const filteredDoctors = doctors?.filter(doctor => {
    const fullName = doctor.name.toLowerCase();
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = activeSpecialty === 'All' || doctor.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

  console.log(currentDoctors)

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages || 1);

  // Format location for display
  const formatLocation = (doctor: Doctor) => {
    const parts = [doctor.area, doctor.city, doctor.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // Add new state for appointment booking
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { toast } = useToast();

  // Add appointment booking handlers
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingDialogOpen(true);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsProfileDialogOpen(true);
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !selectedLocation || !selectedReason) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: selectedDate.toISOString(),
          timeSlot: selectedTimeSlot,
          location: selectedLocation,
          reason: selectedReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const result = await response.json();
      
      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${selectedDoctor.name} has been scheduled for ${format(selectedDate, "PPP")} at ${selectedTimeSlot}`,
      });

      // Close dialog and reset form
      setIsBookingDialogOpen(false);
      setSelectedDate(new Date());
      setSelectedTimeSlot('');
      setSelectedLocation('');
      setSelectedReason('');
      setShowTimeSlots(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add helper functions
  const getAvailableTimeSlots = (doctor: Doctor, date: Date): string[] => {
    // TODO: Replace with actual availability check from doctor's schedule
    return [
      '09:00 AM',
      '10:30 AM',
      '02:00 PM',
      '03:30 PM',
      '04:00 PM'
    ];
  };

  const getDoctorLocations = (doctor: Doctor) => {
    return [
      { id: 'main', name: `${doctor.name}'s Main Clinic - ${formatLocation(doctor)}` },
      { id: 'satellite', name: `${doctor.name}'s Satellite Clinic - ${doctor.area}` }
    ];
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(''); // Reset time slot when date changes
    setShowTimeSlots(true);
    setIsCalendarOpen(false); // Close the calendar popup
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
                placeholder="Search by doctor name..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
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
          
          <div className="flex flex-wrap gap-2 mb-6">
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
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No doctors found matching your search criteria.
            </div>
          ) : (
            <>
              {currentDoctors.map((doctor) => (
                <Card key={doctor.id} className="p-4">
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
                            Experience: {doctor.experience} years • Fee: ₹{doctor.consultationFee}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button 
                            size="sm" 
                            className="text-xs md:text-sm"
                            onClick={() => handleBookAppointment(doctor)}
                          >
                            Book Appointment
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs md:text-sm"
                            onClick={() => handleViewProfile(doctor)}
                          >
                            <Eye size={16} className="mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Pagination controls */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDoctors.length)} of {filteredDoctors.length} doctors
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToFirstPage} 
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToPreviousPage} 
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  <div className="flex items-center px-4">
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToNextPage} 
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToLastPage} 
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronsRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add the dialogs */}
      <DoctorProfileDialog
        doctor={selectedDoctor}
        isOpen={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setSelectedDoctor(null);
        }}
      />

      <BookingDialog
        doctor={selectedDoctor}
        isOpen={isBookingDialogOpen}
        onClose={() => {
          setIsBookingDialogOpen(false);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
}
