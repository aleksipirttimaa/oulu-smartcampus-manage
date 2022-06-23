import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { DeviceService } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

interface DeviceUpdate {
  deviceId?: string;
  deviceType?: string;
  location?: any;
  description?: string;
  status?: string;
  installed?: string;
  floorLevel?: string;
  image?: ImageData | null;
}

@Component({
  selector: 'app-updatedevice',
  templateUrl: './updatedevice.component.html',
  styleUrls: ['./updatedevice.component.css']
})
export class UpdatedeviceComponent implements OnInit {

  constructor(
    private calendar: NgbCalendar,
    private dateFormatter: NgbDateParserFormatter,
    private flashmessage: FlashmessageService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private configService: ConfigService,
    public deviceService: DeviceService,
  ) { }

  installedModel: NgbDateStruct;

  /* state */
  deviceId = '';
  deviceType = '';
  location: any;
  description = '';
  status = '';
  installed: string; /* ISO 8601 */
  floorLevel = '';
  userFullName = '';
  image: ImageData;

  _id = '';
  oldDevice: DeviceUpdate;
  
  private routeSubscription: any;
  loading = true;

  forcePatchKeys = [];
  
  /* options */
  statusOptions = [];
  deviceTypeOptions = [];
  floorLevelOptions = [];

  ngOnInit(): void {
    if (this.deviceService.updatedLocation) {
      this.location = this.deviceService.updatedLocation;
      this.deviceService.updatedLocation = null;
      this.forcePatchKeys.push('location');
    }

    // get param id
    this.routeSubscription = this.route.params.subscribe(params => {
      const _id = params['id'];
      this._id = _id;
      // view device of id
      this.deviceService.getDeviceById(_id).subscribe(res => {
        this.loading = false;
        if (!res.success) {
          this.flashmessage.serviceError(res.msg);
          return;
        }

        this.oldDevice = res.device;

        /* view */
        this.deviceId = res.device.deviceId;
        this.deviceType = res.device.deviceType;
        this.description = res.device.description;
        this.status = res.device.status;
        this.installed = res.device.installed ?? null;
        this.floorLevel = res.device.floorLevel;

        /* updatedLocation overrides response */
        if (!this.location && res.device.location) {
          this.location = res.device.location;
        }

        // TODO: show image

        this.installedModel = this.dateFormatter.parse(this.installed);

        /* view user name */
        const user_id = res.device.addedByUser;
        this.authService.getOtherUser(user_id).subscribe(res => {
          if (!res.success || !res.user) {
            this.flashmessage.serviceError('Failed fetching user details');
            this.userFullName = "Unknown user";
            return;
          }
          this.userFullName = res.user.name;
        });
      });
    });

    /* options */
    this.configService.config.subscribe(config => {
      this.deviceTypeOptions = config.device.types;
      this.floorLevelOptions = config.device.levels;
      this.statusOptions = config.device.userStatuses;
    });
  }

  /* update */
  onUpdateSubmit(): void {
    let update: DeviceUpdate = {};
    let oldDevice = this.oldDevice;
    if (!oldDevice.image) {
      oldDevice.image = null;
    }
    if (!oldDevice.installed) {
      oldDevice.installed = null;
    }
    Object.keys(oldDevice).forEach(key => {
      if (this.oldDevice[key] != this[key]) {
        if (key === "addedByUser") {
          return;
        }
        update[key] = this[key];
      }

    });

    this.forcePatchKeys.forEach(key => {
      update[key] = this[key];
    });
    
    this.deviceService.updateDeviceById(this._id, update).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Failed to update ${res.msg}`);
        return;
      }
      this.flashmessage.userSuccess('Sensor updated');
      this.router.navigate(['/viewdevice', this._id], { queryParams: { activateById: this._id} });
    });
  }

  clearInstalled(): void {
    this.installed = null;
    this.installedModel = null;
  }

  clearLocation(): void {
    this.location = null;
  }

  installedNow(): void {
    this.installedModel = this.calendar.getToday();
    this.installed = new Date().toISOString();
  }

  selectInstalled(event): void {
    this.installed = this.dateFormatter.format(event);
  }
}
