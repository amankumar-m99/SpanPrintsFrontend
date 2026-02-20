import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent implements OnInit {

  showPassword = false;
  alertClass = 'alert-info';
  token = '';
  loading = false;
  message = '';
  form!: FormGroup;
  isTokenVerified = false;
  isTokenValid = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    // this.token = this.route.snapshot.queryParamMap.get('token') || '';
    // this.isTokenVerified = false;
    // this.isTokenValid = false;
    // this.verifyTokenBefore();
    this.route.queryParams.subscribe(params => {
      const uuid = params['token'];
      if (uuid) {
        this.token = uuid;
        this.isTokenVerified = false;
        this.isTokenValid = false;
        this.message = '';
        this.verifyTokenBefore();
      }
      else {
        this.token = '';
        this.isTokenVerified = true;
        this.isTokenValid = false;
        this.message = 'Invalid link';
      }
    });

    // const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    // const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  }

  verifyTokenBefore() {
    this.authService.verifyTokenBefore(this.token).subscribe({
      next: (res) => {
        this.isTokenVerified = true;
        this.isTokenValid = true;
        this.message = '';
      },
      error: (err) => {
        this.isTokenVerified = true;
        this.isTokenValid = false;
        this.message = err?.error?.message || 'Invalid input or server error.';
      }
    })
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // force show validation messages
      return;
    }
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.alertClass = 'alert-danger';
      this.message = 'Passwords do not match!';
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.token, this.form.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.alertClass = 'alert-success';
          this.message = 'Password successfully updated. Redirecting to login page...';
          setTimeout(() => this.router.navigate(['/login']), 5000);
        },
        error: (err) => {
          this.loading = false;
          this.alertClass = 'alert-danger';
          this.message = err?.error?.message || 'Invalid input or server error.';
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
}
