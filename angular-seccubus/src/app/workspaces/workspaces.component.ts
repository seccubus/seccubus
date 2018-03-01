import { Component, OnInit } from '@angular/core';
import { Workspace } from '../workspace';

import { WORKSPACES } from '../mock-workspaces';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  workspaces = WORKSPACES;

  selectedWorkspace: Workspace;

  constructor() { }

  ngOnInit() {
  }

  onSelect(workspace: Workspace): void {
    this.selectedWorkspace = workspace;
  }

}
