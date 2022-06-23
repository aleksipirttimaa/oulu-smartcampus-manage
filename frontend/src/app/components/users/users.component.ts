import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService, UsersResponse, OtherUser } from '../../services/auth.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users = [];

  manageUser: string; /* user _id */

  constructor(
    private router: Router,
    public modalService: NgbModal,
    public authService: AuthService,
    private flashmessage: FlashmessageService,
  ) { }

  ngOnInit(): void {
    this.authService.listOtherUsers().subscribe((res: UsersResponse) => {
      if (!res && !res.success) {
        this.flashmessage.serviceError('Listing users failed: ' + res.msg);
      }
      this.users = res.users;
    },
    err => {
      this.flashmessage.serviceError('Couldn\'t list users');
      return false
    });
  }

  onRemoveClick(user): void {
    // Delete user
    const observable = this.authService.deleteOtherUser(user);
    if (!observable) {
      this.flashmessage.userError('Unknown user');
    }
    observable.subscribe(res => {
      if (res.success) {
        this.flashmessage.userSuccess('User has been removed');
      } else {
        this.flashmessage.serviceError('Deleting user failed: ' + res.msg);
      }
    },
    err => {
      this.flashmessage.serviceError('Couldn\'t delete: Fetching user state failed');
      return false;
    });
  }

  onChangePasswordClick(user): void {
    this.authService.requestOtherUserPasswordReset(user).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Couldn't reset ${user.name}'s password: ${res.msg}`);
      } else {
        this.flashmessage.userSuccess(`${user.name} password reset email sent.`);
      }
    },
    err => {
      this.flashmessage.serviceError(`Couldn't reset ${user.name}'s password: ${err}`);
    });
  }
}
