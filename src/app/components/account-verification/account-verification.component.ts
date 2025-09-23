import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-account-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-verification.component.html',
  styleUrl: './account-verification.component.css'
})

export class AccountVerificationComponent implements OnInit {
  message: string | null = null;
  loading = true;
  success = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyAccount(token);
      } else {
        this.message = 'Invalid verification link.';
        this.loading = false;
        this.success = false;
      }
    });
  }

  verifyAccount(token: string) {
    this.authService.verifyAccount(token).subscribe({
      next: (res: any) => {
        this.message = res?.message || 'Your account has been verified successfully!';
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        this.message = err?.error?.message || 'Verification failed. Please contact support.';
        this.success = false;
        this.loading = false;
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
