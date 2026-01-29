import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Car {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  rating: number;
  features: string[];
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

interface Stat {
  icon: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  isMenuOpen = false;
  scrolled = false;

  searchForm = {
    location: '',
    pickupDate: '',
    returnDate: '',
    carType: 'all'
  };

  featuredCars: Car[] = [
    {
      id: 1,
      name: 'Subaru Forester',
      type: 'Hybrid SUV',
      price: 2.7,
      image: '',
      rating: 4.8,
      features: ['Hybrid', 'Automatic', '5 seats', 'All-wheel drive', 'Lane-assist']
    },
    {
      id: 2,
      name: 'Range Rover Sport',
      type: 'Luxury SUV',
      price: 5.25,
      image: '',
      rating: 4.9,
      features: ['Automatic', '5 seats', 'All-wheel drive']
    },
    {
      id: 3,
      name: 'Mercedes-Benz C-Class',
      type: 'Sedan',
      price: 3.25,
      image: '',
      rating: 4.85,
      features: ['Automatic', 'Sport Mode', 'Advanced safety']
    }
  ];


  features: Feature[] = [
    {
      icon: 'dollar-sign',
      title: 'Best prices',
      description: 'Competitive rates with no hidden fees. Get the best value for your money.'
    },
    {
      icon: 'shield-check',
      title: 'Trusted by thousands',
      description: 'Reliable service with thousands of satisfied customers countrywide.'
    },
    {
      icon: 'clock',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.'
    },
    {
      icon: 'map-pin',
      title: 'Multiple Locations',
      description: 'Convenient pick-up and drop-off at various locations nationwide.'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Chantel Johnson',
      role: 'Travel Blogger',
      content: 'Renting a car through this service made my trip so much easier. The process was smooth, and the car was in excellent condition.',
      rating: 5,
      avatar: ''
    },
    {
      name: 'Micheal Chen',
      role: 'Entrepreneur',
      content: 'As a business traveler, I appreciate the efficiency and reliability of this car rental service. The vehicles are top-notch, and the customer service is outstanding.',
      rating: 4.5,
      avatar: ''
    },
    {
      name: 'Sara Lee',
      role: 'Photographer',
      content: 'I had a fantastic experience renting a car for my recent photo shoot. The car was clean, well-maintained, and perfect for my needs.',
      rating: 4.8,
      avatar: ''
    }
  ];

  stats: Stat[] = [
    {
      icon: 'car',
      value: '500+',
      label: 'Cars Available'
    },
    {
      icon: 'users',
      value: '10k+',
      label: 'Happy Customers'
    },
    {
      icon: 'location-pin',
      value: '50+',
      label: 'Locations'
    },
    {
      icon: 'star',
      value: '4.2/5',
      label: 'Average Rating'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    const today = new Date();
    this.searchForm.pickupDate = this.formatDate(today);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.searchForm.returnDate = this.formatDate(tomorrow);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.pageYOffset > 50;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSearch(): void {
    console.log('Search form submitted:', this.searchForm);
    //this.router.navigate([/'cars], { queryParams: this.searchForm });
  }

  bookCar(carId: number): void {
    console.log('Book car: ', carId);
    //this.router.navigate([/'booking', carId]);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen = false;
  }
}
