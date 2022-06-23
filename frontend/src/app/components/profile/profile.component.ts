import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private flashmessage: FlashmessageService
  ) { }

  ngOnInit(): void {
    //Get profile information
    this.authService.getProfile().subscribe(res => {
      this.user = res.user;
      this.authService.user = res.user;
      this.authService.storeUserData();
    },
    err => {
      this.flashmessage.serviceError('Fetching user state failed');
      return false;
    });
  }

  onRemove(): void {
    // Delete user
    const observable = this.authService.deleteUser()
    if (!observable) {
      this.flashmessage.serviceError('Unknown username');
    }
    observable.subscribe(res => {
      if (res.success) {
        this.flashmessage.userSuccess('Your user has been removed, you can now log out');
      } else {
        this.flashmessage.serviceError('Deleting user failed: ' + res.msg);
      }
    },
    err => {
      this.flashmessage.serviceError('Fetching user state failed');
      return false;
    });
  }

  onChangePassword(): void {
    this.authService.requestPasswordReset().subscribe(res => {
      if (!res.success) {
        this.flashmessage.userError(`Couldn't reset your password: ${res.msg}`);
      } else {
        this.flashmessage.userSuccess(`Password reset email sent.`);
      }
    },
    err => {
      this.flashmessage.serviceError(`Couldn't reset your password: ${err}`);
    });
  }
}
