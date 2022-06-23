import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlashmessageService {

  public messages = new Subject<String[]>();

  userSuccess(message) {
    /* confirm that an action was successfull */
    this.messages.next([message]);
  }

  userError(message) {
    /* warn that an action was unsuccessfull due to user error */
    this.messages.next([message]);
  }

  serviceError(message) {
    /* warn that an action was unsuccessfull due to our error */
    /* TODO: report these */
    this.messages.next([message]);
  }

  silentServiceError(message) {
    /* action was unsuccessfull, but it is not necessary to bother */
    /* the user with this info */
    /* TODO: report these */
  }

}
