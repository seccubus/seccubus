import Annotations from 'anglue/annotations';
import MdDrawerDecorator from '../../../decorators/drawer-decorator';
import ScanFormComponent from '../scan-form/scan-form';

export class ScanCreateComponent {
  static get annotation() {
    return Annotations.getComponent('scanCreate', ScanCreateComponent);
  }

  static get decorators() {
    return [
        MdDrawerDecorator
    ];
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'scanResource': 'ScanResource',
      'stateParams': '$stateParams'
    };
  }

  static get components() {
    return [
      ScanFormComponent
    ];
  }

  get selectedWorkspaceId() {
    return this.stateParams.workspace_id;
  }

  get scan() {
    if (!this._scan) {
      this._scan = this.scanResource.build({
        workspaceId: this.selectedWorkspaceId
      });
    }
    return this._scan;
  }

  set scan(scan) {
    this._scan = scan;
  }

  save() {
    this.scanActions.createScan(this.scan)
      .then(() => {
        this.closeDrawer();
      })
      .catch((error) => {
        this.lastSubmitError = error;
      });
  }
}

export default ScanCreateComponent;
