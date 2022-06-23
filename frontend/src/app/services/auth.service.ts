import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";

import { environment } from '../../environments/environment';
import { FlashmessageService } from './flashmessage.service';


interface SuccessResponse {
  success: boolean;
  msg?: string;
}

interface AuthResponse {
  success: boolean;
  msg: string;
  token: string;
  user: any;
}

interface DeleteResponse {
  success: boolean;
  msg: string | null;
}

interface ProfileResponse {
  user: any;
}

export interface OtherUser {
  name: string | null;
  username: string;
  roles: string[];
}

export interface UserResponse {
  success: boolean;
  msg?: string;
  user?: OtherUser;
}

export interface UsersResponse {
  success: boolean;
  msg: string | null;
  users: OtherUser[] | null;
}

export interface ValidRolesResponse {
  success: boolean;
  msg?: string;
  roles: string[];
}


@Injectable()
export class AuthService {
  authToken: any;
  user: any; /* mixed use: property and common parameter */
  api = environment.api;

  constructor(
    private flashmessage: FlashmessageService,
    private http: HttpClient
    ) {
      this.user = localStorage.getItem('user');
      this.authToken = localStorage.getItem('id_token');
    }

  //
  // Manage user
  //

  registerUser(user) {
    // returns SuccessResponse
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    return this.http.post<SuccessResponse>( this.api + '/users/register', user, { headers });
  }

  authenticateUser(user) {
    // returns AuthResponse
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');
    return this.http.post<AuthResponse>( this.api + '/users/authenticate', user, { headers });
  }

  getProfile() {
    // returns AuthResponse
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    return this.http.get<ProfileResponse>( this.api + '/users/profile', { headers });
  }

  deleteUser(): Observable<DeleteResponse> | null { 
    if (!this.user.username || this.user.username.length === 0) {
      return null;
    }

    return this.deleteOtherUser(this.user);
  }

  // Other user

  getOtherUser(_id): Observable<UserResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    const body = {_id: _id};
    return this.http.post<UserResponse>( this.api + '/users/get', body, { headers });
  }

  listOtherUsers(): Observable<UsersResponse> {
    // returns UsersResponse
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    return this.http.get<UsersResponse>( this.api + '/users/list', { headers });
  }

  deleteOtherUser(user): Observable<DeleteResponse> { 
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');

    const body = {
      username: user.username,
    };

    return this.http.post<DeleteResponse>(this.api + '/users/delete', body, { headers } );
  }

  // Password reset

  requestPasswordReset(): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    return this.http.get<SuccessResponse>( this.api + '/users/password/request-reset', { headers });
  }

  requestOtherUserPasswordReset(user): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    const username = user.username;
    return this.http.get<SuccessResponse>( this.api + '/users/password/request-reset/' + username, { headers });
  }

  resetPassword(jwt, password): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    const body = {
      jwt: jwt,
      password: password,
    };

    return this.http.post<SuccessResponse>( this.api + '/users/password/update/with-jwt', body, { headers });
  }

  //
  // Session related
  //

  storeUserData() {
    localStorage.setItem('id_token', this.authToken);
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  getToken() {
    if (this.loggedIn()) {
      return this.authToken;
    } else {
      this.flashmessage.userError('You need to be logged in to perform this action.');
      return;
    }
  }

  logOut(): void {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }

  loggedIn(): boolean {
    const helper = new JwtHelperService();
    return !helper.isTokenExpired(this.authToken);
  }

  authorizedAs(...roles: string[]): boolean {
    if (!this.loggedIn()) {
      return false;
    }

    if (!this.user) {
      /* TODO */
      return true;
    }

    if (this.user.superuser) {
      return true;
    }

    for (let role of roles) {
      if (this.user.roles?.includes(role)) {
        return true;
      }
    }

    return false;
  }

  //
  // Roles
  //

  getValidRoles(_id): Observable<ValidRolesResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    const body = {user: _id};
    return this.http.post<ValidRolesResponse>( this.api + '/users/roles/valid-for', body, { headers });
  }

  addRoles(_id, roles): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    const body = {user: _id, roles: roles};
    return this.http.post<SuccessResponse>( this.api + '/users/roles/add', body, { headers });
  }

  removeRoles(_id, roles): Observable<SuccessResponse> {
    const headers = new HttpHeaders()
      .append('Authorization', this.authToken)
      .append('Content-Type', 'application/json');
    const body = {user: _id, roles: roles};
    return this.http.post<SuccessResponse>( this.api + '/users/roles/remove', body, { headers });
  }
}

