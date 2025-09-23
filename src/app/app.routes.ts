import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth/auth.guard';
import { AccountVerificationComponent } from './components/account-verification/account-verification.component';

export const routes: Routes = [
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path: 'verify', component: AccountVerificationComponent
    },
    {
        path: 'profile', component: ProfileComponent, canActivate: [authGuard]
    },
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    }
];
