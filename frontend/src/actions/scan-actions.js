import angular from 'angular';
import Annotations from 'anglue/annotations';

import '../resources/scan-resource';
import '../resources/scanner-resource';

export class ScanActions {
  static get annotation() {
    return Annotations.getActions('scan', ScanActions);
  }

  static get injections() {
    return {
      'scanResource': 'ScanResource',
      'scannerResource': 'ScannerResource'
    };
  }

  static get serviceActions() {
    return {
      'SCAN_LOAD': 'loadScans',
      'SCAN_CREATE': 'createScan',
      'SCAN_UPDATE': 'updateScan',
      'SCANNER_LOAD': 'loadScanners'
    };
  }

  loadScans(workspaceId) {
    return this.scanResource.query({
      workspaceId: workspaceId
    }).$promise;
  }

  loadScanners() {
    return this.scannerResource.query().$promise;
  }

  createScan(scan) {
    return scan.$create();
  }

  updateScan(scan) {
    return scan.$update();
  }
}

export default ScanActions;
