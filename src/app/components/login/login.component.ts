import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginModel } from '../../model/login.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  loginForm!: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      const loginData: LoginModel = this.loginForm.value;

      this.authService.loginUser(loginData).subscribe({
        next: () => {
          // Save rememberMe preference
          if (loginData.rememberMe) {
            localStorage.setItem('userEmail', loginData.username);
          }

          const redirect = this.authService.redirectUrl ?? '/profile';
          this.authService.redirectUrl = null;
          this.router.navigate([redirect]);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Invalid credentials or server error';
          this.loading = false;
        }
      });
    }
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
}

