import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterModel } from '../../model/register.model';
import { passwordMatchValidator } from '../../validators/PasswordMatchValidator';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cpassword: ['', [Validators.required]],
      role: ['', [Validators.required]]   // no longer optional
    }, { validators: passwordMatchValidator });
  }

  get email() { return this.registerForm.get('email'); }
  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get cpassword() { return this.registerForm.get('cpassword'); }
  get role() { return this.registerForm.get('role'); }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();   // force show validation messages
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const userData: RegisterModel = this.registerForm.value;
    this.authService.registerUser(userData).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.loading = false;
        // this.successMessage = 'Registration successful! Redirecting to login...';
        // setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}

