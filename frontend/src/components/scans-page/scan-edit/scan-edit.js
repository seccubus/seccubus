import Annotations from 'anglue/annotations';
import MdDrawerDecorator from '../../../decorators/drawer-decorator';
import ScanFormComponent from '../scan-form/scan-form';

export class ScanEditComponent {
  static get annotation() {
    return Annotations.getComponent('scanEdit', ScanEditComponent);
  }

  static get decorators() {
    return [
        MdDrawerDecorator
    ];
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'scanStore': 'ScanStore',
      'stateParams': '$stateParams'
    };
  }

  static get components() {
    return [
      ScanFormComponent
    ];
  }

  activate() {
    if (!this.scanStore.isLoading || !this.scanStore.isLoaded) {
      this.scanActions.loadScans(this.selectedWorkspaceId);
    }
  }

  get selectedScanId() {
    return this.stateParams.scan_id;
  }

  get selectedWorkspaceId() {
    return this.stateParams.workspace_id;
  }

  get scan() {
    if (!this._scan) {
      this._scan = this.scanStore.getById(this.selectedScanId);
    }
    return this._scan;
  }

  set scan(scan) {
    this._scan = scan;
  }

  save() {
    this.scanActions.updateScan(this.scan)
      .then(() => {
        this.closeDrawer();
      })
      .catch((error) => {
        this.lastSubmitError = error;
      });
  }
}

export default ScanEditComponent;
