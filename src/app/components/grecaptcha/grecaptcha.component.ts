declare var grecaptcha: any;

import { Component, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { Constant } from '../../constant/Constant';

@Component({
  selector: 'app-grecaptcha',
  standalone: true,
  imports: [],
  templateUrl: './grecaptcha.component.html',
  styleUrl: './grecaptcha.component.css'
})
export class GrecaptchaComponent implements AfterViewInit {

  @Output() onCaptchaResolved = new EventEmitter<string>();
  @ViewChild('captchaContainer') captchaContainer!: ElementRef;
  widgetId!: number;

  ngAfterViewInit() {
    this.initReCaptcha();
  }

  private initReCaptcha() {
    // Check if grecaptcha AND the render function are actually available
    if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.render !== 'undefined') {
      this.widgetId = grecaptcha.render(this.captchaContainer.nativeElement, {
        'sitekey': Constant.G_RE_CAPTCHA_SITE_KEY,
        'callback': (response: string) => this.onCaptchaResolved.emit(response)
      });
    } else {
      // Wait 100ms and try again
      setTimeout(() => this.initReCaptcha(), 100);
    }
  }

  resetCaptcha() {
    // Use the global grecaptcha object to reset the widget
    if (typeof grecaptcha !== 'undefined') {
      // grecaptcha.reset();
      grecaptcha.reset(this.widgetId);
    }
  }
}
