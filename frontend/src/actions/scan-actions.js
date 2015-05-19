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
      'scannerResource': 'ScannerResource',
      'promise': '$q'
    };
  }

  static get serviceActions() {
    return {
      'SCAN_LOAD': 'loadScans',
      'SCAN_CREATE': 'createScan',
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
}

export default ScanActions;
