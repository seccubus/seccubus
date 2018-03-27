import { Component, OnInit } from '@angular/core';
import { Workspace } from '../workspace';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
export class DashboardComponent implements OnInit {
  workspaces: Workspace[] = [];

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.getWorkspaces();
  }

  getWorkspaces(): void {
    this.workspaceService.getWorkspaces()
      .subscribe(workspaces => this.workspaces = workspaces.slice(1, 5));
  }
}
