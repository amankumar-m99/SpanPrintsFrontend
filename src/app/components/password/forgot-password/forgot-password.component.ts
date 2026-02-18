
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  alertClass = 'alert-info';
  loading = false;
  message = '';
  errorMessage = '';

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    this.authService.forgotPassword(this.form.value.email!)
      .subscribe({
        next: () => {
          this.alertClass = 'alert-success';
          this.message = 'If the email exists, a reset link has been sent.';
          this.loading = false;
        },
        error: (err) => {
          this.alertClass = 'alert-danger';
          this.message = err?.error?.message || 'Invalid credentials or server error.';
          this.loading = false;
        }
      });
  }

  get email() { return this.form.get('email'); }
}
