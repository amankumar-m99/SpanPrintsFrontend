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
import { SuccessResponse } from '../../model/success-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = Constant.API_URL + '/auth';
  redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  registerUser(data: RegisterModel) {
    return this.http.post<any>(`${this.url}/register`, data);
  }

  verifyAccount(token: string) {
    return this.http.get(`${this.url}/verify?token=${token}`);
  }

  loginUser(credentials: LoginModel): Observable<any> {
    return this.http.post<any>(`${this.url}/login`, credentials).pipe(
      tap(response => {
        // Assume backend returns a JWT token
        // if (response && response.token) {
        // AppStorage.setItem('token', response.token, true);
        // }
      })
    );
  }

  getCurrentUser() {
    return this.http.get<Profile>(`${this.url}/me`);
  }

  logout(): void {
    AppStorage.removeItem('token')
    this.redirectUrl = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!AppStorage.getItem('token');
  }

  forgotPassword(email: string) {
    return this.http.post<SuccessResponse>(this.url + '/forgot-password', { email });
  }

  verifyTokenBefore(token: string){
    return this.http.post<boolean>(this.url + '/verify-token/'+token, { token });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(this.url + '/reset-password', {
      token,
      newPassword: password
    });
  }

  changePassword(payload: any) {
    return this.http.put(this.url + '/accounts/password', payload);
  }

}
