import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  nOnline = 431; /* manual default */

  constructor(
    public authService: AuthService,
    private deviceService: DeviceService,
  ) { }

  ngOnInit(): void {
    this.deviceService.getFrontPage().subscribe(result => {
      if (result.nOnline && result.nOnline > 2) {
        this.nOnline = result.nOnline;
      } else {
        console.warn('Home: Couldn\'t set nOnline');
      }
    },
    err => {
      console.warn('Home: Couldn\'t fetch front page');
    });
  }
}
