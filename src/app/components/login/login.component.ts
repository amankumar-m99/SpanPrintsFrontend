import { Component, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginModel } from '../../model/account/login.model';
import { CommonModule } from '@angular/common';
import { AppStorage } from '../../storage/AppStorage';
import { GrecaptchaComponent } from "../grecaptcha/grecaptcha.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, GrecaptchaComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  loginForm!: FormGroup;
  showPassword = false;
  loading = false; // track backend call state
  errorMessage: string | null = null;
  googleReCaptchaToken = '';
  grecaptcha = viewChild<GrecaptchaComponent>('grecaptcha');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [true]
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();   // force show validation messages
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    const loginData: LoginModel = this.loginForm.value;
    this.authService.loginUser(loginData, this.googleReCaptchaToken).subscribe({
      next: (response) => {
        this.loading = false;
        AppStorage.setItem('token', response.token, loginData.rememberMe);
        AppStorage.setItem('userEmail', loginData.username, loginData.rememberMe);
        const redirect = this.authService.redirectUrl ?? '/dashboard';
        this.authService.redirectUrl = null;
        this.router.navigate([redirect]);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Invalid credentials or server error.';
        this.loading = false;
        this.resetCaptcha();
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forgot-password']);
  }

  gotoRegister(): void {
    this.router.navigateByUrl('register');
  }

  onCaptchaResolved(token: string) {
    this.googleReCaptchaToken = token;
  }

  resetCaptcha() {
    this.grecaptcha()?.resetCaptcha();
  }
}
