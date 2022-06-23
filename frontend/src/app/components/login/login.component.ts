import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String;
  password: String;


  constructor(
    private router: Router,
    private authService: AuthService,
    private flashmessage: FlashmessageService
    ) { }

  ngOnInit(): void {
  }

  onLoginSubmit() {
    const user = {
      username: this.username,
      password: this.password
    };

    this.authService.authenticateUser(user).subscribe(res => {
      if (res.success) {
        this.authService.authToken = res.token;
        this.authService.user = res.user;
        this.authService.storeUserData();
        this.flashmessage.userSuccess(res.msg);
        this.router.navigate(['/profile']);
      } else if (!res.success) {
        this.flashmessage.userError(res.msg);
      } else {
        this.flashmessage.serviceError('Something went wrong');
        this.router.navigate(['/login']);
      }
    });
  }
}
