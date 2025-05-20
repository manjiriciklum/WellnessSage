import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@/types/doctor';
import { Search, MapPin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortField = 'name' | 'rating' | 'specialty';
type SortOrder = 'asc' | 'desc';

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

export function DoctorListing() {
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
    
    return matchesSearch && matchesLocation && matchesRating;
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
                <div key={doctor.id} className="border-b border-neutral-100 dark:border-neutral-600 py-4 first:pt-0 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor.imageUrl || ''} alt={doctor.name} />
                      <AvatarFallback>{doctor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-md font-medium text-neutral-800 dark:text-white">
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
                          <Button size="sm" className="text-xs md:text-sm">
                            Book Appointment
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs md:text-sm">
                            <Eye size={16} className="mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
    </div>
  );
}
