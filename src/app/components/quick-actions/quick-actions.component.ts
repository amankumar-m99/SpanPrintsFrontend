import { Component } from '@angular/core';
import { CustomerModalComponent } from "../customers/customer-modal/customer-modal.component";

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CustomerModalComponent],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {

}
