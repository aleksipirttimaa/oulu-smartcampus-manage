import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DeviceService, Device } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-viewdevice',
  templateUrl: './viewdevice.component.html',
  styleUrls: ['./viewdevice.component.css']
})
export class ViewdeviceComponent implements OnInit {

  _id = '';
  card: any;
  device: Device;

  private routeSubscription: any;

  constructor(
    public authService: AuthService,
    public deviceService: DeviceService,

    private flashmessage: FlashmessageService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // get param id
    this.routeSubscription = this.route.params.subscribe(params => {
      this._id = params['id'];

      this.deviceService.getDeviceById(this._id).subscribe(res => {
        if (!res.success || !res.device) {
          this.flashmessage.serviceError(`Couldn't show device info: ${res.msg}`);
          return;
        }

        this.device = res.device;
        this.deviceService.getInfoCard(this.device).subscribe(res => {
          if (!res.success) {
            this.flashmessage.silentServiceError(`Couldn't get sensor status: ${res.msg}`);
            return;
          }
          if (res.card) {
            this.card = res.card;
          }
        });
      });
    });
  }
}
