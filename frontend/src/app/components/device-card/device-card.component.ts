import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-device-card',
  templateUrl: './device-card.component.html',
  styleUrls: ['./device-card.component.css']
})
export class DeviceCardComponent implements OnInit {
  @Input() card: any;

  supportedKeys = [
    "lastSeen",
    "battery",
    "co2",
    "humidity",
    "temperature",
    "sound_avg",
    "sound_peak",
    "occupancy",
  ]

  constructor() { }

  ngOnInit(): void {
  }
}