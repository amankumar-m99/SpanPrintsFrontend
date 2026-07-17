import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayRelative',
  standalone: true
})
export class DayRelativePipe implements PipeTransform {

  transform(value: Date | string | number | null | undefined): string {
    // Gracefully handle missing values
    if (value === undefined || value === null || value === '') return '';

    const inputDate = new Date(value);
    // Invalid date validation
    if (isNaN(inputDate.getTime())) return '';

    // Strip time to calculate absolute difference in calendar days
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const inputMidnight = new Date(inputDate.getTime());
    inputMidnight.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((inputMidnight.getTime() - todayMidnight.getTime()) / msPerDay);

    // Present Day
    if (diffDays === 0) return 'today';

    // Future Days
    if (diffDays > 0) {
      if (diffDays === 1) return 'tomorrow';
      if (diffDays === 2) return 'day after tomorrow';

      return this.formatFutureUnits(diffDays);
    }

    // Past Days
    const absolutePastDays = Math.abs(diffDays);
    if (absolutePastDays === 1) return 'yesterday';

    return this.formatPastUnits(absolutePastDays);
  }

  private formatFutureUnits(days: number): string {
    if (days < 7) return `${days} days from today`;

    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} from today`;

    const months = Math.floor(days / 30.44); // Average days in a month
    if (days < 365) return `${months} ${months === 1 ? 'month' : 'months'} from today`;

    const years = Math.floor(days / 365.25);
    return `${years} ${years === 1 ? 'year' : 'years'} from today`;
  }

  private formatPastUnits(days: number): string {
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;

    const months = Math.floor(days / 30.44);
    if (days < 365) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

    const years = Math.floor(days / 365.25);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
