
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Order } from '../../../model/order/order.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrl: './order-card.component.css'
})

export class OrderCardComponent {
  @Input() order !: Order;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
}
