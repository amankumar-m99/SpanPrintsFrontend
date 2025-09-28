import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppStorage } from '../storage/AppStorage';
import { Constant } from '../constant/Constant';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor {
    constructor(private router: Router, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
        const token = AppStorage.getItem('token');
        const excludedUrls = Constant.EXCLUDED_URLS_FOR_ATTACHING_JWT;

        // Exclude login and register endpoints
        const isAuthRequest =
            req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/verify');

        let clonedReq = req;
        if (!excludedUrls.some(url => req.url.includes(url)) && token) {
            clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next(clonedReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // token expired or invalid → force logout
                    AppStorage.removeItem('token')
                    this.authService.redirectUrl = this.router.url;
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}
