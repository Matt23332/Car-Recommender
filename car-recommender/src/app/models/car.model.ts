export interface CarModel {
    id: string;
    make: string;
    model: string;
    year: number;
    type: 'sedan' | 'suv' | 'truck' | 'coupe' | 'hatchback' | 'van' | 'wagon' | 'other';
    transmission: 'automatic' | 'manual' | 'semi-automatic';
    fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'other';
    seats: number;
    mileage: number;
    pricePerDay: number;
    features: string[];
    location: string;
    availability: boolean;
    images: string[];
    rating: number;
    numberOfRatings: number;
}

export interface FilterCriteria {
    searchQuery: string;
    type: string;
    transmission: string;
    fuelType: string;
    minPrice: number;
    maxPrice: number;
    seats: string;
    location: string;
    sortBy: string;
}
