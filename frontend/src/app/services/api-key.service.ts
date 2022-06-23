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

interface SomeApiKey {
  _id: string;
  created: Date;
  name: string;
  owner: string;
}

export interface OtherUserApiKey extends SomeApiKey {
  ownerFullName: string;
}

export interface ApiKey extends SomeApiKey {
  name: string;
  key: string;
}

interface ApiKeyResponse extends SuccessResponse {
  apiKey?: ApiKey;
}

interface ApiKeysResponse extends SuccessResponse {
  apiKeys?: ApiKey[];
}

interface OtherUserApiKeysResponse extends SuccessResponse {
  otherUserApiKeys?: OtherUserApiKey[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {

  api = environment.api;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
    ) { }

  add(name: string): Observable<ApiKeyResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    const body = { name: name };
    return this.http.post<ApiKeyResponse>( this.api + '/apikeys/add', body, { headers });
  }

  delete(_id: string): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    const body = { _id: _id };
    return this.http.post<SuccessResponse>( this.api + '/apikeys/delete', body, { headers });
  }

  get(_id: string): Observable<ApiKeyResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    const body = { _id: _id };
    return this.http.post<ApiKeyResponse>( this.api + '/apikeys/delete', body, { headers });
  }

  list(): Observable<ApiKeysResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.post<ApiKeysResponse>( this.api + '/apikeys/list', {}, { headers });
  }

  listAll(): Observable<OtherUserApiKeysResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.post<OtherUserApiKeysResponse>( this.api + '/apikeys/listAll', {}, { headers });
  }
}
