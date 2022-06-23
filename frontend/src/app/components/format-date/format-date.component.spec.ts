import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatDateComponent } from './format-date.component';

describe('FormatDateComponent', () => {
  let component: FormatDateComponent;
  let fixture: ComponentFixture<FormatDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormatDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
