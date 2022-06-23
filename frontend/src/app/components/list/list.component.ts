import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DeviceService } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  constructor(
    private flashmessage: FlashmessageService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private router: Router,
  ) { }

  devices = [];
  unmapped: any[];

  newSearch = '';
  neverSearched = true;

  ngOnInit(): void {
    if (this.authService.authorizedAs("device-manager")) {
      this.deviceService.getUnmapped().subscribe(res => {
        this.unmapped = res;
      })
    }
  }

  onSearch() {
    this.neverSearched = false;

    if (this.newSearch.length < 3) {
      return;
    }

    this.deviceService.quickSearch(this.newSearch).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Couldn't perform search: ${res.msg}`);
        return;
      }


      if (res.result.length === 1) {
        // unique, open page immediately
        this.router.navigate(['/viewdevice', res.result[0]._id]);
        return;
      } else {
        this.devices = res.result;
      }
    });
  }
}
