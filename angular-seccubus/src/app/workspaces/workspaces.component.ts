import { Component, OnInit } from '@angular/core';
import { Workspace } from '../workspace';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  workspace: Workspace = {
    id : 1,
    name : "Windstorm"
  }

  constructor() { }

  ngOnInit() {
  }

}
