import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CarModel, FilterCriteria } from '../../../models/interfaces';
import { CarBookingService } from '../../../services/car-booking';
import { Navbar } from "../../../shared/navbar/navbar";

@Component({
  selector: 'app-car-listing',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './car-listing.html',
  styleUrls: ['./car-listing.css'],
})
export class CarListingComponent implements OnInit, OnDestroy {
  cars: CarModel[] = [];
  filteredCars: CarModel[] = [];
  loading = false;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  filters: FilterCriteria = {
    searchQuery: '',
    type: 'all',
    transmission: 'all',
    fuelType: 'all',
    minPrice: 0,
    maxPrice: 0,
    seats: 'all',
    location: '',
    sortBy: 'recommended'
  };

  carTypes = ['all', 'sedan', 'suv', 'truck', 'coupe', 'hatchback', 'van', 'wagon', 'other'];
  transmissions = ['all', 'automatic', 'manual', 'semi-automatic'];
  fuelTypes = ['all', 'petrol', 'diesel', 'electric', 'hybrid', 'other'];
  seatsOptions = ['all', '2', '4', '5', '7', '8+'];
  sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'priceLowToHigh', label: 'Price: Low to High' },
    { value: 'priceHighToLow', label: 'Price: High to Low' },
    { value: 'ratingHighToLow', label: 'Rating: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' }
  ];
  locations: string[] = [];

  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 0;

  constructor(private route: ActivatedRoute, private router: Router, private carService: CarBookingService) {}

  ngOnInit(): void {
    this.locations = this.carService.getLocations();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['location']) this.filters.location = params['location'];
      if (params['type']) this.filters.type = params['type'];
      this.loadCars();
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchQuery => {
      this.filters.searchQuery = searchQuery;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCars(): void {
    this.loading = true;

    //Mock data
    setTimeout(() => {
      this.cars = this.getMockCars();
      this.applyFilters();
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    let filtered = [...this.cars];

    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.type.toLowerCase().includes(query)
      );
    }

    if (this.filters.type && this.filters.type !== 'all') {
      filtered = filtered.filter(car => car.type === this.filters.type);
    }

    if (this.filters.transmission && this.filters.transmission !== 'all') {
      filtered = filtered.filter(car => car.transmission === this.filters.transmission);
    }

    if (this.filters.fuelType && this.filters.fuelType !== 'all') {
      filtered = filtered.filter(car => car.fuelType === this.filters.fuelType);
    }

    filtered = filtered.filter(car => 
      car.pricePerDay >= this.filters.minPrice &&
      car.pricePerDay <= this.filters.maxPrice
    );

    if (this.filters.seats && this.filters.seats !=='all') {
      filtered = filtered.filter(car => car.seats.toString() === this.filters.seats);
    }

    if (this.filters.location) {
      filtered = filtered.filter(car => car.location === this.filters.location);
    }

    filtered = this.sortCars(filtered, this.filters.sortBy);

    this.filteredCars = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortCars(cars: CarModel[], sortBy: string): CarModel[] {
    switch (sortBy) {
      case 'priceLowToHigh':
        return cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case 'priceHighToLow':
        return cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case 'ratingHighToLow':
        return cars.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return cars.sort((a, b) => b.year - a.year);
      case 'recommended':
      default:
        return cars;
    }
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      searchQuery: '',
      type: 'all',
      transmission: 'all',
      fuelType: 'all',
      minPrice: 0,
      maxPrice: 500,
      seats: 'all',
      location: '',
      sortBy: 'recommended'
    };
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  viewCarDetails(carId: string): void {
    this.router.navigate(['/cars', carId]);
  }

  bookCar(carId: string): void {
    this.router.navigate(['/booking', carId]);
  }

  get paginatedCars(): CarModel[] {
    const start = (this.currentPage -1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCars.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages -1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  //Mock data function
  getMockCars(): CarModel[] {
    return [
      {
        id: '1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        type: 'sedan',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 15000,
        pricePerDay: 50,
        features: ['Rear-wheel drive', 'Fuel efficient', 'Long range'],
        location: 'Karen',
        availability: true,
        images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop'],
        rating: 4.5,
        numberOfRatings: 120
      },
      {
        id: '2',
        make: 'Ford',
        model: 'Raptor',
        year: 2021,
        type: 'truck',
        transmission: 'manual',
        fuelType: 'diesel',
        seats: 5,
        mileage: 20000,
        pricePerDay: 80,
        features: ['4x4 Drive', 'Powerful engine', 'Spacious cabin'],
        location: 'Westlands',
        availability: true,
        images: ['https://images.unsplash.com/photo-1519648023493-d82b5f8d7b9a?w=800&h=500&fit=crop'],
        rating: 4.7,
        numberOfRatings: 85
      },
      {
        id: '3',
        make: 'Mercedes-Benz',
        model: 'GLE',
        year: 2022,
        type: 'suv',
        transmission: 'automatic',
        fuelType: 'hybrid',
        seats: 7,
        mileage: 10000,
        pricePerDay: 120,
        features: ['All-wheel drive', 'Luxury interior', 'Advanced safety features'],
        location: 'Kilimani',
        availability: true,
        images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop'],
        rating: 4.9,
        numberOfRatings: 60
      },
      {
        id: '4',
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        type: 'sedan',
        transmission: 'semi-automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 25000,
        pricePerDay: 45,
        features: ['Fuel efficient', 'Compact design', 'Easy to park'],
        location: 'Langata',
        availability: true,
        images: ['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=500&fit=crop'],
        rating: 4.3,
        numberOfRatings: 150
      },
      {
        id: '5',
        make: 'Toyota',
        model: 'Vitz',
        year: 2018,
        type: 'sedan',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 30000,
        pricePerDay: 40,
        features: ['Compact design', 'Fuel efficient', 'Easy to park'],
        location: 'Runda',
        availability: true,
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop'],
        rating: 4.2,
        numberOfRatings: 90
      },
      {
        id: '6',
        make: 'Jeep',
        model: 'Wrangler',
        year: 2021,
        type: 'suv',
        transmission: 'manual',
        fuelType: 'diesel',
        seats: 5,
        mileage: 12000,
        pricePerDay: 90,
        features: ['4x4 Drive', 'Off-road capability', 'Rugged design'],
        location: 'Gigiri',
        availability: true,
        images: ['https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=500&fit=crop'],
        rating: 4.6,
        numberOfRatings: 70
      },
      {
        id: '7',
        make: 'Volvo',
        model: 'XC90',
        year: 2022,
        type: 'suv',
        transmission: 'automatic',
        fuelType: 'hybrid',
        seats: 7,
        mileage: 8000,
        pricePerDay: 130,
        features: ['All-wheel drive', 'Luxury interior', 'Advanced safety features'],
        location: 'Lavington',
        availability: true,
        images: ['https://images.unsplash.com/photo-1511914265872-7c7f3d6f3e2f?w=800&h=500&fit=crop'],
        rating: 4.8,
        numberOfRatings: 50
      },
      {
        id: '8',
        make: 'Porsche',
        model: 'Cayenne S',
        year: 2021,
        type: 'suv',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 15000,
        pricePerDay: 150,
        features: ['High performance', 'Luxury interior', 'Sporty design'],
        location: 'Other',
        availability: true,
        images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop'],
        rating: 4.9,
        numberOfRatings: 40
      },
      {
        id: '9',
        make: 'Nissan',
        model: 'Note',
        year: 2019,
        type: 'hatchback',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 22000,
        pricePerDay: 55,
        features: ['Compact design', 'Fuel efficient', 'Spacious interior'],
        location: 'Karen',
        availability: true,
        images: ['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&h=500&fit=crop'],
        rating: 4.4,
        numberOfRatings: 85
      },
      {
        id: '10',
        make: 'Mazda',
        model: 'CX-5',
        year: 2020,
        type: 'suv',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 18000,
        pricePerDay: 75,
        features: ['All-wheel drive', 'Stylish design', 'Advanced safety features'],
        location: 'Westlands',
        availability: true,
        images: ['https://images.unsplash.com/photo-1519648023493-d82b5f8d7b9a?w=800&h=500&fit=crop'],
        rating: 4.5,
        numberOfRatings: 95
      }
    ]
  }
}