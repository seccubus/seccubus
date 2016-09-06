import Annotations from 'anglue/annotations';

import ScanCreateComponent from './scan-create/scan-create';
import ScanEditComponent from './scan-edit/scan-edit';

export class ScansPageComponent {
  static get annotation() {
    return Annotations.getComponent('scansPage', ScansPageComponent);
  }

  static get components() {
      return [
          ScanCreateComponent,
          ScanEditComponent
      ];
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'scanStore': 'ScanStore',
      'stateParams': '$stateParams'
    };
  }

  get selectedWorkspaceId() {
    return this.stateParams.workspace_id;
  }

  /**
   * When this component activates we refresh the data
   */
  activate() {
    this.scanActions.loadScans(this.selectedWorkspaceId);
  }
}

export default ScansPageComponent;
