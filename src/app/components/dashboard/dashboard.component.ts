import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { HelpComponent } from '../help/help.component';

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
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    }
  }

  constructor(private authService: AuthService) { }

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
