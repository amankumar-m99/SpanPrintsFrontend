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

  token = '';
  loading = false;
  message = '';

  form!: FormGroup;

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
  }

  submit() {
    if (this.form.invalid) return;
    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.form.value.password!)
      .subscribe({
        next: () => {
          this.message = 'Password successfully updated.';
          this.loading = false;
        },
        error: () => {
          this.message = 'Invalid or expired token.';
          this.loading = false;
        }
      });
  }
}
