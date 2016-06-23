import Annotations from 'anglue/annotations';

export class FindingsPageComponent {
  static get annotation() {
    return Annotations.getComponent('findingsPage', FindingsPageComponent);
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'scanStore': 'ScanStore',
      'findingActions': 'FindingActions',
      'findingStore': 'FindingStore',
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
    this.findingStore.initialize();
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
    this.renderedFindings = null;
    this.findingActions.loadFindings(this.selectedWorkspaceId, scan.id);
    this.state.go(this.state.current.name, Object.assign({}, this.stateParams, {
      scan_id: scan.id
    }));
  }

  get renderedFindings() {
    if (!this._renderedFindings && this.findingStore.isLoaded) {
      this._renderedFindings = [];
      this.renderMoreFindings();
    }
    return this._renderedFindings;
  }

  set renderedFindings(renderedFindings) {
    this._renderedFindings = renderedFindings;
  }

  renderMoreFindings() {
    if (this._renderedFindings && this.findingStore.isLoaded) {
      let renderedFindingsCount = this._renderedFindings.length;
      this._renderedFindings = this._renderedFindings.concat(
        this.findingStore.items.slice(renderedFindingsCount, renderedFindingsCount + 20)
      );
    }
  }
}

FindingsPageComponent.annotation.module.directive('whenScrollEnds', () => {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var threshold = 200;

      element.on('scroll', (e) => {
        var visibleHeight = element[0].clientHeight;
        var scrollableHeight = element[0].scrollHeight;
        var hiddenContentHeight = scrollableHeight - visibleHeight;

        if (hiddenContentHeight - element[0].scrollTop <= threshold) {
          // Scroll is almost at the bottom. Loading more rows
          scope.$apply(attrs.whenScrollEnds);
        }
      });
    }
  };
});

export default FindingsPageComponent;
