import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateElapsed',
  standalone: true
})
export class DateElapsedPipe implements PipeTransform {

  transform(value: Date | string | number | null | undefined): string {
    // Explicitly return an empty string for undefined, null, or falsy inputs
    if (value === undefined || value === null || value === '') return '';

    const inputDate = new Date(value);
    const now = new Date();

    // Invalid date check
    if (isNaN(inputDate.getTime())) return '';

    const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

    // Handle future dates or just now
    if (seconds < 60) {
      return `just now (${this.formatDate(inputDate)})`;
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

    for (const key in intervals) {
      const counter = Math.floor(seconds / intervals[key]);
      if (counter >= 1) {
        const plural = counter === 1 ? '' : 's';
        const elapsedText = `${counter} ${key}${plural} ago`;
        return `${elapsedText} (${this.formatDate(inputDate)})`;
      }
    }

    return this.formatDate(inputDate);
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
