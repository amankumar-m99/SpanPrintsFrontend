import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {

  transform(bytes: number | string | null | undefined, decimalPlaces: number = 2): string {
    // Handle empty, null, or zero values
    if (bytes === null || bytes === undefined || bytes === '') return '0 Bytes';
    
    const parsedBytes = Number(bytes);
    if (isNaN(parsedBytes) || parsedBytes < 0) return '0 Bytes';
    if (parsedBytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimalPlaces < 0 ? 0 : decimalPlaces;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    // Calculate which unit index to use
    const i = Math.floor(Math.log(parsedBytes) / Math.log(k));

    // Handle extreme cases out of bounds of the units array
    if (i >= sizes.length) {
      return `${parseFloat((parsedBytes / Math.pow(k, sizes.length - 1)).toFixed(dm))} ${sizes[sizes.length - 1]}`;
    }

    // Format the number and append the unit
    return `${parseFloat((parsedBytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
