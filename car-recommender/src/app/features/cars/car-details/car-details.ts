import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { CarModel } from '../../../models/interfaces';
import { CarBookingService } from '../../../services/car-booking';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

interface BookingForm {
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  addOns: {
    insurance: boolean;
    gps: boolean;
    childSeat: boolean;
    additionalDriver: boolean;
  }
}

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-details.html',
  styleUrls: ['./car-details.css'],
})
export class CarDetailsComponent implements OnInit, OnDestroy {
  car: CarModel | null = null;
  loading = true;
  errorMessage = '';
  selectedImageIndex = 0;
  activeTab: 'overview' | 'specs' | 'reviews' = 'overview';

  private destroy$ = new Subject<void>();

  bookingForm: BookingForm = {
    pickupDate: '',
    returnDate: '',
    pickupLocation: '',
    returnLocation: '',
    addOns: {
      insurance: false,
      gps: false,
      childSeat: false,
      additionalDriver: false,
    }
  };

  addOnPrices = {
    insurance: 15,
    gps: 5,
    childSeat: 7,
    additionalDriver: 10
  };

  reviews: Review[] = [];
  averageRating = 0;
  totalReviews = 0;

  relatedCars: CarModel[] = [];

  constructor(private route: ActivatedRoute, private carService: CarBookingService, private router: Router) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      this.loadCar(id);
    });

    const today = new Date();
    this.bookingForm.pickupDate = this.formatDate(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3);
    this.bookingForm.returnDate = this.formatDate(tomorrow);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCar(id: string): void {
    this.loading = true;

    this.carService.getCar(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.car = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load car details.';
        this.loading = false;
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  previousImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  nextImage(): void {
    if (this.car && this.selectedImageIndex < this.car.images.length - 1) {
      this.selectedImageIndex++;
    }
  }

  setActiveTab(tab: 'overview' | 'specs' | 'reviews'): void {
    this.activeTab = tab;
  }

  calculateRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
    this.totalReviews = this.reviews.length;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getRatingDistribution(stars: number): number {
    const count = this.reviews.filter(r => Math.floor(r.rating) === stars).length;
    return this.reviews.length > 0 ? (count / this.reviews.length) * 100 : 0;
  }

  calculateTotalDays(): number {
    if (!this.bookingForm.pickupDate || !this.bookingForm.returnDate) return 0;
    const pickup = new Date(this.bookingForm.pickupDate);
    const returnDate = new Date(this.bookingForm.returnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateAddOnsTotal(): number {
    let total = 0;
    const days = this.calculateTotalDays();

    if (this.bookingForm.addOns.insurance) total += this.addOnPrices.insurance * days;
    if (this.bookingForm.addOns.gps) total += this.addOnPrices.gps * days;
    if (this.bookingForm.addOns.childSeat) total += this.addOnPrices.childSeat * days;
    if (this.bookingForm.addOns.additionalDriver) total += this.addOnPrices.additionalDriver * days;
    return total;
  }

  calculateTotalPrice(): number {
    if (!this.car) return 0;
    const days = this.calculateTotalDays();
    const carTotal = this.car.pricePerDay * days;
    const addOnsTotal = this.calculateAddOnsTotal();
    return carTotal + addOnsTotal;
  }

  onBookNow(): void {
    if (!this.car) return;

    if (!this.bookingForm.pickupDate || !this.bookingForm.returnDate) {
      alert('Please select pickup and return dates.');
      return;
    }

    if (!this.bookingForm.pickupLocation) {
      alert('Please select a pickup location.');
      return;
    }

    this.router.navigate(['/booking/summary'], {
      queryParams: {
        ...this.bookingForm.addOns,
        pickupDate: this.bookingForm.pickupDate,
        returnDate: this.bookingForm.returnDate,
        pickupLocation: this.bookingForm.pickupLocation,
        returnLocation: this.bookingForm.returnLocation
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  viewRelatedCar(carId: string): void {
    this.router.navigate(['/cars', carId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getMockCar(id: string): CarModel {
    return {
      id: id,
      make: 'Toyota',
      model: 'Camry',
      year: 2021,
      type: 'sedan',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      mileage: 15000,
      pricePerDay: 55,
      features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Push Button Start', 'Wireless Charging'],
      location: 'New York',
      availability: true,
      images: [
        'assets/images/cars/toyota-camry-1.jpg',
        'assets/images/cars/toyota-camry-2.jpg',
      ],
      rating: 4.5,
      numberOfRatings: 120,
    };
  }

  getMockReviews(): Review[] {
    return [
      {
        id: '1',
        userName: 'Jnr SA',
        userAvatar: 'https://i.pravatar.cc/150?img-12',
        rating: 5,
        comment: 'Great car, very comfortable and smooth ride.',
        date: new Date('2023-08-15'),
        verified: true
      },
      {
        id: '2',
        userName: 'Emily R.',
        userAvatar: 'https://i.pravatar.cc/150?img-5',
        rating: 4,
        comment: 'Good value for the price, but the GPS was a bit outdated.',
        date: new Date('2023-08-10'),
        verified: true
      },
      {
        id: '3',
        userName: 'Michael T.',
        userAvatar: 'https://i.pravatar.cc/150?img-8',
        rating: 5,
        comment: 'Excellent condition and very clean. Highly recommend!',
        date: new Date('2023-07-22'),
        verified: false
      },
      {
        id: '4',
        userName: 'Sarah L.',
        userAvatar: 'https://i.pravatar.cc/150?img-3',
        rating: 4,
        comment: 'Overall a good experience, but the car was a bit noisy on highways.',
        date: new Date('2023-06-30'),
        verified: true
      }
    ];
  }

  getMockRelatedCars(): CarModel[] {
    return [
      {
        id: '2',
        make: 'Honda',
        model: 'Accord',
        year: 2020,
        type: 'sedan',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 20000,
        pricePerDay: 50,
        features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
        location: 'New York',
        availability: true,
        images: [
          'assets/images/cars/honda-accord-1.jpg',
        ],
        rating: 4.3,
        numberOfRatings: 95,
      },
      {
        id: '3',
        make: 'Ford',
        model: 'Escape',
        year: 2021,
        type: 'suv',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: 5,
        mileage: 12000,
        pricePerDay: 65,
        features: ['Bluetooth', 'All-Wheel Drive', 'Backup Camera'],
        location: 'New York',
        availability: true,
        images: [
          'assets/images/cars/ford-escape-1.jpg',
        ],
        rating: 4.6,
        numberOfRatings: 80,
      }
    ];
  }
}
