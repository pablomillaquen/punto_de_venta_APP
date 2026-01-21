import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clpCurrency',
  standalone: true
})
export class ClpCurrencyPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value === null || value === undefined) return '';
    
    // Convert to number and round to integer (no decimals for CLP usually)
    const numValue = Math.round(Number(value));
    
    // Format with thousands separator 'de-DE' uses dots for thousands
    return '$' + numValue.toLocaleString('de-DE');
  }

}
