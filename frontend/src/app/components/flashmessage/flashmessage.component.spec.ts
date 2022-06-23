import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashmessageComponent } from './flashmessage.component';

describe('FlashmessageComponent', () => {
  let component: FlashmessageComponent;
  let fixture: ComponentFixture<FlashmessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlashmessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
