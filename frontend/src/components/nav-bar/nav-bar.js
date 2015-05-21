import Annotations from 'anglue/annotations';

export class NavBar {
  static get annotation() {
    return Annotations.getComponent('navBar', NavBar);
  }

  static get injections() {
    return {
      'workspaceStore': 'WorkspaceStore',
      'workspaceActions': 'WorkspaceActions',
      'sideNav': '$mdSidenav',
      'state': '$state',
      'stateParams': '$stateParams'
    };
  }

  static get template() {
    return {
      url: '/seccubus/v2/src/components/nav-bar/nav-bar.html'
    };
  }

  activate() {
    this.workspaceActions.loadWorkspaces();
  }

  toggleNavMenu() {
    this.sideNav('nav-menu').toggle();
  }

  get selectedWorkspaceId() {
    return this.stateParams.workspace_id;
  }

  get selectedWorkspace() {
    if (!this._selectedWorkspace && this.selectedWorkspaceId) {
      var selectedWorkspace = this.workspaceStore.getById(this.selectedWorkspaceId);
      if (selectedWorkspace) {
        this._selectedWorkspace = selectedWorkspace;
      }
    }

    return this._selectedWorkspace;
  }

  set selectedWorkspace(workspace) {
    if (workspace !== this._selectedWorkspace) {
      this._selectedWorkspace = workspace;
      this.onWorkspaceSelect(workspace);
    }
  }

  get currentPage() {
    return this.state.current.title;
  }

  onWorkspaceSelect(workspace) {
    this.state.go(this.state.current.name, Object.assign({}, this.stateParams, {
      workspace_id: workspace.id
    }));
  }
}

export default NavBar;
