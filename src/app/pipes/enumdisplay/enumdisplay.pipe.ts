import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumdisplay',
  standalone: true
})
export class EnumdisplayPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    // Return empty string for null, undefined, or empty values
    if (value === null || value === undefined) return '';

    // 1. Trim leading and trailing spaces
    // 2. Replace all underscores with spaces using global regex split/join or replaceAll
    return value.trim().replace(/_/g, ' ');
  }
}
