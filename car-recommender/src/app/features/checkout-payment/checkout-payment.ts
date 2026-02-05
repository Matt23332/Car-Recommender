import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Car {
  id: string;
  make: string;
  model: string;
  image: string;
  pricePerDay: number;
  type: string;
}

interface BookingDetails {
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  addOns: {
    insurance: boolean;
    gps: boolean;
    childSeat: boolean;
    additionalDriver: boolean;
  };
}

interface PaymentMethod {
  type: 'card' | 'paypal';
  icon: string;
  label: string;
}

@Component({
  selector: 'app-checkout-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-payment.html',
  styleUrls: ['./checkout-payment.css'],
})
export class CheckoutPaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentStep: 1 | 2 | 3 = 1;

  car: Car | null = null;
  bookingDetails: BookingDetails = {
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
    insurance: 20,
    gps: 10,
    childSeat: 15,
    additionalDriver: 25
  };

  contactForm = {
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: ''
  };

  paymentMethods: PaymentMethod[] = [
    { type: 'card', icon: '', label: 'Credit/Debit Card' },
    { type: 'paypal', icon: '', label: 'PayPal' } // add icons
  ];

  selectedPaymentMethod: 'card' | 'paypal' = 'card';
  cardForm = {
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  };

  agreedToTerms = false;
  isProcessing = false;
  bookingConfirmed = false;
  confirmationNumber = '';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.loadBookingFromParams();
    this.loadCarDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookingFromParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.bookingDetails = {
        pickupDate: params['pickupDate'] || '',
        returnDate: params['returnDate'] || '',
        pickupLocation: params['pickupLocation'] || '',
        returnLocation: params['returnLocation'] || '',
        addOns: {
          insurance: params['insurance'] === 'true',
          gps: params['gps'] === 'true',
          childSeat: params['childSeat'] === 'true',
          additionalDriver: params['additionalDriver'] === 'true',
        }
      };
    });
  }

  loadCarDetails(): void {
    this.car = {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      image: '',
      pricePerDay: 50,
      type: 'Sedan'
    };
  }

  calculateTotalDays(): number {
    if (!this.bookingDetails.pickupDate || !this.bookingDetails.returnDate) return 0;

    const pickup = new Date(this.bookingDetails.pickupDate);
    const returnDate = new Date(this.bookingDetails.returnDate);
    const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateCarTotal(): number {
    if (!this.car) return 0;
    return this.car.pricePerDay * this.calculateTotalDays();
  }

  calculateAddOnsTotal(): number {
    let total = 0;
    const days = this.calculateTotalDays();

    if (this.bookingDetails.addOns.insurance) total += this.addOnPrices.insurance * days;
    if (this.bookingDetails.addOns.gps) total += this.addOnPrices.gps * days;
    if (this.bookingDetails.addOns.childSeat) total += this.addOnPrices.childSeat * days;
    if (this.bookingDetails.addOns.additionalDriver) total += this.addOnPrices.additionalDriver * days;
    return total;
  }

  calculateTaxes(): number {
    const subtotal = this.calculateCarTotal() + this.calculateAddOnsTotal();
    return subtotal * 0.16;
  }

  calculateGrandTotal(): number {
    return this.calculateCarTotal() + this.calculateAddOnsTotal() + this.calculateTaxes();
  }

  goToStep(step: 1 | 2 | 3): void {
    if (step <= this.currentStep || this.validateCurrentStep()) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth'});
    }
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 3) {
        this.currentStep = (this.currentStep + 1) as 1 | 2 | 3;
        window.scrollTo({ top: 0, behavior: 'smooth'});
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep = (this.currentStep - 1) as 1 | 2 | 3;
      window.scrollTo({ top: 0, behavior: 'smooth'});
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateContactForm();
      case 2:
        return this.validatePaymentForm();
      case 3:
        return true;
      default:
        return false;
    }
  }

  validateContactForm(): boolean {
    if (!this.contactForm.fullName || !this.contactForm.email || !this.contactForm.phone || !this.contactForm.licenseNumber) {
      alert('Please fill in contact details.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactForm.email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    return true;
  }

  validatePaymentForm(): boolean {
    if (this.selectedPaymentMethod === 'card') {
      if (!this.cardForm.cardNumber || !this.cardForm.cardHolderName || !this.cardForm.expiryDate || !this.cardForm.cvv) {
        alert('Please fill in card details.');
        return false;
      }

      const cardNumber = this.cardForm.cardNumber.replace(/\s/g, '');
      if (cardNumber.length !== 16 || isNaN(Number(cardNumber))) {
        alert('Please enter a valid card number.');
        return false;
      }

      if (this.cardForm.cvv.length < 3 || this.cardForm.cvv.length > 4 || isNaN(Number(this.cardForm.cvv))) {
        alert('Please enter a valid CVV.');
        return false;
      }
    }
    if (!this.agreedToTerms) {
      alert('You must agree to the terms and conditions.');
      return false;
    }
    return true;
  }

  confirmBooking(): void {
    if (!this.validatePaymentForm()) return;

    this.isProcessing = true;

    setTimeout(() => {
      this.isProcessing = false;
      this.bookingConfirmed = true;
      this.confirmationNumber = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }, 2000);
  }

  downloadConfirmation(): void {
    alert('Downloading confirmation...');
  }

  goToDashboard(): void {
    this.router.navigate(['./dashboard']);
  }

  formatCardNumber(value: string): void {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    this.cardForm.cardNumber = formatted;
  }

  formatExpiryDate(value: string): void {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      this.cardForm.expiryDate = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    } else {
      this.cardForm.expiryDate = cleaned;
    }
  }
}