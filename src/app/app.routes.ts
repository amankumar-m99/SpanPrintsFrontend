import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AccountVerificationComponent } from './components/account-verification/account-verification.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { GuestGuard } from './guards/guest/guest.guard';
import { OrdersComponent } from './components/orders/orders.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { EarningsComponent } from './components/earnings/earnings.component';
import { ReportsComponent } from './components/reports/reports.component';
import { UpdatePasswordComponent } from './components/update-password/update-password.component';
import { AddOrderComponent } from './components/add-order/add-order.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
    { path: 'verify', component: AccountVerificationComponent, canActivate: [GuestGuard] },
    {
        path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
        children: [
            { path: 'profile', component: ProfileComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'add-order', component: AddOrderComponent },
            { path: 'expenses', component: ExpensesComponent },
            { path: 'earnings', component: EarningsComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'update-password', component: UpdatePasswordComponent }
        ]
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
