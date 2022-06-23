import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { FlashmessageService } from '../../services/flashmessage.service';
import { ValidateService } from '../../services/validate.service'

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  username = "";
  password = "";
  verifyPassword = "";

  jwt = "";
  expired: Date;

  constructor(
    private route: ActivatedRoute,
    private router: Router,

    private authService: AuthService,
    private flashmessage: FlashmessageService,
    private validateService: ValidateService,
  ) { }

  ngOnInit(): void {
    // jwt param
    this.route.queryParams.subscribe(params => {
      if (params.jwt) {
        this.jwt = params.jwt;
        this.initJwt()
      }
    });
  }

  initJwt(): void {
    let payload = this.jwt.split(/\.(.+)\.+/)[1] 

    let json;
    try {
      json = atob(payload);
    } catch (err) {
      console.error(err);
      this.jwt = "";
      this.flashmessage.userError('You may have the wrong link: token base64 decode failed.');
      return;
    }

    let token;
    try {
      token = JSON.parse(json);
    } catch (err) {
      console.error(err);
      this.jwt = "";
      this.flashmessage.userError('You may have the wrong link: parsing token JSON failed.');
      return;
    }

    if (token.exp < new Date().getTime() / 1000) {
      this.expired = new Date(token.exp * 1000);
    }

    this.username = token.data.usr;
  }

  submit(): void {
    // validate password
    if (!this.validateService.validatePassword(this.password)) {
      this.flashmessage.userError('Invalid password. The password needs to be at least 10 characters.');
      return;
    }

    // matching password
    if (this.password !== this.verifyPassword) {
      this.flashmessage.userError('Passwords don\'t match.');
      return;
    }

    this.authService.resetPassword(this.jwt, this.password).subscribe(res => {
      if (res.success) {
        this.flashmessage.userSuccess('Your password is reset and you can login');
        this.router.navigate(['/login']);
      } else if (!res.success) {
        this.flashmessage.serviceError(`Couldn't reset password: ${res.msg}`);
      }
    },
    err => {
      this.flashmessage.serviceError(`Couldn't reset your password: ${err}`);
    });
  }
}
