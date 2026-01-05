import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginModel } from '../../model/account/login.model';
import { RegisterModel } from '../../model/account/register.model';
import { Router } from '@angular/router';
import { Constant } from '../../constant/Constant';
import { AppStorage } from '../../storage/AppStorage';
import { Profile } from '../../model/profile/profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = Constant.API_URL + '/login';

  private registerUrl = Constant.API_URL + '/register';

  private currentUserUrl = Constant.API_URL + '/me';

  private verificationUrl = Constant.API_URL + '/verify';

  // isAuthenticated = false;
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
        // if (response && response.token) {
        // AppStorage.setItem('token', response.token, true);
        // }
      })
    );
  }

  logout(): void {
    AppStorage.removeItem('token')
    this.redirectUrl = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!AppStorage.getItem('token');
  }

  getCurrentUser() {
    return this.http.get<Profile>(this.currentUserUrl);
  }
}
