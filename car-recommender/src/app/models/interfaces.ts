export interface UserModel {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    dateOfBirth: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

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

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phone: string;
}

export interface AuthResponse {
    user: UserModel;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    UserId: string;
    email: string;
    role: string;
    exp: number;
}

export interface Booking {
    id: string;
    user?: UserModel | string;
    car?: CarModel | string;
    startDate: string | Date;
    endDate: string | Date;
    pickupLocation: {
        address: string;
        city: string;
    };
    dropoffLocation: {
        address: string;
        city: string;
    };
    totalDays?: number;
    pricePerDay?: number;
    totalAmount?: number;
    addOns?: {
        insurance?: number;
        gps?: number;
        childSeat?: number;
        extraDriver?: number;
    };
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentIntent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    count?: number;
    pagination?: {
        next?: { page: number; limit: number };
        prev?: { page: number; limit: number };
    };
    error?: string;
    message?: string;
}