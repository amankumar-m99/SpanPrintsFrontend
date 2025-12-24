import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth/auth.service';

const authInterceptor: HttpInterceptorFn = (req, next) => new AuthInterceptor(inject(Router), inject(AuthService)).intercept(req, next);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withHashLocation()), provideHttpClient(withInterceptors([authInterceptor]))]
};
