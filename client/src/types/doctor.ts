export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  area: string;
  city: string;
  state: string;
  country: string;
  rating: number;
  experience: number;
  languages: string[];
  education: string[];
  available: boolean;
  consultationFee: number;
  imageUrl: string;
  gender: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  reviews: any[];
  availability: {
    [key: string]: {
      morning: boolean;
      afternoon: boolean;
      evening: boolean;
    };
  };
  vector_text: string;
  symptoms: string[];
  createdAt: Date;
} 