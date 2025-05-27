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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { DoctorProfileDialog } from '@/components/doctor/doctor-profile-dialog';
import { BookingDialog } from '@/components/appointments/booking-dialog';
import { AppointmentTypeDialog } from '@/components/appointments/appointment-type-dialog';

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
  const [location, setLocation] = useState('');
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

  // Format location for display
  const formatLocation = (doctor: Doctor): string => {
    const parts = [doctor.area, doctor.city, doctor.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // Filter doctors based on search term, location, and active specialty
  const filteredDoctors = doctors?.filter((doctor: Doctor) => {
    const fullName = doctor.name.toLowerCase();
    const doctorLocation = formatLocation(doctor).toLowerCase();
    const searchLocation = location.toLowerCase();
    
    // Search by name
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase());
    
    // Search by location
    const matchesLocation = searchLocation === '' || 
      doctorLocation.includes(searchLocation);
    
    // Filter by specialty
    const matchesSpecialty = activeSpecialty === 'All' || 
      doctor.specialty === activeSpecialty;
    
    return matchesSearch && matchesLocation && matchesSpecialty;
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
  const [isAppointmentTypeDialogOpen, setIsAppointmentTypeDialogOpen] = useState(false);
  const [appointmentType, setAppointmentType] = useState<'in-clinic' | 'video' | null>(null);

  const { toast } = useToast();

  // Add appointment booking handlers
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsAppointmentTypeDialogOpen(true);
  };

  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsProfileDialogOpen(true);
  };

  const handleAppointmentTypeSelect = (type: 'in-clinic' | 'video') => {
    setAppointmentType(type);
    setIsAppointmentTypeDialogOpen(false);
    setIsBookingDialogOpen(true);
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !selectedReason) return;

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
          location: selectedLocation || "",
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
        <h2 className="text-lg font-headings font-semibold text-neutral-800 dark:text-white">Consult your PCP</h2>
        {/* <Link href="/find-doctor">
          <Button variant="link" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors p-0">View All</Button> 
        </Link> */}
      </div>
      
      <Card className="shadow-sm">
        <CardContent className="p-5">
              {currentDoctors.length > 0 && (
                <Card className="p-4">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={currentDoctors[0].imageUrl || ''} alt={currentDoctors[0].name} />
                      <AvatarFallback>{currentDoctors[0].name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-base font-medium text-neutral-800 dark:text-white">
                            {currentDoctors[0].name}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-300">
                            {currentDoctors[0].specialty} • {formatLocation(currentDoctors[0])}
                          </p>
                          <div className="flex items-center mt-1">
                            <StarRating 
                              value={currentDoctors[0].rating} 
                              showValue={true}
                              reviewCount={currentDoctors[0].reviews?.length || 0}
                            />
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-1">
                            Experience: {currentDoctors[0].experience} years • Fee: ${currentDoctors[0].consultationFee}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button 
                            size="sm" 
                            className="text-xs md:text-sm"
                            onClick={() => handleBookAppointment(currentDoctors[0])}
                          >
                            Book Appointment
                          </Button>
                          <TooltipProvider delayDuration={300} skipDelayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs md:text-sm"
                                  onClick={() => handleViewProfile(currentDoctors[0])}
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

      <AppointmentTypeDialog
        doctor={selectedDoctor}
        isOpen={isAppointmentTypeDialogOpen}
        onClose={() => {
          setIsAppointmentTypeDialogOpen(false);
          setSelectedDoctor(null);
        }}
        onSelectType={handleAppointmentTypeSelect}
      />

      <BookingDialog
        doctor={selectedDoctor}
        isOpen={isBookingDialogOpen}
        onClose={() => {
          setIsBookingDialogOpen(false);
          setSelectedDoctor(null);
          setAppointmentType(null);
        }}
        appointmentType={appointmentType}
      />
    </div>
  );
}
