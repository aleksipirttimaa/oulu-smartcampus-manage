import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewdeviceComponent } from './previewdevice.component';

describe('PreviewdeviceComponent', () => {
  let component: PreviewdeviceComponent;
  let fixture: ComponentFixture<PreviewdeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewdeviceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
