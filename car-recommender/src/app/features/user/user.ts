import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService} from '../../services/auth.service';

interface Booking {
  id: string;
  car: {
    make: string;
    model: string;
    image: string;
    type: string;
  };
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'active';
  pickupLocation: string;
  returnLocation: string;
  bookingDate: Date;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  dateOfBirth: string;
  avatar?: string;
  memberSince: Date;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user.html',
  styleUrls: ['./user.css'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: 'profile' | 'bookings' | 'favorites' | 'history' = 'bookings';
  user: User | null = null;
  bookings: Booking[] = [];
  isMobileMenuOpen = false;

  bookingFilter: 'all' | 'upcoming' | 'completed' | 'cancelled' | 'active' = 'all';

  isEditingProfile = false;
  profileForm = {
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    dateOfBirth: ''
  };

  showPasswordModal = false;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCancelModal = false;
  selectedBooking: Booking | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Loading user data
  loadUserData(): void {
    this.user = this.getMockUser();
    this.profileForm = {
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone,
      licenseNumber: this.user.licenseNumber,
      dateOfBirth: this.user.dateOfBirth
    };
  }

  loadBookings(): void {
    this.bookings = this.getMockBookings();
  }

  // Set navigation
  setActiveTab(tab: 'bookings' | 'profile' | 'favorites' | 'history'): void {
    this.activeTab = tab;
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['auth/login']);
  }

  get filteredBookings(): Booking[] {
    if (this.bookingFilter === 'all') return this.bookings;
    return this.bookings.filter(b => b.status === this.bookingFilter);
  }

  getBookingsByStatus(status: 'upcoming' | 'completed' | 'cancelled' | 'active'): Booking[] {
    return this.bookings.filter(b => b.status === status);
  }

  openCancelModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.showCancelModal = true;
  }

  confirmCancelBooking(): void {
    if (this.selectedBooking) {
      this.selectedBooking.status = 'cancelled';
      alert('Booking has been cancelled.');
    }
    this.showCancelModal = false;
    this.selectedBooking = null;
  }

  viewBookingDetails(booking: Booking): void {
    this.router.navigate(['bookings', booking.id]);
  }

  downloadInvoice(bookingId: string): void {
    alert(`Downloading invoice for booking ID: ${bookingId}`);
  }

  // Profile
  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile && this.user) {
      this.profileForm = {
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone,
        licenseNumber: this.user.licenseNumber,
        dateOfBirth: this.user.dateOfBirth
      };
    }
  }

  saveProfile(): void {
    if (this.user) {
      this.user.fullName = this.profileForm.fullName;
      this.user.email = this.profileForm.email;
      this.user.phone = this.profileForm.phone;
      this.user.licenseNumber = this.profileForm.licenseNumber;
      this.user.dateOfBirth = this.profileForm.dateOfBirth;
      alert('Profile updated successfully.');
      this.isEditingProfile = false;
    }
  }

  openPasswordModal(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showPasswordModal = true;
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }

    alert('Password changed successfully.');
    this.showPasswordModal = false;
  }

  // Stats
  getTotalBookings(): number {
    return this.bookings.length;
  }

  getActiveBookings(): number {
    return this.bookings.filter(b => b.status === 'active' || b.status === 'upcoming').length;
  }

  getTotalSpent(): number {
    return this.bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0);
  }

  // Mock data
  getMockUser(): User {
    return {
      id: 'u123',
      fullName: 'John Smithson',
      email: 'jsmithson@gmail.com',
      phone: '+254 712 345 678',
      licenseNumber: 'D1234567',
      dateOfBirth: '1985-06-15',
      avatar: 'https://i.pravatar.cc/150?img=3',
      memberSince: new Date('2019-03-22')
    };
  }

  getMockBookings(): Booking[] {
    return [
      {
        id: 'b001',
        car: { make: 'Mercedes', model: 'C-Class', image: 'assets/cars/mercedes_c_class.jpg', type: 'Sedan' },
        startDate: new Date('2024-07-10'),
        endDate: new Date('2024-07-15'),
        totalPrice: 500,
        status: 'upcoming',
        pickupLocation: 'Nairobi Airport',
        returnLocation: 'Nairobi Downtown',
        bookingDate: new Date('2024-06-20')
      },
      {
        id: 'b002',
        car: { make: 'BMW', model: 'X5', image: 'assets/cars/bmw_x5.jpg', type: 'SUV' },
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-05'),
        totalPrice: 600,
        status: 'completed',
        pickupLocation: 'Mombasa City Center',
        returnLocation: 'Mombasa City Center',
        bookingDate: new Date('2024-04-15')
      },
      {
        id: 'b003',
        car: { make: 'Audi', model: 'A4', image: 'assets/cars/audi_a4.jpg', type: 'Sedan' },
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-20'),
        totalPrice: 550,
        status: 'cancelled',
        pickupLocation: 'Kisumu Airport',
        returnLocation: 'Kisumu Downtown',
        bookingDate: new Date('2024-05-30')
      },
      {
        id: 'b004',
        car: { make: 'Toyota', model: 'Land Cruiser', image: 'assets/cars/toyota_land_cruiser.jpg', type: 'SUV' },
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-07'),
        totalPrice: 700,
        status: 'active',
        pickupLocation: 'Nairobi Airport',
        returnLocation: 'Nairobi Airport',
        bookingDate: new Date('2024-06-25')
      },
      {
        id: 'b005',
        car: { make: 'Volkswagen', model: 'Golf', image: 'assets/cars/vw_golf.jpg', type: 'Hatchback' },
        startDate: new Date('2024-04-10'),
        endDate: new Date('2024-04-15'),
        totalPrice: 400,
        status: 'completed',
        pickupLocation: 'Eldoret City Center',
        returnLocation: 'Eldoret City Center',
        bookingDate: new Date('2024-03-25')
      }
    ];
  }

  getDaysUntil(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}


