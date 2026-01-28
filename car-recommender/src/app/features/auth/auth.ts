import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
//import { GoogleAuthProvider, signInWithPopUp } from 'firebase/auth';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit {
  isLogin = true;
  authForm!: FormGroup;
  errorMessage = '';
  isLoading = false;
  returnUrl = '/dashboard';

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.initializeForm();
  }

  initializeForm(): void {
    if (this.isLogin) {
      this.authForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rememberMe: [false]
      });
    } else {
      this.authForm = this.formBuilder.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
        licenseNumber: ['', [Validators.required, Validators.minLength(5)]],
        dateOfBirth: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        termsOfAgreement: [false, [Validators.requiredTrue]]
      });
    }
  }

  toggleForm(): void {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.initializeForm();
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      if (this.isLogin) {
        this.authService.login(this.authForm.value).subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            this.router.navigate([this.returnUrl]);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.authService.register(this.authForm.value).subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.router.navigate([this.returnUrl]);
          },
          error: (error) => {
            this.errorMessage = error.message;
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.authForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  forgotPassword(): void {
    const email = this.authForm.get('email')?.value;

    if (!email) {
      alert('Please enter your email address to reset your password.');
      return;
    }

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        alert('Password reset instructions have been sent to your email.');
      },
      error: (error) => {
        alert(error.message);
      }
    });
  }

  socialLogin(provider: string): void {
    console.log(`${provider} login clicked`);
  }

  signInWithGoogle(): void {
  }

  signInWithFacebook(): void {}

  get email() { return this.authForm.get('email'); }
  get password() { return this.authForm.get('password'); }
  get fullName() { return this.authForm.get('fullName'); }
  get phone() { return this.authForm.get('phone'); }
  get licenseNumber() { return this.authForm.get('licenseNumber'); }
  get dateOfBirth() { return this.authForm.get('dateOfBirth'); }
  get termsOfAgreement() { return this.authForm.get('termsOfAgreement'); }
}

