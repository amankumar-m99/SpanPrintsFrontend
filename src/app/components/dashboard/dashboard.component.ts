import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { ConfirmDialogComponent } from '../utility/confirm-dialog/confirm-dialog.component';
import { HelpComponent } from '../help/help.component';
import { Constant } from '../../constant/Constant';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, ConfirmDialogComponent, RouterOutlet, HelpComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {

  sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.saveSidebarState(this.sidebarCollapsed);
  }

  constructor(private authService: AuthService) {
    this.sidebarCollapsed = this.loadSidebarState();
  }

  private loadSidebarState(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedValue = window.localStorage.getItem(Constant.sidebarStateKey);
    return storedValue === 'true';
  }

  private saveSidebarState(collapsed: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(Constant.sidebarStateKey, String(collapsed));
  }

  logout() {
    this.authService.logout();
  }
  closeSidebarOnMobile() {
    if (window.innerWidth < 992) { // Only for mobile/tablet
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('show')) {
        // Hide Bootstrap collapse
        const bsCollapse = new (window as any).bootstrap.Collapse(sidebar, { toggle: false });
        bsCollapse.hide();
      }
    }
  }

}
