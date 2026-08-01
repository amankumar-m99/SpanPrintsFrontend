import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sentencecase',
  standalone: true
})
export class SentencecasePipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    // Return empty string for null, undefined, or empty values
    if (value === null || value === undefined) return '';

    // Trim leading and trailing spaces
    const trimmed = value.trim();
    if (trimmed.length === 0) return '';

    // 1. Force everything to lowercase
    // 2. Take the first character, upper-case it, and append the rest of the string
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
}
