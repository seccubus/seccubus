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
      ''
    };
  }
}
export default ScanStore;
