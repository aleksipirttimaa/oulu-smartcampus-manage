import { Component, OnInit, Input } from '@angular/core';

import { AuditlogService, LogEntry } from '../../services/auditlog.service';
import { AuthService } from '../../services/auth.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-auditlog',
  templateUrl: './auditlog.component.html',
  styleUrls: ['./auditlog.component.css']
})
export class AuditlogComponent implements OnInit {
  @Input() auditDevice: string; /* _id */
  @Input() commentsDevice: string; /* _id */
  @Input() auditUser: string; /* username */
  @Input() auditUsers: boolean;

  allowComments = false;
  userSelfAudit = false;
  ready = false;

  newComment = '';
  
  entries: any[] = [];

  constructor(
    public authService: AuthService,

    private auditlogService: AuditlogService,
    private flashmessage: FlashmessageService,
  ) { }

  ngOnInit(): void {
    let observable;
    if (this.commentsDevice) {
      this.allowComments = true;
      observable = this.auditlogService.deviceComments(this.commentsDevice);
    } else if (this.auditDevice) {
      observable = this.auditlogService.device(this.auditDevice);
    } else if (this.auditUser) {
      this.userSelfAudit = true;
      observable = this.auditlogService.byUsername(this.auditUser);
    } else if (this.auditUsers) {
      observable = this.auditlogService.users();
    } else {
      throw 'app-auditlog: missing params';
    }

    observable.subscribe(res => {
      if (res.success) {
        let entries;
        if (res.log) {
          entries = res.log;
        } else if (res.comments) {
          entries = res.comments;
        } else {
          this.flashmessage.serviceError(`Getting log: ${res.msg}`);
          return;
        }

        entries.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime(); // descend by date
        });

        this.entries = entries;
      }
      this.ready = true;
    });
  }

  onComment(): void {
    this.auditlogService.commentDevice(this.commentsDevice, this.newComment).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Commenting failed: ${res.msg}`)
        return;
      }

      this.entries.unshift(res.comment);
      this.newComment = '';
    }, err => {
      this.flashmessage.serviceError('Commenting failed for a network issue.');
      return false;
    });
  }
}
