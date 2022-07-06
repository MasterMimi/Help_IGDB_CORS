import { TestBed } from '@angular/core/testing';

import { GameplaysService } from './gameplays.service';

describe('GameplaysService', () => {
  let service: GameplaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameplaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
