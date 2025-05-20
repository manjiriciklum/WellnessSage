import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { StarRating } from '@/components/ui/star-rating';
import { type Doctor } from '@shared/schema';
import { Search, MapPin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FindDoctor() {
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const specialties = ['Primary Care', 'Cardiology', 'Mental Health', 'Dermatology', 'Nutrition'];
  const [activeSpecialty, setActiveSpecialty] = useState('All');

  const handleSpecialtyClick = (specialty: string) => {
    setActiveSpecialty(specialty);
    setCurrentPage(1); // Reset to first page when changing specialty
  };

  // Filter doctors based on search term and active specialty
  const filteredDoctors = doctors?.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());
    const matchesSpecialty = activeSpecialty === 'All' || doctor.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredDoctors?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = filteredDoctors?.slice(indexOfFirstItem, indexOfLastItem) || [];

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(totalPages || 1);

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
          ) : filteredDoctors?.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              No doctors found matching your search criteria.
            </div>
          ) : (
            <>
              {currentDoctors.map((doctor) => (
                <div key={doctor.id} className="border-b border-neutral-100 dark:border-neutral-600 py-4 first:pt-0 last:border-0 last:pb-0">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={doctor?.profileImage || ''} alt={`Dr. ${doctor?.firstName} ${doctor?.lastName}`} />
                      {/* <AvatarFallback>{doctor?.firstName[0]}{doctor?.lastName[0]}</AvatarFallback> */}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
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
