import { Component, OnInit, Input } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { DeviceService, Device, DeviceResponse } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-previewdevice',
  templateUrl: './previewdevice.component.html',
  styleUrls: ['./previewdevice.component.css']
})
export class PreviewdeviceComponent implements OnInit {
  @Input() byId: string; /* _id */
  @Input() byDevice: Device; /* Object */
  @Input() byDeviceId: string; /* _id */
  @Input() mapPopup = false;

  ready = false;

  device: Device;

  constructor(
    public authService: AuthService,
    private flashmessage: FlashmessageService,

    private deviceService: DeviceService,
  ) { }

  ngOnInit(): void {
    if (this.byDevice) {
      this.device = this.byDevice;
      this.ready = true;
      return;
    }

    let deviceObservable;
    if (this.byId) {
      deviceObservable = this.deviceService.getDeviceById(this.byId);
    } else if (this.byDeviceId) {
      deviceObservable = this.deviceService.getDeviceByDeviceId(this.byDeviceId);
    } else {
      throw 'app-previewdevice: missing params';
    }

    deviceObservable.subscribe((res: DeviceResponse) => {
      this.ready = true;
      
      if (!res.success || !res.device) {
        this.flashmessage.serviceError(`Couldn't show device info: ${res.msg}`);
        return;
      }

      this.device = res.device;
    });
  }
}
