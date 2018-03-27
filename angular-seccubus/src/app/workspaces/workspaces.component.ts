import { Component, OnInit } from '@angular/core';

import { Workspace } from '../workspace';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  workspaces : Workspace[];

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.getWorkspaces();
  }

  getWorkspaces(): void {
    this.workspaceService.getWorkspaces()
      .subscribe(workspaces => this.workspaces = workspaces);
  }

  addWorkspace(name: string): void {
    name = name.trim();
    if ( !name) { return; }
    const newWorkspace = {
      name        : name,
      lastScan    : null,
      scanCount   : 0
    }
    this.workspaceService.addWorkspace(newWorkspace as Workspace).
      subscribe(workspace =>  {
        this.workspaces.push(workspace);
      });
  }
}
