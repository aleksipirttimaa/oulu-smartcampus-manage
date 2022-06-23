import {Injectable} from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { FlashmessageService } from '../services/flashmessage.service';

@Injectable()
export class AuthGuard implements CanActivate{
  constructor(
    private router: Router,
    private authService: AuthService,
    private flashmessage: FlashmessageService
    ) {}

  canActivate(){
    if (this.authService.loggedIn()) {
      return true;
    } else {
      this.flashmessage.userError('You need to be logged in to access this.');
      this.router.navigate(['/login']);
    }
  }

}
