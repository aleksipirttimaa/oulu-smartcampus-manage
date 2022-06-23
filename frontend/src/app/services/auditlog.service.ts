import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface SuccessResponse {
  success: boolean;
  msg?: string;
}

interface AuditResponse extends SuccessResponse {
  log?: [LogEntry];
}

interface CommentResponse extends SuccessResponse {
  comment?: LogEntry;
}

interface CommentsResponse extends SuccessResponse {
  comments?: [LogEntry];
}


export interface LogEntry {
  callee: string;
  calleeFullName: string;
  date: Date;
  method: string;
  userId?: string;
  deviceId?: string;
  as?: string;
  fields?: string;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditlogService {

  api = environment.api;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
  ) { }

  users(): Observable<AuditResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.get<AuditResponse>( this.api + '/audit/users', { headers });
  }

  byUsername(username: string): Observable<AuditResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.get<AuditResponse>( this.api + '/audit/by-username/' + username, { headers });
  }

  device(_id: string): Observable<AuditResponse> {
    let headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    let type = 'minimalPublic';
    
    if (this.auth.authorizedAs('device-manager')) {
      headers = new HttpHeaders()
        .append('Content-Type', 'application/json')
        .append('Authorization', this.auth.getToken());
      type = 'minimal';
    }

    return this.http.get<AuditResponse>( this.api + '/audit/device/' + _id + '/' + type, { headers });
  }

  deviceComments(_id: string): Observable<CommentsResponse> {
    let headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());

    return this.http.get<CommentsResponse>( this.api + '/audit/comments/device/' + _id, { headers });
  }

  commentDevice(_id: string, comment: string): Observable<CommentResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());

    let body = {
      _id: _id,
      comment: comment,
    };

    return this.http.post<CommentResponse>( this.api + '/audit/comment/device', body, { headers });
  }
}
