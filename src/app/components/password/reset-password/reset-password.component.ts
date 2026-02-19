import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent implements OnInit {

  alertClass = 'alert-info';
  token = '';
  loading = false;
  message = '';
  form!: FormGroup;
  isTokenVerified = false;
  isTokenValid = false;

  constructor(
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
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.isTokenVerified = false;
    this.isTokenValid = false;
    this.verifyTokenBefore();
    // this.route.paramMap.subscribe(params => {
    //   const uuid = params.get('token');
    //   if (uuid) {
    //     this.token = uuid;
    //     this.isTokenVerified = false;
    //     this.isTokenValid = false;
    //     this.verifyTokenBefore();
    //   }
    // });
  }

  verifyTokenBefore() {
    this.authService.verifyTokenBefore(this.token).subscribe({
      next: (res) => {
        this.isTokenVerified = true;
        this.isTokenValid = true;
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
      this.message = 'Passwords do not match';
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.token, this.form.value.password!)
      .subscribe({
        next: () => {
          this.alertClass = 'alert-success';
          this.message = 'Password successfully updated.';
          this.loading = false;
        },
        error: (err) => {
          this.alertClass = 'alert-danger';
          this.message = err?.error?.message || 'Invalid input or server error.';
          this.loading = false;
        }
      });
  }


  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }
}
