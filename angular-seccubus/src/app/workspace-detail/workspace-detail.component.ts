import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Workspace } from '../workspace';
import { WorkspaceService} from '../workspace.service';

@Component({
  selector: 'app-workspace-detail',
  templateUrl: './workspace-detail.component.html',
  styleUrls: ['./workspace-detail.component.css']
})
export class WorkspaceDetailComponent implements OnInit {

  @Input() workspace : Workspace;

  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private location: Location
  ) { }

  ngOnInit() {
    this.getWorkspace();
  }

  getWorkspace(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.workspaceService.getWorkspace(id).subscribe(workspace => this.workspace = workspace);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    this.workspaceService.updateWorkspace(this.workspace).
      subscribe(() => this.goBack());
  }

}
