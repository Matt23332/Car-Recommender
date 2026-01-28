import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit {
  isLogin = true;
  authForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
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
    this.initializeForm();
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      console.log('Form data: ', this.authForm.value);
      if (this.isLogin) {
        alert('Login successful!');
      } else {
        alert('Registration successful!');
      }
    } else {
      this.markFormGroupTouched(this.authForm);
      alert('Please fill out the form correctly before submitting.');
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  forgotPassword(): void {
    alert('Password reset link has been sent. Check your email.');
  }

  socialLogin(provider: string): void {
    alert(`${provider} login clicked`);
  }

  get email() { return this.authForm.get('email'); }
  get password() { return this.authForm.get('password'); }
  get fullName() { return this.authForm.get('fullName'); }
  get phone() { return this.authForm.get('phone'); }
  get licenseNumber() { return this.authForm.get('licenseNumber'); }
  get dateOfBirth() { return this.authForm.get('dateOfBirth'); }
  get termsOfAgreement() { return this.authForm.get('termsOfAgreement'); }
}

