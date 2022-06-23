import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { environment } from '../../environments/environment';


type _id = string;

interface Response {
  success: boolean;
  msg?: string;
}

export interface Device {
  [x: string]: any;
}

export interface DeviceResponse {
  success: boolean;
  msg?: string;
  device?: Device;
}

type DevicesResponse = Device[];

interface HomeResponse {
  nOnline?: number;
}

export interface CardsResponse {
  [x: string]: any;
}

interface QuickSearchResponse {
  success: boolean;
  msg?: string;
  result?: [Device];
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  api = environment.api;

  updateLocationFor: _id; /* used in map */
  updatedLocation: any;   /* used in updatedevice, newdevice */

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
    ) { }

  addDevice(device) {
    // returns AddResponse
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.post<Response>( this.api + '/devices/add', device, { headers });
  }

  getDeviceById(_id) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
    const body = {_id: _id};
    return this.http.post<DeviceResponse>( this.api + '/devices/getById', body, { headers });
  }

  getDeviceByDeviceId(deviceId) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
    const body = {deviceId: deviceId};
    return this.http.post<DeviceResponse>( this.api + '/devices/getByDeviceId', body, { headers });
  }

  updateDeviceById(_id, update) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    const body = {_id: _id, update: update};
    return this.http.post<Response>( this.api + '/devices/update', body, { headers });
  }

  deleteDevice(device) {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json')
      .append('Authorization', this.auth.getToken());
    return this.http.post<Response>( this.api + '/devices/delete', device, { headers });
  }

  getMap(query) {
    // returns DevicesResponse
    const params = new HttpParams(query);
    return this.http.get<DevicesResponse>(this.api + '/front-end/map', { params });
  }

  getUnmapped() {
    // returns DevicesResponse
    const headers = new HttpHeaders()
      .append('Authorization', this.auth.getToken());
    return this.http.get<DevicesResponse>(this.api + '/front-end/list-unmapped', { headers });
  }

  sensorEui(device: Device): string {
      /* full example in oulu-smartcampus-sensorstatus */
      /* utility to help convert */
      /* input Device(AABBCCDDEEFF) */
      /* return aa-bb-ff-cc-dd-ee-ff */
      const eui = device.deviceId;
      return eui.toLowerCase().replace(/(.{2})/g,"$1-").slice(0, -1);
  }

  getFrontPage() {
    return this.http.get<HomeResponse>(this.api + '/front-end/home');
  }

  getInfoCard(device) {
    return this.http.get<CardsResponse>(this.api + '/front-end/device-card/' + device._id);
  }

  quickSearch(query) {
    const body = { query };
    return this.http.post<QuickSearchResponse>(this.api + '/front-end/device-quick-search/', body);
  }
}
