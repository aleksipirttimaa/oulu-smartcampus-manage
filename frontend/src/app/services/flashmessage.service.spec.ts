import { TestBed } from '@angular/core/testing';

import { FlashmessageService } from './flashmessage.service';

describe('FlashmessageService', () => {
  let service: FlashmessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlashmessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
