import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {
  @Input() modal: any;
  @Input() byId: string; /* _id */

  constructor(
    private authService: AuthService,
    private flashmessage: FlashmessageService,
  ) { }

  loading = true;

  user: any;
  validRoles = [];
  invalidRoles = [];

  userRoles = {};

  ngOnInit(): void {
    this.authService.getOtherUser(this.byId).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Fetching user state failed: ${res.msg}`);
        return;
      }
      this.user = res.user;

      if (res.user.roles?.length > 0) {
        res.user.roles.forEach(role => {
          this.userRoles[role] = true;
        });
      }
      this.loading = false;
      this.updateInvalidRoles();
    },
    err => {
      this.flashmessage.serviceError('Fetching user state failed');
      return;
    });

    this.authService.getValidRoles(this.byId).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Fetching valid roles failed: ${res.msg}`);
        return;
      }
      this.validRoles = res.roles;
      this.updateInvalidRoles();
    },
    err => {
      this.flashmessage.serviceError('Fetching valid roles failed');
      return;
    });
  }

  roleChange(role, checked): void {
    if (checked) {
      this.authService.addRoles(this.byId, [role]).subscribe(res => {
        if (!res.success) {
          this.flashmessage.serviceError(`Adding role failed: ${res.msg}`);
          return;
        }
      },
      err => {
        this.flashmessage.serviceError('Adding role failed');
        return;
      });
    } else {
      this.authService.removeRoles(this.byId, [role]).subscribe(res => {
        if (!res.success) {
          this.flashmessage.serviceError(`Removing role failed: ${res.msg}`);
          return;
        }
      },
      err => {
        this.flashmessage.serviceError('Removing role failed');
        return;
      });
    }
  }

  updateInvalidRoles(): void {
    this.invalidRoles = this.user.roles.filter(
      role => !this.validRoles.includes(role));
  }

}
