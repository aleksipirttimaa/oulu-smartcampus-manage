import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

interface Device {
  levels: [string];
  types: [string];
  userStatuses: [string];
}

interface Map {
  jumpTo: any;
}

interface Config {
  device: Device,
  map: Map,
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private api = environment.api;

  private _config: Observable<Config>;

  private fetched: Date;

  constructor(
    private http: HttpClient
  ) { }

  get config() {
    return this.request();
  }

  private request() {
    return this.http.get<Config>(this.api + '/front-end/config');
  }
}
