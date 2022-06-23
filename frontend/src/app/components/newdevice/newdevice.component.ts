import { Component, OnInit, ɵConsole } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { DeviceService } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-newdevice',
  templateUrl: './newdevice.component.html',
  styleUrls: ['./newdevice.component.css']
})

export class NewdeviceComponent implements OnInit {
  /* state */
  deviceId: string;
  deviceType = 'Elsys ERS CO2';
  location: any;
  description = "No description available";
  status = 'installed';
  installed: NgbDateStruct;
  floorlevel = '1';
  image: ImageData;
  user: {name: '', username: null, email: null, _id: null};
  
  /* options */
  statusOptions = [];
  deviceTypeOptions = [];
  floorLevelOptions = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private calendar: NgbCalendar,
    private flashmessage: FlashmessageService,
    private dateFormatter: NgbDateParserFormatter,
    private configService: ConfigService,
    private deviceService: DeviceService,
  ) { }

  ngOnInit(): void {
    if (this.deviceService.updatedLocation) {
      this.location = this.deviceService.updatedLocation;
    } else {
      this.router.navigate(['/map']);
    }
    //Get profile information
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
    },
    err => {
      this.flashmessage.serviceError('Something went wrong');
      return false;
    });

    /* options */
    this.configService.config.subscribe(config => {
      this.deviceTypeOptions = config.device.types;
      this.floorLevelOptions = config.device.levels;
      this.statusOptions = config.device.userStatuses;
    });
  }

  onRegisterSubmit() {
    const device = {
      deviceId: this.deviceId,
      deviceType: this.deviceType,
      description: this.description,
      image: this.image,
      status: this.status,
      installed: this.dateFormatter.format(this.installed),
      floorLevel: this.floorlevel,
      location: this.deviceService.updatedLocation,
      addedByUser: this.user._id
    };

    // Register device
    this.deviceService.addDevice(device).subscribe(res => {
      if (res.success) {
        this.flashmessage.userSuccess('Device Added');
        this.router.navigate(['/map'], { queryParams: { activateByDeviceId: this.deviceId } });
      } else if (!res.success) {
        this.flashmessage.serviceError(`Adding failed: ${res.msg}`);
        this.router.navigate(['/newdevice']);
      } else {
        this.flashmessage.serviceError('Something went wrong');
        this.router.navigate(['/map']);
      }
    });
  }

  clearInstalled(): void {
    this.installed = null;
  }

  installedNow(): void {
    this.installed = this.calendar.getToday();
  }
}
