import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})

export class ToastComponent implements OnChanges {
  @Input() type: string = '';
  @Input() message: string = '';
  @Input() autoclose: boolean = true;
  @Input() autocloseDuration: number = 3000;
  @Output() closeAction = new EventEmitter<void>();

  bgClass = 'text-bg-primary';
  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditable']) {
      // this.otherProperty = this.isEditable ? 'EDIT' : 'VIEW';
    }
    this.setDefaults();
  }


  setDefaults(): void {
    let msg = "Toast";
    switch (this.type) {
      case "error": msg = "Error"; this.bgClass = "text-bg-danger"; break;
      case "warning": msg = "Warning"; this.bgClass = "text-bg-warning"; break;
      case "info": msg = "Info"; this.bgClass = "text-bg-info"; break;
      case "success": msg = "Success"; this.bgClass = "text-bg-success"; break;
    }
    if (this.message == null || this.message == '') {
      this.message = msg;
    }
    if (this.autoclose && this.closeAction != null) {
      setTimeout(() => this.closeButtonClicked(), this.autocloseDuration);
    }
  }

  closeButtonClicked(): void {
    if (this.closeAction != null) {
      this.closeAction.emit();
    }
  }
}
