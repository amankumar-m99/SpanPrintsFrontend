import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AccountVerificationComponent } from './components/account-verification/account-verification.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { GuestGuard } from './guards/guest/guest.guard';

export const routes: Routes = [
    {
        path: 'login', component: LoginComponent, canActivate: [GuestGuard]
    },
    {
        path: 'register', component: RegisterComponent, canActivate: [GuestGuard]
    },
    {
        path: 'verify', component: AccountVerificationComponent, canActivate: [GuestGuard]
    },
    {
        path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
        children: [
            {
                path: 'profile', component: ProfileComponent
            }
        ]
    },
    {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
    }
];
