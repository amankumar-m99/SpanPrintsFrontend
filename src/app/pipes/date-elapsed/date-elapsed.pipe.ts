import { Pipe, PipeTransform } from '@angular/core';

export type DateElapsedFormat = 'DT' | 'TD' | 'T' | 'D';

@Pipe({
  name: 'dateElapsed',
  standalone: true
})
export class DateElapsedPipe implements PipeTransform {

  transform(
    value: Date | string | number | null | undefined, 
    format: DateElapsedFormat = 'TD'
  ): string {
    // Explicitly return an empty string for undefined, null, or falsy inputs
    if (value === undefined || value === null || value === '') return '';

    const inputDate = new Date(value);
    const now = new Date();
    
    // Invalid date check
    if (isNaN(inputDate.getTime())) return '';

    const D = this.formatDate2(inputDate);
    const T = this.calculateElapsedText(inputDate, now);

    // Format output mapping based on user argument
    switch (format) {
      case 'DT':
        return `${D} (${T})`;
      case 'T':
        return T;
      case 'D':
        return D;
      case 'TD':
      default:
        return `${T} (${D})`;
    }
  }

  private calculateElapsedText(inputDate: Date, now: Date): string {
    const diffInMs = now.getTime() - inputDate.getTime();
    const isFuture = diffInMs < 0;
    const seconds = Math.floor(Math.abs(diffInMs) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }

    const intervals: { [key: string]: number } = {
      'decade': 315360000, // 365 days * 10
      'year': 31536000,    // 365 days
      'month': 2592000,    // 30 days
      'week': 604800,
      'day': 86400,
      'hour': 3600,
      'minute': 60
    };

    const suffix = isFuture ? 'from now' : 'ago';

    for (const key in intervals) {
      const counter = Math.floor(seconds / intervals[key]);
      if (counter >= 1) {
        const plural = counter === 1 ? '' : 's';
        return `${counter} ${key}${plural} ${suffix}`;
      }
    }

    return 'just now';
  }

  private formatDate2(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
