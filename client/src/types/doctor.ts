export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  rating: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    patientName: string;
    date: string;
  }>;
  experience: number;
  education: string[];
  languages: string[];
  consultationFee: number;
  description: string;
  area: string;
  city: string;
  state: string;
  locations: Location[];
  availability: {
    days: string[];
    timeSlots: string[];
  };
} 