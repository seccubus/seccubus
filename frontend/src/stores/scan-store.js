import Annotations from 'anglue/annotations';

import CrudStoreDecorator from 'anglue-decorators/store/crud-store';

export class ScanStore {
  static get annotation() {
    return Annotations.getStore('scan', ScanStore);
  }

  static get decorators() {
    return [
      CrudStoreDecorator
    ];
  }

  static get injections() {
    return {
      'appActions': 'AppActions'
    };
  }

  static get handlers() {
    return {
      'SCAN_LOAD_STARTED': 'onLoadStarted',
      'SCAN_LOAD_COMPLETED': 'onLoadCompleted',
      'SCAN_LOAD_FAILED': 'onLoadFailed',

      'SCAN_CREATE_STARTED': 'onCreateStarted',
      'SCAN_CREATE_COMPLETED': 'onCreateCompleted',
      'SCAN_CREATE_FAILED': 'onCreateFailed',

      'SCAN_UPDATE_STARTED': 'onUpdateStarted',
      'SCAN_UPDATE_COMPLETED': 'onUpdateCompleted',
      'SCAN_UPDATE_FAILED': 'onUpdateFailed'
    };
  }
}
export default ScanStore;
