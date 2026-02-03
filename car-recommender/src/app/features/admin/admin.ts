import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Stats {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  carsChange: number;
  bookingsChange: number;
  usersChange: number;
  revenueChange: number;
}

interface Booking {
  id: string;
  user: { name: string; avatar: string; email: string; };
  car: { make: string; model: string; image: string; };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
}

interface Car {
  id: string;
  make: string;
  model: string;
  type: string;
  year: number;
  pricePerDay: number;
  availability: boolean;
  image: string;
  rating: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'User';
  avatar: string;
  joinedDate: string;
  totalBookings: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminDasboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeMenu = 'dashboard';
  isSidebarOpen = true;
  isMobileSidebarOpen = false;

  stats: Stats = {
    totalCars: 0, totalBookings: 0, totalUsers: 0, totalRevenue: 0,
    carsChange: 0, bookingsChange: 0, usersChange: 0, revenueChange: 0
  };

  recentBookings: Booking[] = [];
  cars: Car[] = [];
  users: User[] = [];

  monthlyRevenue: MonthlyRevenue[] = [];
  bookingsByType: { type: string; count: number; color: string }[] = [];

  bookingFilter = 'all';
  carSearch = '';
  userSearch = '';

  showModal = false;
  modalType: 'addCar' | 'editCar' | 'viewBooking' | '' = '';
  selectedCar: Car | null = null;
  selectedBooking: Booking | null = null;

