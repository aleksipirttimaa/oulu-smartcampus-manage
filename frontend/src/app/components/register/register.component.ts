import { Component, OnInit, ɵConsole } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: String;
  username: String;
  email: String;
  password: String;
  verifyPassword: String;
  constructor(
    private validateService: ValidateService,
    private authService: AuthService,
    private flashmessage: FlashmessageService,
    private router: Router) { }

  ngOnInit(): void {
  }

  onRegisterSubmit() {
    const user = {
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password
    };

    if (!this.validateService.validateRegister(user)) {
      this.flashmessage.userError('Fill all fields');
      return false;
    }

    if (!this.validateService.validateStringMinMaxLength(user.name, 3, 50 )) {
      this.flashmessage.userError('Name needs to be between 3-50 characters.');
      return false;
    }

    if (!this.validateService.validateStringMinMaxLength(user.name, 3, 50 )) {
      this.flashmessage.userError('Username needs to be between 3-50 characters.');
      return false;
    }

    if (!this.validateService.validateEmail(user.email)) {
      this.flashmessage.userError('Invalid email');
      return false;
    }

    if (!this.validateService.validatePassword(user.password)) {
      this.flashmessage.userError('Invalid password. The password needs to be at least 10 characters.');
      return false;
    }

    // Require verified password
    if (this.password !== this.verifyPassword) {
      this.flashmessage.userError('Passwords don\'t match.');
      return false;
    }

    // Register user
    this.authService.registerUser(user).subscribe(res => {
      if ( res.success) {
        this.flashmessage.userSuccess('User is now registered and can login');
        this.router.navigate(['/register']);
      } else if ( !res.success ) {
        this.flashmessage.serviceError(res.msg);
        this.router.navigate(['/register']);
      } else {
        this.flashmessage.serviceError('Something went wrong');
        this.router.navigate(['/register']);
      }
      });
  }
}
