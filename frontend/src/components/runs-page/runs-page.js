import Annotations from 'anglue/annotations';

export class RunsPageComponent {
  static get annotation() {
    return Annotations.getComponent('runsPage', RunsPageComponent);
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'runActions': 'RunActions',
      'runStore': 'RunStore',
      'scanStore': 'ScanStore',
      'stateParams': '$stateParams',
      'state': '$state'
    };
  }

  get selectedWorkspaceId() {
    return this.stateParams.workspace_id;
  }

  get selectedScanId() {
    return this.stateParams.scan_id;
  }

  /**
   * When this component activates we refresh the data
   */
  activate() {
    this.runStore.initialize();
    this.scanActions.loadScans(this.selectedWorkspaceId);
  }

  get selectedScan() {
    if (!this._selectedScan && this.selectedScanId) {
      var selectedScan = this.scanStore.getById(this.selectedScanId);
      if (selectedScan) {
        this._selectedScan = selectedScan;
        this.onScanSelect(selectedScan);
      }
    }

    return this._selectedScan;
  }

  set selectedScan(scan) {
    if (scan !== this._selectedScan) {
      this._selectedScan = scan;
      this.onScanSelect(scan);
    }
  }

  onScanSelect(scan) {
    this.runActions.loadRuns(this.selectedWorkspaceId, scan.id);
    this.state.go(this.state.current.name, Object.assign({}, this.stateParams, {
      scan_id: scan.id
    }));
  }

  get runs() {
    return this.runStoreStore.items;
  }
}

export default RunsPageComponent;
