import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@shared/schema';
import { Search, Eye, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DoctorListingProps {
  specialty?: string;
}

type SortField = 'name' | 'rating' | 'specialty';
type SortOrder = 'asc' | 'desc';

export function DoctorListing({ specialty = 'all' }: DoctorListingProps) {
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [practiceFilter, setPracticeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Filter doctors by specialty first
  const specialtyFilteredDoctors = specialty === 'all' ? 
    doctors : 
    doctors?.filter(doctor => doctor.specialty.toLowerCase().includes(specialty.toLowerCase()));
  
  // Apply additional filters
  const filteredDoctors = specialtyFilteredDoctors?.filter(doctor => {
    // Search term filter (searches name or specialty)
    const matchesSearch = searchTerm === '' ||
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Practice filter
    const matchesPractice = practiceFilter === 'all' ||
      doctor.practice.toLowerCase() === practiceFilter.toLowerCase();
    
    // Rating filter
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '4+' && (doctor.rating || 0) >= 4) ||
      (ratingFilter === '3+' && (doctor.rating || 0) >= 3);
    
    return matchesSearch && matchesPractice && matchesRating;
  });
  
  // Sort the filtered doctors
  const sortedDoctors = [...(filteredDoctors || [])].sort((a, b) => {
    if (sortField === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortField === 'rating') {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    } else if (sortField === 'specialty') {
      return sortOrder === 'asc' 
        ? a.specialty.localeCompare(b.specialty) 
        : b.specialty.localeCompare(a.specialty);
    }
    return 0;
  });
  
  // Get unique practice locations for filter dropdown
  const practices = Array.from(new Set(doctors?.map(doctor => doctor.practice) || []));
  
  // Calculate pagination
  const totalPages = Math.ceil((sortedDoctors?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = sortedDoctors?.slice(indexOfFirstItem, indexOfLastItem) || [];
  
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

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Practice Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {practices.map((practice) => (
                      <SelectItem key={practice} value={practice}>{practice}</SelectItem>
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
        <CardContent className="p-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-neutral-100 dark:border-neutral-600 py-4 animate-pulse">
                  <div className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : currentDoctors.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No doctors found matching your criteria.
            </div>
          ) : (
            <>
              {currentDoctors.map((doctor) => (
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
              
              {/* Pagination controls */}
              {sortedDoctors.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedDoctors.length)} of {sortedDoctors.length} doctors
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
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