  newCar = {
    make: '', model: '', year: 2024, type: 'sedan', pricePerDay: 0, image: ''
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.stats = this.getMockStats();
    this.recentBookings = this.getMockBookings();
    this.cars = this.getMockCars();
    this.users = this.getMockUsers();
    this.monthlyRevenue = this.getMockMonthlyRevenue();
    this.bookingsByType = this.getMockBookingsByType();
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    if (window.innerWidth < 1024) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  get filteredBookings(): Booking[] {
    if (this.bookingFilter === 'all') return this.recentBookings;
    return this.recentBookings.filter(booking => booking.status === this.bookingFilter);
  }

  updateBookingStatus(booking: Booking, status: string): void {
    booking.status = status as any;
    this.showModal = false;
  }

  get filteredCars(): Car[] {
    if (!this.carSearch) return this.cars;
    const query = this.carSearch.toLowerCase();
    return this.cars.filter(car => car.make.toLowerCase().includes(query) || car.model.toLowerCase().includes(query));
  }

  openAddCarModal(): void {
    this.modalType = 'addCar';
    this.newCar = { make: '', model: '', year: 2024, type: 'sedan', pricePerDay: 0, image: '' };
    this.showModal = true;
  }

  openEditCarModal(car: Car): void {
    this.selectedCar = { ...car };
    this.editCarForm = {
      make: car.make,
      model: car.model,
      year: car.year,
      type: car.type,
      pricePerDay: car.pricePerDay,
      image: car.image
    };
    this.modalType = 'editCar';
    this.showModal = true;
  }

  saveCar(): void {
    if (this.modalType === 'addCar') {
      const newCar: Car = {
        id: (this.cars.length + 1).toString(),...this.newCar, availability: true, rating: 0
      };
      this.cars.push(newCar);
      alert('New car added successfully.');
    } else {
      if (this.selectedCar) {
        const index = this.cars.findIndex(car => car.id === this.selectedCar!.id);
        if (index !== -1) {
          this.cars[index] = {
            ...this.cars[index],
            ...this.editCarForm
          };
        }
      }
      alert('Car details updated successfully.');
    }
    this.showModal = false;
  }
   
  deleteCar(carId: string): void {
    if (confirm('Are you sure you want to delete this car?')) {
      this.cars = this.cars.filter(car => car.id !== carId);
      alert('Car deleted successfully.');
    }
  }

  editCarForm = {
    make: '', 
    model: '', 
    year: 2026, 
    type: 'sedan', 
    pricePerDay: 0, 
    image: ''
  };

  toggleCarAvailability(car: Car): void {
    car.availability = !car.availability;
  }

  get filteredUsers(): User[] {
    if (!this.userSearch) return this.users;
    const query = this.userSearch.toLowerCase();
    return this.users.filter(user => user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
  }

  openViewBookingModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.modalType = 'viewBooking';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalType = '';
  }

  getMaxRevenue(): number {
    return Math.max(...this.monthlyRevenue.map(mr => mr.revenue));
  }

  getBarWidth(revenue: number): number {
    return (revenue / this.getMaxRevenue()) * 100;
  }

  getTotalBookingsByType(): number {
    return this.bookingsByType.reduce((sum, item) => sum + item.count, 0);
  }

  getMockStats(): Stats {
    return {
      totalCars: 50, totalBookings: 250, totalUsers: 15, totalRevenue: 10000,
      carsChange: 10, bookingsChange: 8, usersChange: 13, revenueChange: 23
    };
  }

  getMockBookings(): Booking[] {
    return [
      {
        id: 'B001',
        user: { name: 'Howard Stein', avatar: 'https://i.pravatar.cc/150?img=1', email: 'howardstein@gmail.com' },
        car: { make: 'Toyota', model: 'Camry', image: 'assets/cars/car1.jpg' },
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        totalPrice: 200,
        status: 'Confirmed'
      },
      {
        id: 'B002',
        user: { name: 'Emma Johnson', avatar: 'https://i.pravatar.cc/150?img=2', email: 'emma.johnson@gmail.com' },
        car: { make: 'Honda', model: 'Civic', image: 'assets/cars/car2.jpg' },
        startDate: '2024-08-10',
        endDate: '2024-08-15',
        totalPrice: 300,
        status: 'Pending'
      },
      {
        id: 'B003',
        user: { name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=3', email: 'michael.brown@gmail.com' },
        car: { make: 'Ford', model: 'Mustang', image: 'assets/cars/car3.jpg' },
        startDate: '2024-07-20',
        endDate: '2024-07-25',
        totalPrice: 500,
        status: 'Completed'
      },
      {
        id: 'B004',
        user: { name: 'Sophia Davis', avatar: 'https://i.pravatar.cc/150?img=4', email: 'sophiadavis@gmail.com' },
        car: { make: 'Chevrolet', model: 'Malibu', image: 'assets/cars/car4.jpg' },
        startDate: '2024-08-05',
        endDate: '2024-08-10',
        totalPrice: 250,
        status: 'Cancelled'
      },
      {
        id: 'B005',
        user: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=5', email: 'jamesw@gmail.com' },
        car: { make: 'Nissan', model: 'Altima', image: 'assets/cars/car5.jpg' },
        startDate: '2024-08-12',
        endDate: '2024-08-18',
        totalPrice: 350,
        status: 'Confirmed'
      }
    ];
  }

  getMockCars(): Car[] {
    return [
      { id: 'C001', make: 'Toyota', model: 'Camry', type: 'Sedan', year: 2020, pricePerDay: 40, availability: true, image: 'assets/cars/car1.jpg', rating: 4.5 },
      { id: 'C002', make: 'Honda', model: 'Civic', type: 'Sedan', year: 2019, pricePerDay: 35, availability: true, image: 'assets/cars/car2.jpg', rating: 4.3 },
      { id: 'C003', make: 'Ford', model: 'Mustang', type: 'Sports', year: 2021, pricePerDay: 60, availability: false, image: 'assets/cars/car3.jpg', rating: 4.7 },
      { id: 'C004', make: 'Chevrolet', model: 'Malibu', type: 'Sedan', year: 2018, pricePerDay: 30, availability: true, image: 'assets/cars/car4.jpg', rating: 4.0 },
      { id: 'C005', make: 'Nissan', model: 'Altima', type: 'Sedan', year: 2020, pricePerDay: 38, availability: true, image: 'assets/cars/car5.jpg', rating: 4.4 }
    ];
  }

  getMockUsers(): User[] {
    return [
      { id: 'U001', fullName: 'Howard Stein', email: 'howardstein@gmail.com', phone: '123-456-7890', role: 'User', avatar: 'https://i.pravatar.cc/150?img=1', joinedDate: '2023-01-15', totalBookings: 5 },
      { id: 'U002', fullName: 'Emma Johnson', email: 'emma.johnson@gmail.com', phone: '234-567-8901', role: 'User', avatar: 'https://i.pravatar.cc/150?img=2', joinedDate: '2023-02-20', totalBookings: 3 },
      { id: 'U003', fullName: 'Michael Brown', email: 'michael.brown@gmail.com', phone: '345-678-9012', role: 'User', avatar: 'https://i.pravatar.cc/150?img=3', joinedDate: '2023-03-10', totalBookings: 7 },
      { id: 'U004', fullName: 'Sophia Davis', email: 'sophiadavis@gmail.com', phone: '456-789-0123', role: 'User', avatar: 'https://i.pravatar.cc/150?img=4', joinedDate: '2023-04-05', totalBookings: 4 },
      { id: 'U005', fullName: 'James Wilson', email: 'jamesw@gmail.com', phone: '567-890-1234', role: 'User', avatar: 'https://i.pravatar.cc/150?img=5', joinedDate: '2023-05-15', totalBookings: 6 }
    ];
  }

  getMockMonthlyRevenue(): MonthlyRevenue[] {
    return [
      { month: 'January', revenue: 800, bookings: 20 },
      { month: 'February', revenue: 950, bookings: 25 },
      { month: 'March', revenue: 1100, bookings: 30 },
      { month: 'April', revenue: 1200, bookings: 28 },
      { month: 'May', revenue: 1300, bookings: 35 },
      { month: 'June', revenue: 1250, bookings: 32 }
    ];
  }

  getMockBookingsByType(): { type: string; count: number; color: string }[] {
    return [
      { type: 'Sedan', count: 100, color: '#4CAF50' },
      { type: 'SUV', count: 80, color: '#2196F3' },
      { type: 'Truck', count: 40, color: '#FF9800' },
      { type: 'Convertible', count: 30, color: '#9C27B0' }
    ];
  }

  logout(): void {
    this.router.navigate(['auth/login']);
  }
}
