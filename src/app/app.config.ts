import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Constant } from './constant/Constant';
import { AppStorage } from './storage/AppStorage';

const excludedUrls = Constant.EXCLUDED_URLS_FOR_ATTACHING_JWT;

const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  const token = AppStorage.getItem('token');
  // Skip if request URL matches one of the excluded endpoints
  if (!excludedUrls.some(url => req.url.includes(url)) && token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))]
};
