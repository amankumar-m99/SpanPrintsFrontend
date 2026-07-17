import { Pipe, PipeTransform } from '@angular/core';

export type DaysElapsedFormat = 'DT' | 'TD' | 'T' | 'D';

@Pipe({
  name: 'daysElapsed',
  standalone: true
})
export class DaysElapsedPipe implements PipeTransform {

  transform(
    value: Date | string | number | null | undefined,
    format: DaysElapsedFormat = 'DT'
  ): string {
    if (value === undefined || value === null || value === '') return '';

    const inputDate = new Date(value);
    const now = new Date();

    if (isNaN(inputDate.getTime())) return '';

    const D = this.formatDate(inputDate);
    const T = this.calculateElapsedText(inputDate, now);

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

    // Fallback for changes within the identical minute boundary
    if (seconds < 60) {
      return 'just now';
    }

    // Minimum starting unit is now 'day'
    const intervals: { [key: string]: number } = {
      'decade': 315360000,
      'year': 31536000,
      'month': 2592000,
      'week': 604800,
      'day': 86400
    };

    const suffix = isFuture ? 'from now' : 'ago';

    for (const key in intervals) {
      const counter = Math.floor(seconds / intervals[key]);
      if (counter >= 1) {
        const plural = counter === 1 ? '' : 's';
        return `${counter} ${key}${plural} ${suffix}`;
      }
    }

    // If less than 1 day (86400 seconds) has passed, fallback to today
    return 'today';
  }

  private formatDate2(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  private formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
}

