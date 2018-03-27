import { TestBed, inject } from '@angular/core/testing';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceService]
    });
  });

  it('should be created', inject([WorkspaceService], (service: WorkspaceService) => {
    expect(service).toBeTruthy();
  }));
});
