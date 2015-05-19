import Annotations from 'anglue/annotations';

export class ScanFormComponent {
  static get annotation() {
    return Annotations.getComponent('scanForm', ScanFormComponent);
  }

  static get bindings() {
    return {
      'scan': 'scan',
      'submitError': 'submitError'
    };
  }

  static get template() {
    return {
      url: '/seccubus/v2/src/components/scans-page/scan-form/scan-form.html'
    };
  }

  static get injections() {
    return {
      'scanActions': 'ScanActions',
      'scannerStore': 'ScannerStore'
    };
  }

  static get events() {
    return {
      'onCancel': 'cancel',
      'onSubmit': 'submit'
    };
  }

  /**
   * When this component activates we refresh the data
   */
  activate() {
    this.scanActions.loadScanners();
  }

  onScannerChange() {
    this.scan.parameters = this.getScannerByName(this.scan.scanner).params;
  }

  getScannerByName(scannerName) {
    var scanners = this.scannerStore.items;

    for (let i = 0, ln = scanners.length; i < ln; i++) {
      let scanner = scanners[i];
      if (scanner.name === scannerName) {
        return scanner;
      }
    }
  }

  get scannerHelp() {
    if (this.scan.scanner) {
      return this.getScannerByName(this.scan.scanner).help;
    }
  }

  submit() {
    this.fireComponentEvent('submit', {
      value: this.scan
    });
  }

  cancel() {
    this.fireComponentEvent('cancel');
  }
}

export default ScanFormComponent;
