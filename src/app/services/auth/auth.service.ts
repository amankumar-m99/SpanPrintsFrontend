import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginModel } from '../../model/login.model';
import { RegisterModel } from '../../model/register.model';
import { User } from '../../model/user.model';
import { Router } from '@angular/router';
import { Constant } from '../../constant/Constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = Constant.API_URL + '/login';

  private registerUrl = Constant.API_URL + '/account';

  private currentUserUrl = Constant.API_URL + '/me';

  private verificationUrl = Constant.API_URL + '/verify';

  isAuthenticated = false;
  redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  registerUser(data: RegisterModel) {
    return this.http.post<any>(this.registerUrl, data);
  }

  verifyAccount(token: string) {
    return this.http.get(`${this.verificationUrl}?token=${token}`);
  }

  loginUser(credentials: LoginModel): Observable<any> {
    return this.http.post<any>(this.loginUrl, credentials).pipe(
      tap(response => {
        // Assume backend returns a JWT token
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticated = true;
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticated = false;
    this.redirectUrl = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    return this.http.get<User>(this.currentUserUrl);
  }
}
