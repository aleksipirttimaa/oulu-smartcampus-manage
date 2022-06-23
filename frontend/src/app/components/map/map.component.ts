import { Component, ComponentFactoryResolver, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { DeviceService } from '../../services/device.service';
import { FlashmessageService } from '../../services/flashmessage.service';

import { PreviewdeviceComponent } from '../previewdevice/previewdevice.component';

declare let L;

function levelKey(level) {
  const key = String(level).replace(/[^0-9-]/g, '');
  if (key.length == 0) {
    throw "Empty level key";
  }
  return key
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: any;
  canAddDevice: boolean = false;
  activeDevice: any;
  activeMarker: any;
  canDeleteDevice: boolean = false;
  canModifyDevice: boolean = false;

  ready = false;

  showAdminControls: boolean = true;

  devicePopups: any[];

  supportedLevels: string[];
  hiddenLevels: string[] = [];
  floorLevelLayers: {[key: string]: any} = {};

  jumpTo = {};
  jumpToKeys: string[];

  location = L.icon({
    iconUrl: 'assets/location.svg',
    iconSize:     [10, 10], // size of the icon
    iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -5] // point from which the popup should open relative to the iconAnchor
  });

  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private flashmessage: FlashmessageService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private configService: ConfigService,
    public deviceService: DeviceService,
  ) { }

  ngOnInit(): void {
    this.configService.config.subscribe(config => {
      this.jumpTo = config.map.jumpTo;
      this.supportedLevels = config.device.levels;

      this.jumpToKeys = Object.keys(this.jumpTo);
    });

    this.showAdminControls = this.authService.authorizedAs("device-manager");

    this.devicePopups = [];

    // begin map setup
    this.map = L.map('map');

    // query params
    this.route.queryParams
        .subscribe(params => {
          if (params.activateById) {
            this.deviceService.getDeviceById(params.activateById).subscribe(response => {
              if (!response.success || !response.device) {
                this.flashmessage.serviceError(`Failed activation: ${response.msg}`);
                return;
              }
              const device = response.device;

              const location = device.location.coordinates;
              this.map.setView(location, 19); /* location, zoom */
            });
          } else if (params.activateByDeviceId) {
            this.deviceService.getDeviceByDeviceId(params.activateByDeviceId).subscribe(response => {
              if (!response.success || !response.device) {
                this.flashmessage.serviceError(`Failed activation: ${response.msg}`);
                return;
              }
              const device = response.device;

              const location = device.location.coordinates;
              this.map.setView(location, 19); /* location, zoom */
            });
          } else if (params.viewPlace) {
            this.configService.config.subscribe(config => {
              if (config.map.jumpTo[params.viewPlace]) {
                const location = config.map.jumpTo[params.viewPlace];
                this.map.setView(location[0], location[1]);
              } else {
                this.flashmessage.serviceError(`Unknown place`);
              }
            });
          }
        });

    const initialView = [[65.0591022, 25.4665], 16]; // Linnanmaa

    this.map.setView(initialView[0], initialView[1]);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: 5,
        maxZoom: 25
    }).addTo(this.map);

    // prevent user from zooming in too much
    this.map.setMaxZoom(19);

    // geolocation
    this.map.locate({setView: false});
    this.map.on('locationfound', this.onLocationFound.bind(this));
    this.map.on('zoomend', this.onZoomEnd.bind(this));

    // add linnanmaa campus overlay
    this.addCampusOverlay(this.map);

    // click event handling(add marker)
    this.map.on('click', this.addNewDevice.bind(this));

    // all devices from  db
    this.deviceService.getMap({}).subscribe(devices => {
      this.addDevicesOverlay(devices);
      this.ready = true;
    });
  }

  onLocationFound(event) {
    // Draw user location on map
    L.marker(event.latlng, {icon: this.location} ).addTo(this.map)
        .bindPopup('You are within ' + event.accuracy + ' meters from this point');

    // draws a circle with radius of event.accuracy(max size 50meters)
    if (event.accuracy > 50) {
      L.circle(event.latlng, 50).addTo(this.map);
    } else {
      L.circle(event.latlng, event.accuracy).addTo(this.map);
    }
  }

  addCampusOverlay(map) {
    // Adds a campus overlay to given map
    const svgElement = 'assets/map.png';
    const svgElementBounds = [[65.06202, 25.46249], [65.056335, 25.47145]];
    L.imageOverlay(svgElement, svgElementBounds).addTo(map);
  }

  addDevicesOverlay(devices) {
    // create layers
    for (const level of this.supportedLevels) {
      this.floorLevelLayers[levelKey(level)] = L.layerGroup();

      // add this layer by default
      this.floorLevelLayers[levelKey(level)].addTo(this.map);
    }

    // populate layers
    for (const device of devices) {
      this.addMarkerToMap(device);
    }

    // open popup if needed
    this.route.queryParams.subscribe(params => {
      if (params.activateByDeviceId) {
        const popup = this.devicePopups.find(popup => popup.deviceId === params.activateByDeviceId);
        if (popup) {
          popup.popup.openPopup();
        }
      }
      if (params.activateById) {
        const popup = this.devicePopups.find(popup => popup._id === params.activateById);
        if (popup) {
          popup.popup.openPopup();
        }
      }
    });

    // cleanup supported levels
    for (const level of this.supportedLevels) {
      const nDevices = this.floorLevelLayers[level].getLayers().length;
      if (nDevices == 0) {
        this.supportedLevels = this.supportedLevels.filter(x => x != level);
      }
    }
  }

  addMarkerToMap(device){
    // saves device parameters into popup as html(will be replaced with proper code)
    const popup = () => {
      let preview = document.createElement('preview-content');

      const factory = this.componentFactoryResolver
        .resolveComponentFactory(PreviewdeviceComponent);

      const previewComponentRef = factory.create(this.injector, [], preview);
      previewComponentRef.instance.byId = `${device._id}`;
      previewComponentRef.instance.mapPopup = true;

      /*TODO: fix badness BUGBUG */
      previewComponentRef.instance.device = device; 
      previewComponentRef.instance.ready = true;

      previewComponentRef.changeDetectorRef.detectChanges();
      /* */

      return preview;
    }

    // place device marker on the map
    const marker = L.marker([device.location.coordinates[0], device.location.coordinates[1]],
        { icon: this.createIcon(device) })
      .addTo(this.floorLevelLayers[levelKey(device.floorLevel)])
      //.addTo(this.map)
    let markerPopup = marker.bindPopup(popup);
    markerPopup.on('popupopen', () => {
      this.activeDevice = device;
      this.activeMarker = marker;
      this.canDeleteDevice = true;
      this.canModifyDevice = true;

      const params = { activateById: device._id };
      this.router.navigate([], 
        {
          relativeTo: this.route,
          queryParams: params, 
          queryParamsHandling: 'merge',
        }
      );
    });
    markerPopup.on('popupclose', () => {
      this.activeDevice = undefined;
      this.activeMarker = null;
      this.canDeleteDevice = false;
      this.canModifyDevice = false;

      const params = { activateById: null, activateByDeviceId: null, };
      this.router.navigate([], 
        {
          relativeTo: this.route,
          queryParams: params, 
          queryParamsHandling: 'merge',
        }
      );
    });

    this.devicePopups.push({
      _id: device._id,
      deviceId: device.deviceId,
      popup: markerPopup,
    });
  }

  deleteDevice(){
    this.deviceService.deleteDevice(this.activeDevice).subscribe(res => {
      if (res.success) {
        this.flashmessage.userSuccess('Device removed');
        this.activeMarker.remove();
      } else if (!res.success) {
        this.flashmessage.serviceError(res.msg);
      } else {
        this.flashmessage.serviceError('Something went wrong');
      }
    });
  }

  modifyDevice(){
    if (this.activeDevice._id) {
      this.router.navigate(['/updatedevice', this.activeDevice._id.trim()]);
    } else {
      console.warn('Can\'t navigate: _id not set');
    }
  }

  createIcon(device) {
    let iconurl;
    if (device.deviceType === 'Elsys ERS CO2') {
      if (device.status === 'offline') {
        iconurl = 'assets/co2-red.svg';
      } else {
        iconurl = 'assets/co2.svg';
      }
    } else if (device.deviceType === 'Elsys ERS Sound') {
      if (device.status === 'offline') {
        iconurl = 'assets/sound-red.svg';
      } else {
        iconurl = 'assets/sound.svg';
      }
    } else if (device.deviceType === 'Elsys ELT-2 with soil moisture') {
      if (device.status === 'offline') {
        iconurl = 'assets/soil-red.svg';
      } else {
        iconurl = 'assets/soil.svg';
      }
    } else {
      if (device.status === 'offline') {
        iconurl = 'assets/other-red.svg';
      } else {
        iconurl = 'assets/other.svg';
      }
    }

    const icon = L.icon({
      iconUrl: iconurl,
      iconSize:     [20, 20], // size of the icon
      iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
      popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
    });
    return icon;
  }

  onZoomEnd(event) {
    //let layer;
    //for ( layer of Object.keys(this.map._layers)) {
    //  console.log(this.map._layers);
    //  console.log(layer);
    //}
    //console.log(this.map._layers.layer._icon);
  }

  onMapLevelFilter(event) {
    const level = levelKey(event.target.textContent);
    if (this.hiddenLevels.length == 0) {
      /* hide all but selected */
      for (const l of this.supportedLevels) {
        if (l != level) {
          this.hiddenLevels.push(l);
          this.floorLevelLayers[l].remove();
        }
      }
    } else if (!this.hiddenLevels.includes(level) && this.hiddenLevels.length == this.supportedLevels.length - 1) {
      /* unhide all but selected */
      for (const l of this.supportedLevels) {
        if (l != level) {
          this.hiddenLevels = this.hiddenLevels.filter(x => x != l);
          this.floorLevelLayers[l].addTo(this.map);
        }
      }
    } else if (!this.hiddenLevels.includes(level)) {
      /* hide selected */
      this.hiddenLevels.push(level);
      this.floorLevelLayers[level].remove();
    } else {
      /* unhide selected */
      this.hiddenLevels = this.hiddenLevels.filter(x => x != level);
      this.floorLevelLayers[level].addTo(this.map);
    }
  }

  onMapJumpTo(event: any) {
    const params = { viewPlace: event.target.textContent };
    this.router.navigate([], 
      {
        relativeTo: this.route,
        queryParams: params, 
        queryParamsHandling: null,
      }
    );
  }

  onMapViewDebug(event) {
    // easy coordinate fetching
    console.debug("Current view:", [this.map.getCenter(), this.map.getZoom()]);
  }

  addNewDevice(event) {
    if (this.deviceService.updateLocationFor) {
      const device = this.deviceService.updateLocationFor;
      this.deviceService.updateLocationFor = null;

      const location = {
        type: 'Point',
        coordinates: [event.latlng.lat, event.latlng.lng],
      }
      this.deviceService.updatedLocation = location;

      this.router.navigate(['/updatedevice', device]);
    } else if (this.canAddDevice) {
      this.canAddDevice = false;

      const location = {
        type: 'Point',
        coordinates: [event.latlng.lat, event.latlng.lng],
      }
      this.deviceService.updatedLocation = location;

      this.router.navigate(['/newdevice']);
    }
  }

  cancelLocationUpdate(): void {
    const device = this.deviceService.updateLocationFor;
    this.deviceService.updateLocationFor = null;
    this.router.navigate(['/updatedevice', device]);
  }
}
