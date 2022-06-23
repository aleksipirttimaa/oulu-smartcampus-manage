import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewdeviceComponent } from './viewdevice.component';

describe('ViewdeviceComponent', () => {
  let component: ViewdeviceComponent;
  let fixture: ComponentFixture<ViewdeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewdeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
