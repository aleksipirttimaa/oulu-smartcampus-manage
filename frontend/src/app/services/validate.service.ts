import { Injectable } from '@angular/core';

@Injectable()
export class ValidateService {

  constructor() { }

  validateRegister(user) {
    // Validate register input fields
    if (user.name === undefined || user.username === undefined || user.email === undefined || user.password === undefined) {
      return false;
    } else {
      return true;
    }
  }

  validateEmail(email) {
    // Test if input conforms to email regex
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validatePassword(password){
    //Test if password fills required security details
    if ( password.length >= 10 ) {
      return true;
    } else {
      return false;
    }
  }

  validateStringMinMaxLength( stringValue, min, max ) {
    if ( max >= stringValue.length && stringValue.length >= min) {
      return true;
    } else {
      return false;
    }
  }
}
