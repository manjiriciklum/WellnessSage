import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@/types/doctor';
import { Search, MapPin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, X, Navigation } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

type SortField = 'name' | 'rating' | 'specialty';
type SortOrder = 'asc' | 'desc';

interface DoctorListingProps {
  specialty?: string;
  onShowOnMap?: (doctor: Doctor) => void;
}

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

export function DoctorListing({ specialty = 'all', onShowOnMap }: DoctorListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Filtering state
  const [practiceFilter, setPracticeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Dialog states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Add state for controlling calendar popup
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: apiDoctors, isLoading } = useQuery<any[]>({
    queryKey: ['/api/doctors'],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
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

  // Get unique locations for filter dropdown
  const locations = Array.from(new Set(doctors?.map(doctor => doctor.area) || []));

  // Filter doctors based on search term and filters
  const filteredDoctors = doctors?.filter(doctor => {
    // Specialty filter from props
    const matchesSpecialty = specialty === 'all' || 
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase());
    
    // Search term filter (searches name or specialty)
    const matchesSearch = searchTerm === '' ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filter
    const matchesLocation = practiceFilter === 'all' ||
      doctor.area.toLowerCase() === practiceFilter.toLowerCase();
    
    // Rating filter
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '4+' && doctor.rating >= 4) ||
      (ratingFilter === '3+' && doctor.rating >= 3);
    
    return matchesSpecialty && matchesSearch && matchesLocation && matchesRating;
  }) || [];

  // Sort the filtered doctors
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'rating') {
      return sortOrder === 'asc' 
        ? a.rating - b.rating 
        : b.rating - a.rating;
    } else if (sortField === 'specialty') {
      return sortOrder === 'asc' 
        ? a.specialty.localeCompare(b.specialty) 
        : b.specialty.localeCompare(a.specialty);
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedDoctors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = sortedDoctors.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages || 1);

  // Toggle sort order or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Format location for display
  const formatLocation = (doctor: Doctor) => {
    const parts = [doctor.area, doctor.city, doctor.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // Handle booking appointment
  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingDialogOpen(true);
  };

  // Handle view profile
  const handleViewProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsProfileDialogOpen(true);
  };

  // Handle appointment submission
  const { toast } = useToast();

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

  // Add these helper functions
  const getAvailableTimeSlots = (doctor: Doctor, date: Date): string[] => {
    // TODO: Replace with actual availability check from doctor's schedule
    // For now, return some sample slots
    return [
      '09:00 AM',
      '10:30 AM',
      '02:00 PM',
      '03:30 PM',
      '04:00 PM'
    ];
  };

  const getDoctorLocations = (doctor: Doctor) => {
    // TODO: Replace with actual locations from doctor's data
    return [
      { id: 'main', name: `${doctor.name}'s Main Clinic - ${formatLocation(doctor)}` },
      { id: 'satellite', name: `${doctor.name}'s Satellite Clinic - ${doctor.area}` }
    ];
  };

  // Update the date selection handler
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(''); // Reset time slot when date changes
    setShowTimeSlots(true);
    setIsCalendarOpen(false); // Close the calendar popup
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm mb-6">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filter controls */}
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium">Filters</div>
              <div className="flex flex-wrap gap-3">
                <div className="w-full sm:w-auto">
                  <Input 
                    placeholder="Search by name or specialty"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>
                
                <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Sort controls */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className={sortField === 'name' ? 'border-primary' : ''}
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className={sortField === 'rating' ? 'border-primary' : ''}
                onClick={() => handleSort('rating')}
              >
                Rating {sortField === 'rating' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className={sortField === 'specialty' ? 'border-primary' : ''}
                onClick={() => handleSort('specialty')}
              >
                Specialty {sortField === 'specialty' && (
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                )}
              </Button>
              
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="15">15 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
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
                              reviewCount={doctor.reviews.length}
                            />
                          </div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-300 mt-1">
                            Experience: {doctor.experience} years • Fee: ₹{doctor.consultationFee}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs md:text-sm"
                            onClick={() => onShowOnMap?.(doctor)}
                          >
                            <Navigation size={16} className="mr-1" />
                            Show on Map
                          </Button>
                          <Link href={`/doctor/${doctor.id}`}>
                            <Button size="sm" className="text-xs md:text-sm">
                              View Profile
                            </Button>
                          </Link>
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

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment with Dr. {selectedDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Date Selection */}
            <div className="grid gap-2">
              <Label>Select Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Disable past dates
                      return isBefore(date, startOfDay(new Date()));
                    }}
                    modifiers={{
                      available: (date) => {
                        // TODO: Replace with actual availability check
                        // For now, just enable dates from tomorrow
                        return !isBefore(date, startOfDay(addDays(new Date(), 1)));
                      }
                    }}
                    modifiersStyles={{
                      available: {
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        textDecoration: 'underline'
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots - Only show after date selection */}
            {showTimeSlots && selectedDate && (
              <div className="grid gap-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDoctor && getAvailableTimeSlots(selectedDoctor, selectedDate).map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTimeSlot === slot ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div className="grid gap-2">
              <Label htmlFor="location">Select Location</Label>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDoctor && getDoctorLocations(selectedDoctor).map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason/Symptoms Selection */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Select 
                value={selectedReason} 
                onValueChange={setSelectedReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for visit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Checkup</SelectItem>
                  <SelectItem value="followup">Follow-up Visit</SelectItem>
                  <SelectItem value="consultation">New Consultation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAppointmentSubmit}
              disabled={!selectedDate || !selectedTimeSlot || !selectedLocation || !selectedReason}
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Doctor Profile</DialogTitle>
            <DialogDescription>
              Detailed information about Dr. {selectedDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="grid gap-6 py-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedDoctor.imageUrl || ''} alt={selectedDoctor.name} />
                  <AvatarFallback>{selectedDoctor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-sm text-neutral-500">{selectedDoctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <StarRating value={selectedDoctor.rating} showValue={true} reviewCount={selectedDoctor.reviews.length} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-sm text-neutral-600">{selectedDoctor.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-sm text-neutral-600">{selectedDoctor.experience} years of experience</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Education</h4>
                  <ul className="list-disc list-inside text-sm text-neutral-600">
                    {selectedDoctor.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((lang, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-100 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-sm text-neutral-600">
                    {formatLocation(selectedDoctor)}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Consultation Fee</h4>
                  <p className="text-sm text-neutral-600">₹{selectedDoctor.consultationFee}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsProfileDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
