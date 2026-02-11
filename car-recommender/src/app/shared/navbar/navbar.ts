import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {

  constructor(private router: Router, public authService: AuthService) {}

  isMenuOpen = false;
  isLoggedIn = false;
  scrolled = false;
  
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrolled = window.pageYOffset > 50;
  }

  ngOnInit(): void {
    this.onWindowScroll();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToSection(sectionId: string): void  {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.isMenuOpen = false;
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  getStarted(): void {
    this.router.navigate(['auth/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
