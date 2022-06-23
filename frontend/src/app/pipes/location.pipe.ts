import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'location'
})
export class LocationPipe implements PipeTransform {

  transform(location: any): string {
    if (location?.coordinates) {
      return `${location.coordinates[0]}, ${location.coordinates[1]}`;
    } else {
      return `No location`;
    }
  }

}
